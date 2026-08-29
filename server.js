const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.woff2': 'font/woff2',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml'
};

// Build the game server. Options let the Electron desktop shell reuse this
// exact server with a different save location (the installed app directory is
// read-only, so saves go to the per-user data folder instead of ./bin):
//   webRoot  - directory of static client files   (default: ./web)
//   dataDir  - directory holding save.json        (default: ./bin)
//   log      - set false to silence request logs
function createClashServer(options = {}) {
    const WEB_ROOT = options.webRoot || path.join(__dirname, 'web');
    const DATA_DIR = options.dataDir || path.join(__dirname, 'bin');
    const SAVE_FILE = path.join(DATA_DIR, 'save.json');
    const log = options.log === false ? () => { } : console.log;

    // Ensure save directory exists
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // --- MULTIPLAYER LOGIC ---
    const rooms = {}; // { code: { clients: [], lastAction: null } }

    function generateCode() {
        let code;
        do {
            code = Math.floor(10000 + Math.random() * 90000).toString();
        } while (rooms[code]);
        return code;
    }

    const server = http.createServer((req, res) => {
        // CORS headers for all responses
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        log(`${req.method} ${req.url}`);

        // --- API ROUTES ---

        // Health check (used by the client to detect a reachable backend)
        if (req.url === '/api/health' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
            return;
        }

        // Create Room
        if (req.url === '/api/create' && req.method === 'POST') {
            const code = generateCode();
            rooms[code] = { clients: [] };
            log(`Room created: ${code}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, code: code }));
            return;
        }

        // Join Room (SSE)
        if (req.url.startsWith('/api/join') && req.method === 'GET') {
            const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
            const code = urlParams.get('code');

            if (!code || !rooms[code]) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: "Room not found" }));
                return;
            }

            if (rooms[code].clients.length >= 2) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: "Room full" }));
                return;
            }

            // SSE Setup
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            const clientId = Date.now();
            const newClient = {
                id: clientId,
                res: res
            };
            rooms[code].clients.push(newClient);

            const playerIndex = rooms[code].clients.length - 1; // 0 or 1
            log(`Client ${clientId} joined room ${code} as P${playerIndex}`);

            // Notify client of their index logic could go here if needed,
            // but for now we just verify connection.
            res.write(`data: ${JSON.stringify({ type: 'joined', playerIndex: playerIndex })}\n\n`);

            // If 2 players, notify start
            if (rooms[code].clients.length === 2) {
                rooms[code].clients.forEach(c => {
                    c.res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);
                });
            }

            // Cleanup on close
            req.on('close', () => {
                log(`Client ${clientId} disconnected from room ${code}`);
                if (rooms[code]) {
                    rooms[code].clients = rooms[code].clients.filter(c => c.id !== clientId);
                    if (rooms[code].clients.length === 0) {
                        delete rooms[code];
                        log(`Room ${code} deleted (empty)`);
                    } else {
                        // Notify remaining player
                        rooms[code].clients.forEach(c => {
                            c.res.write(`data: ${JSON.stringify({ type: 'opponent_disconnected' })}\n\n`);
                        });
                    }
                }
            });
            return;
        }

        // Action (Spawn)
        if (req.url === '/api/action' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const code = data.code;

                    if (rooms[code]) {
                        // Broadcast to ALL clients in room; the frontend
                        // filters its own echoes where it needs to.
                        rooms[code].clients.forEach(c => {
                            c.res.write(`data: ${JSON.stringify({ type: 'action', data: data })}\n\n`);
                        });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(404);
                        res.end(JSON.stringify({ success: false, message: "Room not found" }));
                    }
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, error: e.message }));
                }
            });
            return;
        }

        // Save/Load API (Existing)
        if (req.url === '/api/save' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    // Verify and Format JSON
                    const parsed = JSON.parse(body);
                    fs.writeFileSync(SAVE_FILE, JSON.stringify(parsed, null, 4));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    console.error("Save error:", err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: err.message }));
                }
            });
            return;
        }

        if (req.url === '/api/load' && req.method === 'GET') {
            if (fs.existsSync(SAVE_FILE)) {
                const data = fs.readFileSync(SAVE_FILE);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: "No save file" }));
            }
            return;
        }

        if (req.url === '/api/delete' && req.method === 'POST') {
            if (fs.existsSync(SAVE_FILE)) {
                fs.unlinkSync(SAVE_FILE);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // Static File Serving (serve the canonical client in ./web so local dev
        // matches the deployed build). Strip any query string (e.g. main.js?v=3).
        let urlPath = req.url.split('?')[0];
        if (urlPath === '/') urlPath = '/index.html';
        const filePath = path.join(WEB_ROOT, urlPath);

        // Prevent path traversal outside the web root.
        if (!filePath.startsWith(WEB_ROOT)) {
            res.writeHead(403);
            res.end('403 Forbidden');
            return;
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500);
                    res.end('500 Internal Server Error: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });

    server.clashSaveFile = SAVE_FILE;
    return server;
}

module.exports = { createClashServer };

// Run directly (`node server.js`) — same behavior as always.
if (require.main === module) {
    const PORT = 8000;
    const server = createClashServer();
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
        console.log(`Save file location: ${server.clashSaveFile}`);
    });
}
