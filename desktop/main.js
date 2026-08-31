// Electron shell for Artless Clash Royale.
//
// The game is plain ES modules talking to same-origin /api/* endpoints, so the
// desktop app simply runs the real server.js in-process on 127.0.0.1 and points
// a window at it. That keeps saves (/api/save -> save.json), module loading,
// and the multiplayer menu behaving exactly like `node server.js` + a browser.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { createClashServer } = require('../server.js');

// Smoke-test mode (ACR_SMOKE=1): boot everything windowless-invisible, report
// whether the page loaded cleanly, then quit. Used to verify packaged builds.
const SMOKE = !!process.env.ACR_SMOKE;

// A fixed port keeps the origin (http://127.0.0.1:8123) stable across runs so
// localStorage (theme, quick-save mirror) persists. If it's taken we fall back
// to an ephemeral port — progress still persists via save.json in userData.
const PREFERRED_PORT = 8123;

// Squirrel.Windows installer lifecycle. The installer relaunches the app with
// --squirrel-* flags; on install/update we ask Update.exe to create the
// Desktop + Start Menu shortcuts, on uninstall to remove them, then exit
// without showing a window. Returns true when this launch was such an event.
function handleSquirrelEvent() {
    if (process.platform !== 'win32' || process.argv.length < 2) return false;
    const cmd = process.argv[1];
    if (typeof cmd !== 'string' || !cmd.startsWith('--squirrel-')) return false;

    const { spawnSync } = require('child_process');
    // Installed layout: <root>\Update.exe , <root>\app-<version>\<this exe>
    const updateExe = path.resolve(process.execPath, '..', '..', 'Update.exe');
    const exeName = path.basename(process.execPath);
    const run = (args) => {
        try { spawnSync(updateExe, args, { timeout: 30000 }); } catch (e) { /* best effort */ }
    };

    switch (cmd) {
        case '--squirrel-install':
        case '--squirrel-updated':
            run([`--createShortcut=${exeName}`]);
            app.quit();
            return true;
        case '--squirrel-uninstall':
            run([`--removeShortcut=${exeName}`]);
            app.quit();
            return true;
        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
    return false; // includes --squirrel-firstrun: launch normally
}

// Stable taskbar identity (the Squirrel convention). Without it Windows derives
// an identity from the exe path, which churns every update (app-x.y.z folders)
// and can leave the taskbar clinging to stale icon lookups.
app.setAppUserModelId('com.squirrel.artless-clash-royale.Artless Clash Royale');

// Only one copy of the game at a time (a second one would fight over the port
// and the save file); launching again just focuses the existing window.
if (handleSquirrelEvent()) {
    // Installer event handled above; the app is quitting.
} else if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    let win = null;

    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    // Saves live in the per-user app-data folder (the install dir is read-only).
    // e.g. C:\Users\<you>\AppData\Roaming\Artless Clash Royale\save.json
    const startServer = () => new Promise((resolve, reject) => {
        const server = createClashServer({
            webRoot: path.join(__dirname, '..', 'web'),
            dataDir: app.getPath('userData'),
            log: false
        });
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port busy (e.g. a second app, or dev server) — take any free one.
                server.removeAllListeners('listening');
                server.listen(0, '127.0.0.1', () => resolve(server));
            } else {
                reject(err);
            }
        });
        server.listen(PREFERRED_PORT, '127.0.0.1', () => resolve(server));
    });

    const createWindow = (port) => {
        // The canvas is 540x960 portrait and scales itself to fit, so pick a
        // 9:16 window that fits comfortably on this screen.
        const { screen } = require('electron');
        const work = screen.getPrimaryDisplay().workAreaSize;
        const height = Math.min(960, Math.round(work.height * 0.92));
        const width = Math.round(height * (540 / 960));

        win = new BrowserWindow({
            width,
            height,
            useContentSize: true,
            minWidth: 270,
            minHeight: 480,
            backgroundColor: '#236480',
            autoHideMenuBar: true,
            show: !SMOKE,
            icon: path.join(__dirname, '..', 'build', 'icon.ico'),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true
            }
        });

        // Any external link (there are none today) opens in the real browser.
        win.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });

        if (SMOKE) {
            let failed = false;
            win.webContents.on('console-message', (e, level, message) => {
                if (level >= 3) { // error
                    failed = true;
                    console.error('[smoke] page error:', message);
                }
            });
            win.webContents.on('did-fail-load', (e, code, desc) => {
                console.error('[smoke] did-fail-load:', code, desc);
                app.exit(1);
            });
            win.webContents.on('did-finish-load', () => {
                // Give the game a moment to boot its module graph.
                setTimeout(() => {
                    console.log(failed ? '[smoke] FAIL' : '[smoke] OK — page loaded clean');
                    app.exit(failed ? 1 : 0);
                }, 2500);
            });
        }

        win.loadURL(`http://127.0.0.1:${port}/`);
    };

    app.whenReady().then(async () => {
        try {
            const server = await startServer();
            const port = server.address().port;
            createWindow(port);

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
            });
        } catch (err) {
            console.error('Failed to start game server:', err);
            app.exit(1);
        }
    });

    app.on('window-all-closed', () => {
        app.quit(); // portrait game, no reason to linger on macOS either
    });
}
