import GameEngine from './core/GameEngine.js';
import Troop from './entities/Troop.js';
import Tower from './entities/Tower.js';
import Building from './entities/Building.js';
import MultiplayerManager from './multiplayer/MultiplayerManager.js';


// --- DEBUG ERROR HANDLER ---
window.logError = function (msg) {
    const log = document.getElementById('debug-log');
    if (log) {
        log.style.display = 'block';
        const div = document.createElement('div');
        div.className = 'log-error';
        div.textContent = msg;
        log.appendChild(div);
    }
    console.error(msg);
};

window.onerror = function (msg, url, lineNo, columnNo, error) {
    const string = msg.toLowerCase();
    const substring = "script error";
    if (string.indexOf(substring) > -1) {
        window.logError('Script Error: See Console for details');
    } else {
        window.logError(`Error: ${msg} \nAt: ${lineNo}:${columnNo}`);
    }
    return false;
};
// ---------------------------

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = 540;
const H = 960;
const RIV_Y = 405;

const State = {
    TITLE: 'TITLE',
    DECK: 'DECK',
    CNT: 'CNT',
    PLAY: 'PLAY',
    OVER: 'OVER',
    NEW_CARD: 'NEW_CARD',
    CHEAT: 'CHEAT',
    RESUME_PROMPT: 'RESUME_PROMPT',
    DEBUG_MENU: 'DEBUG_MENU',
    ENEMY_DECK: 'ENEMY_DECK',
    MP_MENU: 'MP_MENU',
    MP_HOST: 'MP_HOST',
    MP_JOIN: 'MP_JOIN',
    SANDBOX: 'SANDBOX',
    SETTINGS: 'SETTINGS'
};

// Faux-3D look: the game is still drawn flat top-down, but bodies get lit radial shading,
// a ground contact shadow, and a small specular highlight so everything reads as rounded &
// raised. OFF — troops and buildings wear the classic flat look. Flip to true to bring
// the raised/shaded look back.
const FAUX3D = false;

class Main {
    constructor() {
        this.state = State.TITLE;
        this.t0 = 0;
        this.scrollY = 0;
        // Background STYLE themes — the player picks one on the title screen; saved locally.
        this.themes = {
            ocean: { name: "Ocean", field: "#2e7da0", menu: "#236480", deck: "#152c3a", band: "rgba(255,255,255,0.03)", enemy: "rgba(10,30,55,0.10)" },
            grass: { name: "Grass", field: "#5cb356", menu: "#3a9d5e", deck: "#23362a", band: "rgba(255,255,255,0.025)", enemy: "rgba(20,45,75,0.06)" },
            indigo: { name: "Indigo", field: "#4b3f86", menu: "#3a3168", deck: "#221c3a", band: "rgba(255,255,255,0.035)", enemy: "rgba(8,4,40,0.14)" },
        };
        this.themeOrder = ["ocean", "grass", "indigo"];
        let savedTheme = null;
        try { savedTheme = localStorage.getItem("acr_theme"); } catch (e) { }
        this.themeKey = (savedTheme && this.themes[savedTheme]) ? savedTheme : "ocean";
        this.eng = new GameEngine();

        // Graphics quality: "high" (default) keeps the cosmetic extras — death
        // animations, the two-tone body finish; "low" strips them for a plain fast look.
        this.gfxHigh = true;
        try { this.gfxHigh = localStorage.getItem("acr_gfx") !== "low"; } catch (e) { }

        // Fall-over death animations (cosmetic only — the engine just reports deaths).
        this.corpses = [];
        this.eng.onUnitDied = (e) => {
            if (!this.gfxHigh) return;
            if (e.fly === undefined) return;
            this.corpses.push({
                x: e.x, y: e.y, rad: Math.max(5, (e.rad || 10) * 0.88),
                name: e.c ? e.c.n : "", life: 36, max: 36
            });
            if (this.corpses.length > 80) this.corpses.shift();
        };
        this.mp = new MultiplayerManager(this.eng); // Pass Engine

        this.scale = 1.0;
        this.xOffset = 0;
        this.yOffset = 0;

        this.mouse = { x: -100, y: -100 };
        this.cheatOptionVisible = true;
        this.justUnlocked = null;

        // UI Rects
        this.playBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.deckBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.mpBtn = { x: 0, y: 0, w: 120, h: 50 }; // MP Button
        this.exitBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.backBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.continueBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.resumeYesBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.resumeNoBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.yesBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.noBtn = { x: 0, y: 0, w: 120, h: 50 };
        this.debugBtn = { x: 0, y: 0, w: 53, h: 26 };
        this.debugToggleBtn = { x: 0, y: 0, w: 200, h: 50 };
        this.debugEnemyElixirBtn = { x: 0, y: 0, w: 200, h: 50 };
        this.enemyDeckBtn = { x: 0, y: 0, w: 200, h: 50 };

        // MP UI
        this.makeGameBtn = { x: 0, y: 0, w: 200, h: 60 };
        this.joinGameBtn = { x: 0, y: 0, w: 200, h: 60 };
        this.codeInputs = []; // Rects for 5 digits (for join)
        this.enteredCode = "";

        // Sandbox mode UI — two button rows in the bottom strip plus popups.
        this.sandboxBtn = { x: 0, y: 0, w: 120, h: 50 };       // title screen
        this.sbDeckBtn = { x: 0, y: 0, w: 160, h: 40 };        // row 1
        this.sbSideBtn = { x: 0, y: 0, w: 160, h: 40 };
        this.sbMapBtn = { x: 0, y: 0, w: 160, h: 40 };
        this.sbToolsBtn = { x: 0, y: 0, w: 100, h: 40 };       // row 2
        this.sbWorldBtn = { x: 0, y: 0, w: 100, h: 40 };
        this.sbSpeedBtn = { x: 0, y: 0, w: 100, h: 40 };
        this.sbPauseBtn = { x: 0, y: 0, w: 100, h: 40 };
        this.sbBackBtn = { x: 0, y: 0, w: 100, h: 40 };
        this.sandboxPaused = false;
        this.sandboxDeckOpen = false;   // full-screen all-cards picker
        this.sandboxMapOpen = false;    // map chooser popup
        this.sandboxToolsOpen = false;  // tools popup (eraser, clear)
        this.sandboxWorldOpen = false;  // world-edit popup
        this.sandboxSpeedOpen = false;  // speed-slider popup
        this.sandboxEvoSel = false;     // armed card was picked via its evo crystal
        this.sandboxEraser = false;     // tool: tap a troop to delete it
        this.sandboxTowerArm = null;    // world edit: 'king' | 'princess' tower stamp
        this.sandboxSpeed = 1;          // 0.5–10x sim speed (draggable slider)
        this.sbSpeedMin = 0.5;
        this.sbSpeedMax = 10;
        this.sbSpeedTicks = [1, 2, 3, 5, 10]; // labelled marks on the slider
        this.sbSpeedDrag = false;
        this.sbSpeedAcc = 0;
        this.sbMaps = ['default', 'bridges3', 'fortress', 'tower', 'open', 'heist', 'river', 'blank'];
        this.sbMapNames = { default: 'Default', bridges3: '3 Bridges', fortress: 'Fortress', tower: 'Tower', open: 'Open', heist: 'Heist', river: 'River', blank: 'Blank' };

        this.cardRects = [];
        this.nextCardRect = { x: W - 80, y: H - 110, w: 68, h: 90 }; // recomputed with the card row below
        this.cardOffsets = [0, 0, 0, 0]; // For hover animation

        // Eraser cursor sprite — uses the pixel art at web/images/eraser.png when
        // present, otherwise the built-in vector eraser icon.
        this.eraserImg = new Image();
        this.eraserImgLoaded = false;
        this.eraserImg.onload = () => { this.eraserImgLoaded = true; };
        this.eraserImg.onerror = () => { this.eraserImgLoaded = false; };
        this.eraserImg.src = "images/eraser.png";

        // Animated sprite sheets — each a vertical column of 16x16 frames (frame count is
        // auto-detected from the image height). Add more with addSprite("name","images/x.png").
        this.sprites = {};
        this.addSprite("zap", "images/zap.png");
        this.addSprite("evozap", "images/evo_zap.png");

        this.init();
    }

    init() {
        this.playBtn = { x: W / 2 - 60, y: H / 2 + 40 - 150, w: 120, h: 50 };
        this.deckBtn = { x: W / 2 - 60, y: H / 2 + 100 - 150, w: 120, h: 50 };
        this.mpBtn = { x: W / 2 - 60, y: H / 2 + 160 - 150, w: 120, h: 50 };
        this.sandboxBtn = { x: W / 2 - 60, y: H / 2 + 220 - 150, w: 120, h: 50 };
        this.settingsBtn = { x: 12, y: 12, w: 46, h: 46 };           // top-left gear → settings screen
        this.settingsBackBtn = { x: W / 2 - 60, y: H - 120, w: 120, h: 50 };
        // Graphics quality row + cheat/debug entry on the Settings screen.
        this.settingsGfxHighBtn = { x: W / 2 - 110, y: H / 2 + 146, w: 105, h: 40 };
        this.settingsGfxLowBtn = { x: W / 2 + 5, y: H / 2 + 146, w: 105, h: 40 };
        this.settingsCheatBtn = { x: W / 2 - 110, y: H / 2 + 202, w: 220, h: 46 };
        // The cheat is hidden behind a SMALL icon in the settings corner — the
        // DEBUG MENU button only exists once you've actually cheated.
        this.settingsCheatIcon = { x: W - 48, y: H - 60, w: 36, h: 36 };
        // In-battle (single-player) save-and-quit, top-left corner.
        this.saveQuitBtn = { x: 10, y: 10, w: 116, h: 32 };
        // Sandbox bottom bar: row 1 (4 wide buttons) + row 2 (5 narrow buttons),
        // all inside the H-150 HUD strip so the field grid is untouched.
        this.sbDeckBtn = { x: 12, y: H - 140, w: 120, h: 40 };
        this.sbSideBtn = { x: 144, y: H - 140, w: 120, h: 40 };
        this.sbMapBtn = { x: 276, y: H - 140, w: 120, h: 40 };
        this.sbToolsBtn = { x: 408, y: H - 140, w: 120, h: 40 };
        this.sbWorldBtn = { x: 12, y: H - 94, w: 120, h: 40 };
        this.sbSpeedBtn = { x: 144, y: H - 94, w: 120, h: 40 };
        this.sbPauseBtn = { x: 276, y: H - 94, w: 120, h: 40 };
        this.sbBackBtn = { x: 408, y: H - 94, w: 120, h: 40 };
        this.exitBtn = { x: W / 2 - 60, y: H / 2 + 40 - 120 + 100, w: 120, h: 50 };
        this.backBtn = { x: W / 2 - 60, y: H - 120, w: 120, h: 50 };
        this.continueBtn = { x: W / 2 - 60, y: H - 120, w: 120, h: 50 };
        this.resumeYesBtn = { x: W / 2 - 130, y: H / 2, w: 120, h: 50 };
        this.resumeNoBtn = { x: W / 2 + 10, y: H / 2, w: 120, h: 50 };
        this.yesBtn = { x: W / 2 - 130, y: H / 2, w: 120, h: 50 };
        this.noBtn = { x: W / 2 + 10, y: H / 2, w: 120, h: 50 };
        this.debugBtn = { x: W - 59, y: 0, w: 53, h: 26 };
        this.debugToggleBtn = { x: W / 2 - 110, y: H / 2 - 60, w: 220, h: 50 };
        this.debugEnemyElixirBtn = { x: W / 2 - 110, y: H / 2, w: 220, h: 50 };
        this.enemyDeckBtn = { x: W / 2 - 110, y: H / 2 + 60, w: 220, h: 50 };

        this.makeGameBtn = { x: W / 2 - 100, y: H / 2 - 50, w: 200, h: 60 };
        this.joinGameBtn = { x: W / 2 - 100, y: H / 2 + 30, w: 200, h: 60 };

        this.visitorCount = null;

        // Fetch Visitor Count (silently ignored if it fails)
        fetch('https://api.counterapi.dev/v1/clash-royale-clone-gemini/visits/up')
            .then(res => res.json())
            .then(data => {
                let n = Number(data && data.count);
                if (Number.isFinite(n)) this.visitorCount = n;
            })
            .catch(() => { });

        // Portrait card rectangles with generous spacing; the "next" preview is a
        // smaller card in the 5th slot. Cards sit low enough that a SELECTED card
        // poking up a little never reaches the play area's bottom row (810).
        let cardW = 110, cardH = 122, prevW = 72, prevH = 100;
        let gap = (W - 4 * cardW - prevW) / 6; // ≈ 4px — cards sit tight together
        let cardPanelY = H - 126;
        for (let i = 0; i < 4; i++) {
            this.cardRects.push({ x: gap + i * (cardW + gap), y: cardPanelY, w: cardW, h: cardH });
        }
        this.nextCardRect = { x: gap + 4 * (cardW + gap), y: cardPanelY + (cardH - prevH) / 2, w: prevW, h: prevH };

        canvas.width = W;
        canvas.height = H;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Vertically-scrollable card lists: the two deck builders and the sandbox
        // card picker. Shared by the wheel, mouse-drag and touch-drag handlers.
        const scrollableState = () =>
            this.state === State.DECK || this.state === State.ENEMY_DECK ||
            (this.state === State.SANDBOX && this.sandboxDeckOpen);
        const maxScrollFor = () => {
            let listSize = (this.state === State.DECK) ? this.eng.unlockedCards.length : this.eng.allCards.length;
            return Math.max(0, (Math.floor(listSize / 4) + 2) * 160 + 150 - H);
        };
        const clampScroll = () => { this.scrollY = Math.max(0, Math.min(maxScrollFor(), this.scrollY)); };
        const evtPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
        };

        let mouseDown = null;
        canvas.addEventListener('mousedown', (e) => {
            const p = evtPos(e);
            mouseDown = { x: p.x, y: p.y, scroll: this.scrollY, moved: false, handled: false };
            // Outside a scrollable list, act on press (unchanged feel). Inside one,
            // wait for release so a press-drag scrolls instead of selecting.
            if (!scrollableState()) { this.handle(p.x, p.y); mouseDown.handled = true; }
        });
        canvas.addEventListener('mousemove', (e) => {
            const p = evtPos(e);
            this.mouse = { x: p.x, y: p.y };
            if (mouseDown) {
                if (Math.hypot(p.x - mouseDown.x, p.y - mouseDown.y) > 6) mouseDown.moved = true;
                if (scrollableState()) { this.scrollY = mouseDown.scroll - (p.y - mouseDown.y); clampScroll(); }
                // Drag the eraser across the field to delete every troop you sweep over.
                if (this.eng.sandbox && this.sandboxEraser && !this.sbSpeedDrag && !this.sandboxSpeedOpen && p.y < H - 150) this.eng.sandboxErase(p.x, p.y);
                // Drag along the speed slider to scrub the sim speed.
                if (this.sbSpeedDrag) this.setSandboxSpeedFromX(p.x);
            }
        });
        canvas.addEventListener('mouseup', (e) => {
            this.sbSpeedDrag = false;
            if (!mouseDown) return;
            const p = evtPos(e);
            // A click that didn't drag still selects a card in a list; a drag scrolled.
            if (scrollableState() && !mouseDown.handled && !mouseDown.moved) this.handle(p.x, p.y);
            mouseDown = null;
        });
        canvas.addEventListener('mouseleave', () => { mouseDown = null; this.sbSpeedDrag = false; });
        canvas.addEventListener('wheel', (e) => {
            if (scrollableState()) { this.scrollY += Math.sign(e.deltaY) * 20; clampScroll(); }
        });

        // ---- Touch support (phones/tablets) ---------------------------------
        // Reuses evtPos/scrollableState/clampScroll defined above for the mouse.
        let touchStart = null;
        canvas.addEventListener('touchstart', (e) => {
            if (!e.touches.length) return;
            e.preventDefault();
            const p = evtPos(e.touches[0]);
            this.mouse = { x: p.x, y: p.y };           // ghost follows the finger
            touchStart = { x: p.x, y: p.y, scroll: this.scrollY, moved: false };
            // Live match: touching a hand card picks it up immediately so you can drag
            // it straight onto the field in one motion. handle() only SELECTS in the
            // hand row (y > H-150) — it never deploys there — so this can't drop a troop.
            if (this.state === State.PLAY && p.y > H - 150) this.handle(p.x, p.y);
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            if (!e.touches.length || !touchStart) return;
            e.preventDefault();
            const p = evtPos(e.touches[0]);
            this.mouse = { x: p.x, y: p.y };
            const dx = p.x - touchStart.x, dy = p.y - touchStart.y;
            if (Math.hypot(dx, dy) > 8) touchStart.moved = true;
            // Drag the eraser across the field to delete every troop you sweep over.
            if (this.eng.sandbox && this.sandboxEraser && !this.sbSpeedDrag && !this.sandboxSpeedOpen && p.y < H - 150) this.eng.sandboxErase(p.x, p.y);
            // Drag along the speed slider to scrub the sim speed.
            if (this.sbSpeedDrag) this.setSandboxSpeedFromX(p.x);
            if (scrollableState()) {
                // Drag to scroll the card list (finger up = list up).
                this.scrollY = touchStart.scroll - dy;
                clampScroll();
            }
        }, { passive: false });
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.sbSpeedDrag = false;
            if (!touchStart) return;
            // A drag inside a scrollable list just scrolls (no click). Everywhere else
            // (and any tap that didn't move) acts at the lift point: letting go over the
            // FIELD releases the troop; letting go back over the hand/deck row only
            // re-selects, so the troop is NOT released there.
            if (!scrollableState() || !touchStart.moved) {
                this.handle(this.mouse.x, this.mouse.y);
            }
            this.mouse = { x: -100, y: -100 };          // hide the ghost until the next touch
            touchStart = null;
        }, { passive: false });

        // Key Listener for Code Entry (Simple version)
        window.addEventListener('keydown', (e) => {
            if (this.state === State.MP_JOIN) {
                if (e.key >= '0' && e.key <= '9') {
                    if (this.enteredCode.length < 5) this.enteredCode += e.key;
                } else if (e.key === 'Backspace') {
                    this.enteredCode = this.enteredCode.slice(0, -1);
                } else if (e.key === 'Enter') {
                    if (this.enteredCode.length === 5) {
                        this.joinGame(this.enteredCode);
                    }
                }
            }
        });

        if (this.eng.hasSaveFile()) {
            this.state = State.RESUME_PROMPT;
        } else {
            this.eng.initCollection();
        }

        // Setup MP Callbacks
        this.mp.onJoined = (idx) => {
            console.log("Joined as Player", idx);
            this.mp.isHost = (idx === 0);
        };
        this.mp.onStart = (seed) => {
            if (seed) this.eng.setSeed(seed);
            this.startMultiplayerGame();
        };
        this.mp.onOpponentDisconnected = () => {
            if (this.state === State.OVER) return;
            alert("Opponent Disconnected!");
            this.state = State.TITLE;
            this.eng.setMultiplayer(false);
            this.eng.reset();
            this.mp.close();
        };

        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1000 / 60; // 60 TPS

        requestAnimationFrame((time) => {
            this.lastTime = time;
            this.loop(time);
        });
    }

    joinGame(code) {
        this.mp.joinGame(code, (success, msg) => {
            if (!success) {
                alert(msg || "Failed to join");
                this.enteredCode = "";
            } else {
                // Waiting for start...
            }
        });
    }

    createGame() {
        this.mp.createGame((success, msg) => {
            if (!success) {
                alert("Failed to create game: " + msg);
                this.state = State.MP_MENU;
            }
        });
    }

    startMultiplayerGame() {
        this.eng.setMultiplayer(true);
        this.eng.reset();

        // Disable Debug in MP
        this.eng.debugView = false;
        this.eng.debugEnemyElixir = false;

        this.state = State.CNT;
        this.t0 = Date.now();
    }

    resize() {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const sw = winW / W;
        const sh = winH / H;
        this.scale = Math.min(sw, sh);
        canvas.style.width = `${W * this.scale}px`;
        canvas.style.height = `${H * this.scale}px`;
    }

    handleInput(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top) * (H / rect.height);
        this.handle(mx, my);
    }

    contains(rect, x, y) {
        return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    }

    handle(x, y) {
        if (this.state === State.RESUME_PROMPT) {
            if (this.contains(this.resumeYesBtn, x, y)) {
                this.eng.loadProgress();
                this.cheatOptionVisible = !this.eng.cheated;
                this.state = State.TITLE;
            } else if (this.contains(this.resumeNoBtn, x, y)) {
                this.eng.deleteProgress();
                this.eng.initCollection();
                this.cheatOptionVisible = true;
                this.state = State.TITLE;
            }
        } else if (this.state === State.TITLE) {
            if (this.contains(this.playBtn, x, y)) {
                if (this.eng.myDeck.length === 8) {
                    this.eng.setMultiplayer(false);

                    this.state = State.CNT;
                    this.t0 = Date.now();

                    this.eng.reset();
                }
            } else if (this.contains(this.deckBtn, x, y)) {
                this.state = State.DECK;
            } else if (this.contains(this.mpBtn, x, y)) {
                this.enteredCode = "";
                this.mp.checkHealth(); // Probe whether a game server is reachable
                this.state = State.MP_MENU;
            } else if (this.contains(this.sandboxBtn, x, y)) {
                this.eng.setMultiplayer(false);
                this.eng.setupSandbox('default');
                this.sandboxPaused = false;
                this.sandboxDeckOpen = false;
                this.state = State.SANDBOX;
            } else if (this.contains(this.settingsBtn, x, y)) {
                this.state = State.SETTINGS;
            }
        } else if (this.state === State.SETTINGS) {
            for (const o of this.settingsStyleRects()) {
                if (this.contains(o, x, y)) { this.setTheme(o.key); return; }
            }
            // Graphics quality toggle (Low strips death animations & body detail).
            if (this.contains(this.settingsGfxHighBtn, x, y)) {
                this.gfxHigh = true;
                try { localStorage.setItem("acr_gfx", "high"); } catch (e) { }
                return;
            }
            if (this.contains(this.settingsGfxLowBtn, x, y)) {
                this.gfxHigh = false;
                this.corpses.length = 0;
                try { localStorage.setItem("acr_gfx", "low"); } catch (e) { }
                return;
            }
            // The small corner cheat icon opens the cheat prompt (first time only);
            // the DEBUG MENU button exists only once you've cheated.
            if (!this.eng.cheatPressed && this.contains(this.settingsCheatIcon, x, y)) {
                this.eng.cheatPressed = true;
                this.eng.saveProgress();
                this.state = State.CHEAT;
                return;
            }
            if (this.eng.cheated && this.contains(this.settingsCheatBtn, x, y)) {
                this.state = State.DEBUG_MENU;
                return;
            }
            if (this.contains(this.settingsBackBtn, x, y)) this.state = State.TITLE;
        } else if (this.state === State.MP_MENU) {
            if (this.contains(this.backBtn, x, y)) {
                this.state = State.TITLE;
            } else if (this.contains(this.makeGameBtn, x, y)) {
                this.state = State.MP_HOST;
                this.createGame();
            } else if (this.contains(this.joinGameBtn, x, y)) {
                this.enteredCode = "";
                this.state = State.MP_JOIN;
            }
        } else if (this.state === State.MP_HOST) {
            if (this.contains(this.backBtn, x, y)) {
                this.mp.close();
                this.state = State.MP_MENU;
            }
        } else if (this.state === State.MP_JOIN) {
            if (this.contains(this.backBtn, x, y)) {
                this.mp.close();
                this.state = State.MP_MENU;
            }
            // Code input handled by keydown, but maybe touch controls later?
        } else if (this.state === State.CHEAT) {
            if (this.contains(this.yesBtn, x, y)) {
                this.eng.unlockAllCards();
                this.eng.cheated = true;
                this.eng.saveProgress();
                this.cheatOptionVisible = false;
                this.state = State.DECK;
            } else if (this.contains(this.noBtn, x, y)) {
                this.cheatOptionVisible = false;
                this.state = State.SETTINGS; // came from the Settings screen
            }
        } else if (this.state === State.DECK) {
            // ... (Deck logic unchanged)
            if (this.contains(this.backBtn, x, y)) {
                this.state = State.TITLE;
                this.scrollY = 0;
            } else {
                let cols = 4;
                let margin = 20;
                let cardW = (W - (cols + 1) * margin) / cols;
                let cardH = 140;
                for (let i = 0; i < this.eng.unlockedCards.length; i++) {
                    let row = Math.floor(i / cols);
                    let col = i % cols;
                    let cx = margin + col * (cardW + margin);
                    let cy = 100 + row * (cardH + margin) - this.scrollY;
                    if (cy > H || cy + cardH < 0) continue;

                    let c = this.eng.unlockedCards[i];
                    // Tap the purple gem on any evo-capable card to toggle its evo (max 2).
                    // Enabling an evo auto-adds the card to the deck if there's room.
                    if (this.eng.isEvoCapable(c.n) && this.evoBadgeHit(cx, cy, cardW, cardH, x, y)) {
                        let ei = this.eng.evoSel.indexOf(c.n);
                        if (ei > -1) this.eng.evoSel.splice(ei, 1);
                        else if (this.eng.evoSel.length < 2) {
                            if (!this.eng.myDeck.includes(c) && this.eng.myDeck.length < 8) this.eng.myDeck.push(c);
                            if (this.eng.myDeck.includes(c)) this.eng.evoSel.push(c.n);
                        }
                        this.eng.saveProgress();
                    } else if (this.contains({ x: cx, y: cy, w: cardW, h: cardH }, x, y)) {
                        let idx = this.eng.myDeck.indexOf(c);
                        if (idx > -1) {
                            this.eng.myDeck.splice(idx, 1);
                            // Removing a card from the deck also drops its evo selection.
                            let ei = this.eng.evoSel.indexOf(c.n);
                            if (ei > -1) this.eng.evoSel.splice(ei, 1);
                        } else if (this.eng.myDeck.length < 8) this.eng.myDeck.push(c);
                        this.eng.saveProgress();
                    }
                }
            }
        } else if (this.state === State.DEBUG_MENU) {
            // (Unchanged debug render)
            if (this.contains(this.debugToggleBtn, x, y)) {
                this.eng.debugView = !this.eng.debugView;
                this.eng.saveProgress();
            } else if (this.contains(this.debugEnemyElixirBtn, x, y)) {
                this.eng.debugEnemyElixir = !this.eng.debugEnemyElixir;
                this.eng.saveProgress();
            } else if (this.contains(this.enemyDeckBtn, x, y)) {
                this.state = State.ENEMY_DECK;
                this.scrollY = 0;
            } else if (this.contains(this.backBtn, x, y)) {
                this.state = State.TITLE;
            }
        } else if (this.state === State.ENEMY_DECK) {
            // ... (Enemy Deck logic unchanged)
            if (this.contains(this.backBtn, x, y)) {
                this.state = State.DEBUG_MENU;
            } else {
                let cols = 4;
                let margin = 20;
                let cardW = (W - (cols + 1) * margin) / cols;
                let cardH = 140;
                for (let i = 0; i < this.eng.allCards.length; i++) {
                    let c = this.eng.allCards[i];
                    let selected = this.eng.enemyDeckSelection.includes(c);
                    let row = Math.floor(i / cols);
                    let col = i % cols;
                    let cx = margin + col * (cardW + margin);
                    let cy = 100 + row * (cardH + margin) - this.scrollY;
                    if (cy > H || cy + cardH < 0) continue;

                    if (this.eng.isEvoCapable(c.n) && this.evoBadgeHit(cx, cy, cardW, cardH, x, y)) {
                        let ei = this.eng.enemyEvoSel.indexOf(c.n);
                        if (ei > -1) this.eng.enemyEvoSel.splice(ei, 1);
                        else if (this.eng.enemyEvoSel.length < 2) {
                            if (!this.eng.enemyDeckSelection.includes(c) && this.eng.enemyDeckSelection.length < 8) this.eng.enemyDeckSelection.push(c);
                            if (this.eng.enemyDeckSelection.includes(c)) this.eng.enemyEvoSel.push(c.n);
                        }
                        this.eng.saveProgress();
                    } else if (this.contains({ x: cx, y: cy, w: cardW, h: cardH }, x, y)) {
                        let idx = this.eng.enemyDeckSelection.indexOf(c);
                        if (idx > -1) {
                            this.eng.enemyDeckSelection.splice(idx, 1);
                            let ei = this.eng.enemyEvoSel.indexOf(c.n);
                            if (ei > -1) this.eng.enemyEvoSel.splice(ei, 1);
                        } else if (this.eng.enemyDeckSelection.length < 8) this.eng.enemyDeckSelection.push(c);
                        this.eng.saveProgress();
                    }
                }
            }
        } else if (this.state === State.SANDBOX) {
            if (this.sandboxDeckOpen) {
                // Full-screen ALL-cards picker (same grid as the deck builder).
                if (this.contains(this.backBtn, x, y)) { this.sandboxDeckOpen = false; return; }
                let cols = 4, margin = 20, cardW = (W - 5 * margin) / 4, cardH = 140;
                for (let i = 0; i < this.eng.allCards.length; i++) {
                    let row = Math.floor(i / cols), col = i % cols;
                    let cx = margin + col * (cardW + margin), cy = 100 + row * (cardH + margin) - this.scrollY;
                    if (cy > H || cy + cardH < 0) continue;
                    let c = this.eng.allCards[i];
                    // Tapping the evo CRYSTAL arms the evolved version; the card body
                    // arms the normal one. The picker STAYS open (close with BACK).
                    if (this.eng.isEvoCapable(c.n) && this.evoBadgeHit(cx, cy, cardW, cardH, x, y)) {
                        this.eng.sel = c;
                        this.sandboxEvoSel = true;
                        this.sandboxEraser = false; this.sandboxTowerArm = null;
                        break;
                    }
                    if (this.contains({ x: cx, y: cy, w: cardW, h: cardH }, x, y)) {
                        this.eng.sel = c;
                        this.sandboxEvoSel = false;
                        this.sandboxEraser = false; this.sandboxTowerArm = null;
                        break;
                    }
                }
                return;
            }
            if (this.sandboxMapOpen) {
                for (const o of this.sandboxMapRects()) {
                    if (this.contains(o, x, y)) {
                        // setupSandbox wipes the board (and clears sel) — but the armed
                        // card + its evo should survive a map switch, so save/restore them.
                        let keepSel = this.eng.sel, keepEvo = this.sandboxEvoSel;
                        this.eng.setupSandbox(o.map);
                        this.eng.sel = keepSel; this.sandboxEvoSel = keepEvo;
                        break;
                    }
                }
                this.sandboxMapOpen = false;
                return;
            }
            if (this.sandboxToolsOpen) {
                for (const o of this.sandboxToolRects()) {
                    if (!this.contains(o, x, y)) continue;
                    if (o.id === 'eraser') {
                        this.sandboxEraser = !this.sandboxEraser;
                        // The eraser is a TEMPORARY overlay — a field tap erases instead of
                        // placing (see the tap handler). Keep the armed card + its evo so
                        // turning the eraser back off resumes placing the same card.
                        if (this.sandboxEraser) this.sandboxTowerArm = null;
                    } else if (o.id === 'clear') {
                        this.eng.sandboxClearTroops();
                    }
                    break;
                }
                this.sandboxToolsOpen = false;
                return;
            }
            if (this.sandboxWorldOpen) {
                let hit = false;
                for (const o of this.sandboxWorldRects()) {
                    if (!this.contains(o, x, y)) continue;
                    hit = true;
                    if (o.id === 'rules') this.eng.sandboxNoRules = !this.eng.sandboxNoRules;
                    else if (o.id === 'rivUp') this.eng.RIV_Y = Math.max(135, this.eng.RIV_Y - 30);
                    else if (o.id === 'rivDn') this.eng.RIV_Y = Math.min(675, this.eng.RIV_Y + 30);
                    else if (o.id === 'brIn') { if (this.eng.bridgeXs[1] - this.eng.bridgeXs[0] > 120) { this.eng.bridgeXs[0] += 30; this.eng.bridgeXs[1] -= 30; } }
                    else if (o.id === 'brOut') { if (this.eng.bridgeXs[0] > 45) { this.eng.bridgeXs[0] -= 30; this.eng.bridgeXs[1] += 30; } }
                    else if (o.id === 'king' || o.id === 'princess') {
                        this.sandboxTowerArm = o.id; this.eng.sel = null; this.sandboxEraser = false;
                        this.sandboxWorldOpen = false;
                    }
                    else if (o.id === 'close') this.sandboxWorldOpen = false;
                    break; // river/bridge/rules taps keep the popup open for repeats
                }
                if (!hit) this.sandboxWorldOpen = false;
                return;
            }
            if (this.sandboxSpeedOpen) {
                const t = this.speedTrack();
                // Tap (or start a drag) anywhere on/near the slider to scrub the speed;
                // tapping a preset jumps to it; tapping elsewhere closes the popup.
                if (x >= t.x - 18 && x <= t.x + t.w + 18 && y >= t.y - 22 && y <= t.y + 22) {
                    this.sbSpeedDrag = true;
                    this.setSandboxSpeedFromX(x);
                    return;
                }
                for (const p of this.sbSpeedTicks) {
                    let pxc = t.x + (p - this.sbSpeedMin) / (this.sbSpeedMax - this.sbSpeedMin) * t.w;
                    if (Math.abs(x - pxc) < 22 && Math.abs(y - (t.y + 34)) < 16) { this.sandboxSpeed = p; return; }
                }
                this.sandboxSpeedOpen = false;
                return;
            }
            if (this.contains(this.sbDeckBtn, x, y)) { this.sandboxDeckOpen = true; this.scrollY = 0; }
            else if (this.contains(this.sbSideBtn, x, y)) {
                // BLUE ↔ RED. Your side fixes the team you summon for AND applies
                // that side's normal placement restrictions.
                this.eng.sandboxSide = this.eng.sandboxSide === 0 ? 1 : 0;
            }
            else if (this.contains(this.sbMapBtn, x, y)) this.sandboxMapOpen = true;
            else if (this.contains(this.sbToolsBtn, x, y)) this.sandboxToolsOpen = true;
            else if (this.contains(this.sbWorldBtn, x, y)) this.sandboxWorldOpen = true;
            else if (this.contains(this.sbSpeedBtn, x, y)) this.sandboxSpeedOpen = true;
            else if (this.contains(this.sbPauseBtn, x, y)) this.sandboxPaused = !this.sandboxPaused;
            else if (this.contains(this.sbBackBtn, x, y)) {
                this.eng.sandbox = false;
                this.eng.sel = null;
                this.state = State.TITLE;
            }
            else if (y < H - 150) {
                let gm = this.snapToGrid(x, y);
                if (this.sandboxEraser) this.eng.sandboxErase(x, y);
                else if (this.sandboxTowerArm) this.eng.sandboxPlaceTower(this.sandboxTowerArm, gm.x, gm.y);
                else if (this.eng.sel) this.eng.sandboxPlace(this.eng.sel, gm.x, gm.y, this.sandboxEvoSel);
            }
        } else if (this.state === State.PLAY) {
            // SAVE & QUIT (single-player only): save progress and abandon the match.
            if (!this.eng.isMultiplayer && this.contains(this.saveQuitBtn, x, y)) {
                this.eng.saveProgress();
                this.eng.reset();
                this.eng.sel = null;
                this.state = State.TITLE;
                return;
            }
            if (y > H - 150) {
                if (this.eng.p1) {
                    for (let i = 0; i < 4; i++) {
                        if (i < this.eng.p1.h.length) {
                            if (this.contains(this.cardRects[i], x, y)) {
                                this.eng.sel = this.eng.p1.h[i];
                            }
                        }
                    }
                }
            } else {
                let rx = x, ry = y;
                // Everything (troops, buildings and spells) snaps to the tile grid.
                if (this.eng.sel) {
                    let s = this.snapToGrid(x, y);
                    rx = s.x; ry = s.y;
                }

                if (this.eng.sel) {
                    // Only place (and clear the selection) if it's actually placeable
                    // here AND affordable; otherwise keep the card picked.
                    let sel = this.eng.sel;
                    let cost = (sel.n === "Mirror" && this.eng.p1.lastPlayedCard) ? this.eng.p1.lastPlayedCard.c + 1 : sel.c;
                    // Mirror is checked as the card it replays (engine does the same);
                    // with nothing to mirror it simply will not play.
                    let placeable = this.eng.p1.elx >= cost && this.eng.isValid(ry, rx, this.mirroredView(sel), 0)
                        && !(sel.n === "Mirror" && !this.eng.p1.lastPlayedCard);
                    if (placeable) {
                        if (this.eng.isMultiplayer) {
                            this.mp.sendSpawnRequest(sel.n, rx, ry, this.mp.isHost ? 0 : 1);
                        } else {
                            this.eng.spawn(rx, ry);
                        }
                        this.eng.sel = null;
                    }
                }
            }
        } else if (this.state === State.OVER && this.contains(this.exitBtn, x, y)) {
            if (this.eng.isMultiplayer) {
                this.mp.onOpponentDisconnected = null; // Prevent alert on self-close
                this.mp.close();
                this.eng.setMultiplayer(false);
            }
            if (this.eng.win === 0 && !this.eng.isMultiplayer) {
                let newC = this.eng.unlockRandomCard();
                if (newC) {
                    this.justUnlocked = newC;
                    this.state = State.NEW_CARD;
                } else {
                    this.state = State.TITLE;
                }
            } else {
                this.state = State.TITLE;
            }
        } else if (this.state === State.NEW_CARD && this.contains(this.continueBtn, x, y)) {
            this.state = State.TITLE;
        }
    }

    loop(time) {
        requestAnimationFrame((t) => this.loop(t));

        // Calculate delta time
        let dt = time - this.lastTime;
        this.lastTime = time;

        // Cap dt to avoid spiral of death (e.g. if tab is backgrounded)
        if (dt > 100) dt = 100;

        this.accumulator += dt;

        while (this.accumulator >= this.step) {
            // Updated Loop Logic

            // Update TWEEN
            // TWEEN.update();

            const now = Date.now();
            if (this.state === State.CNT) {
                if (now - this.t0 > 3000) {
                    this.state = State.PLAY;
                    this.eng.gameStart = now;
                }
            }


            // Update Card Hover Animations
            if (this.state === State.PLAY) {
                for (let i = 0; i < 4; i++) {
                    let target = 0;
                    let rect = this.cardRects[i];
                    // Check if mouse is within the card's horizontal bounds and roughly near the bottom
                    if (this.mouse.x >= rect.x && this.mouse.x <= rect.x + rect.w && this.mouse.y >= rect.y - 50) {
                        target = 40; // Slide up by 40px
                    }
                    // Smooth interpolation (Lerp)
                    // Note: In fixed loop, this runs at 60fps, so 0.2 factor is consistent
                    this.cardOffsets[i] += (target - this.cardOffsets[i]) * 0.2;
                }
            }

            if (this.state === State.PLAY) {
                if (this.eng.isMultiplayer) {
                    if (this.mp.isHost) {
                        // Host Authoritative Lockstep Loop
                        let pendingSpawns = this.mp.getQueuedRequests();
                        for (let req of pendingSpawns) {
                            if (req.team === 0) {
                                // Host's local input
                                this.eng.playCard(this.eng.p1, this.eng.getCard(req.cardName), req.x, req.y, 0);
                            } else {
                                // Client's remote input
                                this.eng.spawnRemote(req.cardName, req.x, req.y, 1);
                            }
                        }
                        
                        this.eng.upd();
                        this.mp.sendFramePulse(this.eng.aiTick, pendingSpawns, this.eng.getState());
                    } else {
                        // Client Loop: purely lockstep
                        // We do not simulate ANY frame unless we have the pulse from the Host!
                        while (this.mp.hasFramePulse(this.eng.aiTick + 1)) {
                            let pulse = this.mp.getFramePulse(this.eng.aiTick + 1);
                            for (let req of pulse.actions) {
                                if (req.team === 0) {
                                    // Host's input, Client maps to opponent (1)
                                    this.eng.spawnRemote(req.cardName, req.x, req.y, 1);
                                } else {
                                    // Client's local input (echoed back), Client plays as self (0)
                                    this.eng.playCard(this.eng.p1, this.eng.getCard(req.cardName), req.x, req.y, 0);
                                }
                            }
                            this.eng.upd();
                            if (pulse.state) {
                                this.eng.syncState(pulse.state);
                            }
                        }
                    }
                } else {
                    // Singleplayer
                    this.eng.upd();
                }

                if (this.eng.over) {
                    this.state = State.OVER;
                }
            } else if (this.state === State.SANDBOX && !this.sandboxPaused) {
                // Speed control: accumulate fractional ticks so 0.5x runs every other
                // step and 3x runs three sim ticks per step.
                this.sbSpeedAcc += this.sandboxSpeed;
                while (this.sbSpeedAcc >= 1) {
                    this.eng.upd();
                    this.sbSpeedAcc -= 1;
                }
            }

            this.accumulator -= this.step;
        }

        // Hide loading screen on first successful loop
        const loader = document.getElementById('loading-overlay');
        if (loader && loader.style.opacity !== '0') {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }

        // Render entities at an interpolated position between the last two
        // simulation ticks so motion is smooth regardless of refresh rate.
        const alpha = this.step > 0 ? this.accumulator / this.step : 0;
        this.applyInterp(alpha);
        try {
            this.render();
        } finally {
            this.restoreInterp();
        }
    }

    // Temporarily move entities/projectiles to their interpolated render
    // position. The authoritative positions are saved and put back by
    // restoreInterp() right after rendering, so the simulation is untouched.
    applyInterp(alpha) {
        this._interpActive = false;
        if (this.eng.isMultiplayer) return; // lockstep syncs positions; don't smear corrections
        if (this.state !== State.PLAY && this.state !== State.CNT &&
            !(this.state === State.SANDBOX && !this.sandboxPaused)) return;
        if (!(alpha > 0)) return;
        this._interpActive = true;
        for (const e of this.eng.ents) {
            e._sx = e.x; e._sy = e.y;
            if (e.lx !== undefined) {
                e.x = e.lx + (e.x - e.lx) * alpha;
                e.y = e.ly + (e.y - e.ly) * alpha;
            }
        }
        for (const p of this.eng.projs) {
            p._sx = p.x; p._sy = p.y;
            if (p.lx !== undefined) {
                p.x = p.lx + (p.x - p.lx) * alpha;
                p.y = p.ly + (p.y - p.ly) * alpha;
            }
        }
    }

    restoreInterp() {
        if (!this._interpActive) return;
        for (const e of this.eng.ents) { if (e._sx !== undefined) { e.x = e._sx; e.y = e._sy; } }
        for (const p of this.eng.projs) { if (p._sx !== undefined) { p.x = p._sx; p.y = p._sy; } }
        this._interpActive = false;
    }

    render() {
        this.arenaGrass();

        if (this.state === State.RESUME_PROMPT) {
            this.menuBg();
            this.drawCenteredString("Resume previous game?", W / 2, H / 2 - 75, "bold 30px 'Baloo 2', 'Segoe UI', sans-serif", "#004000");
            this.drawBtn(this.resumeYesBtn, "YES", "#32CD32");
            this.drawBtn(this.resumeNoBtn, "NO", "#FF6347");
            return;
        }

        if (this.state === State.TITLE) {
            this.menuBg();

            // Visitor count (only when we actually have a number)
            if (typeof this.visitorCount === "number") {
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                ctx.font = "600 12px 'Baloo 2', 'Segoe UI', sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(`${this.visitorCount} plays`, 66, 40); // beside the gear button
            }
            ctx.textAlign = "center";

            // Title — white fill with a green outline and soft shadow for contrast.
            const titleY = H / 2 - 200;
            ctx.font = "800 48px 'Baloo 2', 'Segoe UI', sans-serif";
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillText("Clash Clone", W / 2 + 2, titleY + 3);
            ctx.lineWidth = 5; ctx.strokeStyle = "#1c6440";
            ctx.strokeText("Clash Clone", W / 2, titleY);
            ctx.fillStyle = "#ffffff";
            ctx.fillText("Clash Clone", W / 2, titleY);
            ctx.lineWidth = 1;

            let validDeck = this.eng.myDeck.length === 8;
            this.drawBtn(this.playBtn, "PLAY", validDeck ? "#39c44e" : "#7f8b84");
            if (!validDeck) {
                this.drawCenteredString("Build a deck of 8 cards!", W / 2, this.playBtn.y - 12, "700 13px 'Baloo 2', 'Segoe UI', sans-serif", "#ffe08a");
            }
            this.drawBtn(this.deckBtn, "DECK", "#FFA500");
            this.drawBtn(this.mpBtn, "MULTIPLAYER", "#3296ff");
            this.drawBtn(this.sandboxBtn, "SANDBOX", "#b65cd6");
            this.drawSettingsButton();

            this.drawCenteredString(`Cards Unlocked: ${this.eng.unlockedCards.length} / ${this.eng.allCards.length}`, W / 2, H - 270, "600 15px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.82)");
            this.drawCenteredString(`Wins ${this.eng.gamesWon}   ·   Matches ${this.eng.gamesPlayed}`, W / 2, H - 246, "600 15px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.82)");

            this.drawCenteredString("by Oliver Zhou", W / 2, H - 22, "600 11px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.45)");
            return;
        }

        if (this.state === State.SETTINGS) {
            this.menuBg();
            this.drawCenteredString("Settings", W / 2, 96, "bold 40px 'Baloo 2', 'Segoe UI', sans-serif", "white");
            this.drawCenteredString("Background Style", W / 2, H / 2 - 110, "700 18px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.88)");
            for (const o of this.settingsStyleRects()) {
                let active = this.themeKey === o.key;
                // Each option is tinted with its OWN field colour so you preview the look.
                this.drawBtn(o, o.name + (active ? "   ✓" : ""), this.themes[o.key].field);
            }
            // Graphics quality: High keeps the extras (death animations, two-tone
            // bodies); Low strips them for a plain, fast look.
            this.drawCenteredString("Graphics", W / 2, H / 2 + 138, "700 15px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.88)");
            this.drawBtn(this.settingsGfxHighBtn, "HIGH" + (this.gfxHigh ? " ✓" : ""), this.gfxHigh ? "#3aa17e" : "#5a7ea6");
            this.drawBtn(this.settingsGfxLowBtn, "LOW" + (!this.gfxHigh ? " ✓" : ""), !this.gfxHigh ? "#3aa17e" : "#5a7ea6");

            // Cheat entry: a SMALL diamond icon tucked in the corner. Click it to be
            // offered the cheat; decline and it's gone for good. Only once you've
            // cheated does the proper DEBUG MENU button exist.
            if (!this.eng.cheatPressed) {
                const ic = this.settingsCheatIcon;
                const cx2 = ic.x + ic.w / 2, cy2 = ic.y + ic.h / 2, d = 9;
                const hov = this.contains(ic, this.mouse.x, this.mouse.y);
                ctx.globalAlpha = hov ? 0.95 : 0.45;
                ctx.fillStyle = "#b07fd8";
                ctx.beginPath();
                ctx.moveTo(cx2, cy2 - d); ctx.lineTo(cx2 + d, cy2); ctx.lineTo(cx2, cy2 + d); ctx.lineTo(cx2 - d, cy2);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.3; ctx.stroke();
                ctx.globalAlpha = 1; ctx.lineWidth = 1;
            } else if (this.eng.cheated) {
                this.drawBtn(this.settingsCheatBtn, "DEBUG MENU", "#8a6bbf");
            }
            this.drawBtn(this.settingsBackBtn, "BACK", "#FF6347");
            return;
        }

        if (this.state === State.MP_MENU) {
            this.menuBg();

            this.drawCenteredString("MULTIPLAYER", W / 2, 100, "bold 40px 'Baloo 2', 'Segoe UI', sans-serif", "white");

            this.drawBtn(this.makeGameBtn, "MAKE GAME", "#3296ff");
            this.drawBtn(this.joinGameBtn, "JOIN GAME", "#FFA500");

            this.drawBtn(this.backBtn, "BACK", "#FF6347");
            // Red warning note
            ctx.fillStyle = "red";
            ctx.font = "bold 14px 'Baloo 2', 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("NOTE: DEBUG FEATURES DISABLED IN MULTIPLAYER", W / 2, H - 20);
            if (this.mp.backendAvailable === false) {
                ctx.fillStyle = "#ffcc00";
                ctx.font = "12px 'Baloo 2', 'Segoe UI', sans-serif";
                ctx.fillText("No game server reachable for this site.", W / 2, H - 50);
                ctx.fillText("See README to host one (set MP_API_BASE).", W / 2, H - 36);
            }
            return;
        }

        if (this.state === State.MP_HOST) {
            this.menuBg();

            this.drawCenteredString("Waiting for opponent...", W / 2, H / 2 - 100, "24px 'Baloo 2', 'Segoe UI', sans-serif", "white");

            if (this.mp.code) {
                this.drawCenteredString(`CODE: ${this.mp.code}`, W / 2, H / 2, "bold 60px 'Baloo 2', 'Segoe UI', sans-serif", "white");
            } else {
                this.drawCenteredString(`Generating Code...`, W / 2, H / 2, "italic 20px 'Baloo 2', 'Segoe UI', sans-serif", "#eee");
            }

            this.drawBtn(this.backBtn, "CANCEL", "#FF6347");
            return;
        }

        if (this.state === State.MP_JOIN) {
            this.menuBg();

            this.drawCenteredString("ENTER CODE:", W / 2, H / 2 - 100, "bold 30px 'Baloo 2', 'Segoe UI', sans-serif", "white");

            // Draw Code Digits
            let codeStr = this.enteredCode;
            ctx.font = "bold 50px Courier New";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(codeStr.padEnd(5, '_').split('').join(' '), W / 2, H / 2);

            this.drawCenteredString("Type digits on keyboard. Press Enter to Join.", W / 2, H / 2 + 60, "14px 'Baloo 2', 'Segoe UI', sans-serif", "#eee");

            this.drawBtn(this.backBtn, "BACK", "#FF6347");
            return;
        }

        if (this.state === State.CHEAT) {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, W, H);
            this.drawCenteredString("Unlock all cards?", W / 2, H / 2 - 50, "bold 30px 'Baloo 2', 'Segoe UI', sans-serif", "white");
            this.drawBtn(this.yesBtn, "YES", "green");
            this.drawBtn(this.noBtn, "NO", "red");
            return;
        }

        if (this.state === State.DECK) {
            this.paintBg(this.theme().deck);
            let cols = 4;
            let margin = 20;
            let cardW = (W - (cols + 1) * margin) / cols;
            let cardH = 140;

            for (let i = 0; i < this.eng.unlockedCards.length; i++) {
                let c = this.eng.unlockedCards[i];
                let selected = this.eng.myDeck.includes(c);
                let row = Math.floor(i / cols);
                let col = i % cols;
                let cx = margin + col * (cardW + margin);
                let cy = 100 + row * (cardH + margin) - this.scrollY;
                if (cy > H || cy + cardH < 0) continue;
                this.drawDeckCard(cx, cy, cardW, cardH, c, selected, this.eng.evoSel.includes(c.n));
                // Evo gem on EVERY evo-capable card so you can see (and tap) it. Selected
                // evos glow + get a purple frame; the rest show a dim "available" gem.
                if (this.eng.isEvoCapable(c.n)) {
                    let isE = this.eng.evoSel.includes(c.n), req = this.eng.EVO_REQ[c.n];
                    if (isE) { ctx.strokeStyle = "#b13bff"; ctx.lineWidth = 2.5; this.drawRoundRect(cx, cy, cardW, cardH, 10, false, false); ctx.stroke(); ctx.lineWidth = 1; }
                    this.drawEvoPips(cx + cardW / 2, cy + cardH - 8, req, isE ? req : 0, isE);
                }
            }

            // Header panel
            ctx.fillStyle = "rgba(10,18,12,0.94)";
            ctx.fillRect(0, 0, W, 92);
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(W, 92); ctx.stroke();

            let valid = this.eng.myDeck.length === 8;
            this.drawCenteredString("Build Your Deck", W / 2, 38, "bold 26px 'Baloo 2', 'Segoe UI', sans-serif", "#eaffea");
            this.drawCenteredString(`Evos ${this.eng.evoSel.length}/2  ·  tap the purple gem to toggle`, W / 2, 86, "600 11px 'Baloo 2', 'Segoe UI', sans-serif", "#d9a8ff");
            this.drawCenteredString(`${this.eng.myDeck.length} / 8`, W / 2 - 70, 70, "bold 16px 'Baloo 2', 'Segoe UI', sans-serif", valid ? "#7CFC6A" : "#ffd24d");
            let sum = this.eng.myDeck.reduce((a, b) => a + b.c, 0);
            let avg = this.eng.myDeck.length ? (sum / this.eng.myDeck.length).toFixed(1) : "0.0";
            this.drawCenteredString(`Avg Elixir ${avg}`, W / 2 + 60, 70, "bold 15px 'Baloo 2', 'Segoe UI', sans-serif", "#e08cff");

            this.drawBtn(this.backBtn, "BACK", "#FF6347");
            return;
        }

        if (this.state === State.DEBUG_MENU) {
            // (Unchanged debug render)
            this.menuBg();
            this.drawBtn(this.debugToggleBtn, "SHOW PATH/RANGE", this.eng.debugView ? "#32CD32" : "#FF6347");
            this.drawBtn(this.debugEnemyElixirBtn, "SHOW OPP ELIXIR", this.eng.debugEnemyElixir ? "#32CD32" : "#FF6347");
            this.drawBtn(this.enemyDeckBtn, "BUILD ENEMY DECK", "#FFA500");
            this.drawBtn(this.backBtn, "BACK", "#FF6347");
            return;
        }

        if (this.state === State.ENEMY_DECK) {
            // Mirrors the player's "Build Your Deck" screen exactly.
            this.paintBg(this.theme().deck);
            let cols = 4;
            let margin = 20;
            let cardW = (W - (cols + 1) * margin) / cols;
            let cardH = 140;

            for (let i = 0; i < this.eng.allCards.length; i++) {
                let c = this.eng.allCards[i];
                let selected = this.eng.enemyDeckSelection.includes(c);
                let row = Math.floor(i / cols);
                let col = i % cols;
                let cx = margin + col * (cardW + margin);
                let cy = 100 + row * (cardH + margin) - this.scrollY;
                if (cy > H || cy + cardH < 0) continue;
                this.drawDeckCard(cx, cy, cardW, cardH, c, selected, this.eng.enemyEvoSel.includes(c.n));
                if (this.eng.isEvoCapable(c.n)) {
                    let isE = this.eng.enemyEvoSel.includes(c.n), req = this.eng.EVO_REQ[c.n];
                    if (isE) { ctx.strokeStyle = "#b13bff"; ctx.lineWidth = 2.5; this.drawRoundRect(cx, cy, cardW, cardH, 10, false, false); ctx.stroke(); ctx.lineWidth = 1; }
                    this.drawEvoPips(cx + cardW / 2, cy + cardH - 8, req, isE ? req : 0, isE);
                }
            }

            // Header panel
            ctx.fillStyle = "rgba(10,18,12,0.94)";
            ctx.fillRect(0, 0, W, 92);
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(W, 92); ctx.stroke();

            let valid = this.eng.enemyDeckSelection.length === 8;
            this.drawCenteredString("Build Enemy Deck", W / 2, 38, "bold 26px 'Baloo 2', 'Segoe UI', sans-serif", "#eaffea");
            this.drawCenteredString(`Evos ${this.eng.enemyEvoSel.length}/2  ·  tap the purple gem`, W / 2, 86, "600 11px 'Baloo 2', 'Segoe UI', sans-serif", "#d9a8ff");
            this.drawCenteredString(`${this.eng.enemyDeckSelection.length} / 8`, W / 2 - 70, 70, "bold 16px 'Baloo 2', 'Segoe UI', sans-serif", valid ? "#7CFC6A" : "#ffd24d");
            let sum = this.eng.enemyDeckSelection.reduce((a, b) => a + b.c, 0);
            let avg = this.eng.enemyDeckSelection.length ? (sum / this.eng.enemyDeckSelection.length).toFixed(1) : "0.0";
            this.drawCenteredString(`Avg Elixir ${avg}`, W / 2 + 60, 70, "bold 15px 'Baloo 2', 'Segoe UI', sans-serif", "#e08cff");

            this.drawBtn(this.backBtn, "BACK", "#FF6347");
            return;
        }

        if (this.state === State.NEW_CARD) {
            this.menuBg();
            this.drawCenteredString("NEW CARD", W / 2, 150, "bold 34px 'Baloo 2', 'Segoe UI', sans-serif", "#ffffff");
            this.drawCenteredString("UNLOCKED!", W / 2, 192, "bold 34px 'Baloo 2', 'Segoe UI', sans-serif", "#ffe08a");

            if (this.justUnlocked) {
                let cardW = 150, cardH = 200;
                let cx = (W - cardW) / 2, cy = (H - cardH) / 2 - 10;
                // Soft halo behind the card.
                ctx.fillStyle = "rgba(255,255,255,0.10)";
                this.drawRoundRect(cx - 14, cy - 14, cardW + 28, cardH + 28, 20, true, false);
                // The card itself — same face as the hand and deck builder.
                this.drawCardFace(cx, cy, cardW, cardH, this.justUnlocked);
                // Gold "unlocked" frame.
                ctx.strokeStyle = "#ffd24d"; ctx.lineWidth = 3;
                this.drawRoundRect(cx, cy, cardW, cardH, 13, false, false); ctx.stroke(); ctx.lineWidth = 1;
            }
            this.drawBtn(this.continueBtn, "CONTINUE", "#32CD32");
            return;
        }

        // River — solid water, exactly one tile tall. The sandbox "Open" map has no
        // river or bridges (one uninterrupted field).
        if (!(this.state === State.SANDBOX && this.eng.sandboxNoRiver)) {
            // Live positions — the sandbox world editor can move the river/bridges.
            const RY = this.eng.RIV_Y || RIV_Y;
            ctx.fillStyle = "#3a8fd0";
            ctx.fillRect(0, RY - 15, W, 30);
            // Bridges — solid wood, no plank lines.
            ctx.fillStyle = "#9c6b3a";
            for (const bx of (this.eng.bridgeXs || [W / 4, W * 3 / 4])) {
                ctx.fillRect(bx - 26, RY - 20, 52, 40);
            }
        }

        // Render Game during COUNTDOWN (CNT), PLAY, OVER, or SANDBOX
        if (this.state === State.PLAY || this.state === State.CNT || this.state === State.OVER || this.state === State.SANDBOX) {
            // The tile grid is always visible during play.
            this.drawGrid();


            // Mirror shows the red zones (and hover cell) of the card it replays.
            const selView = this.eng.sel ? this.mirroredView(this.eng.sel) : null;
            if ((this.state === State.PLAY || this.state === State.CNT) && selView && (selView.t !== 2 || ["The Log", "Barbarian Barrel", "Royale Delivery"].includes(selView.n))) {
                // Invalid-placement tint
                ctx.fillStyle = "rgba(255, 0, 0, 0.28)";
                ctx.fillRect(0, 0, W, 200); // behind enemy towers/king
                if (this.eng.t2L && this.eng.t2L.hp > 0) ctx.fillRect(0, 200, W / 2, RIV_Y - 200);
                if (this.eng.t2R && this.eng.t2R.hp > 0) ctx.fillRect(W / 2, 200, W / 2, RIV_Y - 200);

                // Hovered-cell highlight for troops/buildings
                if (selView.t !== 2) this.drawHoverCell(selView);
            } // Close Invalid Area Logic

            // (Sandbox has no placement red zone — you may drop anything anywhere
            // except on top of a tower/building, so no forbidden-half tint is drawn.)

            // Entity bodies are drawn below in layered passes
            // (shadows/effects -> ground units -> projectiles -> flying units).

            // HOVER PREVIEW (Ghost Unit & Range)
            if ((this.state === State.PLAY || this.state === State.CNT || this.state === State.SANDBOX) && this.eng.sel && this.mouse.y < H - 150
                && !(this.sandboxEraser || this.sandboxTowerArm)
                // Mirror with nothing to mirror shows NO ghost at all — it can't play.
                && !(this.eng.sel.n === "Mirror" && !this.eng.p1.lastPlayedCard)) {
                // Mirror previews AS the card it will replay — same ghost shape, same
                // placement rules (red zones), same splash/range circles.
                let c = this.mirroredView(this.eng.sel);
                let spellShape = this.eng.getSpellRadius(c);
                let canAfford = this.eng.sandbox || this.eng.p1.elx >= c.c; // sandbox: no elixir
                // Validity is from the placing TEAM's view — in sandbox that's the
                // chosen side (red mirrors the rules), otherwise the player (team 0).
                let ghostTeam = (this.eng.sandbox && this.eng.sandboxSide === 1) ? 1 : 0;
                // Spells snap to the same tile grid as troops.
                let gm = this.snapToGrid(this.mouse.x, this.mouse.y);

                ctx.globalAlpha = 0.6;
                if (spellShape) {
                    // Animated Dashed Border Style
                    let time = Date.now() / 50; // Speed of animation

                    // Placement-restricted spells turn RED where they can't be placed.
                    let rollValid = !["The Log", "Barbarian Barrel", "Royale Delivery"].includes(c.n) || this.eng.isValid(gm.y, gm.x, c, ghostTeam);
                    let ghostFill = !rollValid ? "rgba(255,70,70,0.3)" : (canAfford ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 100, 100, 0.2)");
                    ctx.fillStyle = ghostFill;
                    ctx.strokeStyle = rollValid ? "white" : "#ff5a5a";
                    ctx.lineWidth = 3;
                    ctx.setLineDash([10, 10]);
                    ctx.lineDashOffset = -time; // Animate march

                    if (["The Log", "Barbarian Barrel"].includes(c.n)) {
                        // Draw Arrow for rolling spells — it rolls AWAY from the caster's
                        // side: up-field for blue (team 0), down-field for red (team 1).
                        let dir = (ghostTeam === 1) ? 1 : -1;
                        let dist = (c.n === "The Log") ? 280 : 101;
                        let ey = gm.y + dir * dist;
                        ctx.beginPath();
                        ctx.moveTo(gm.x, gm.y);
                        ctx.lineTo(gm.x, ey);

                        // Arrowhead (points in the roll direction)
                        ctx.lineTo(gm.x - 10, ey - dir * 15);
                        ctx.moveTo(gm.x, ey);
                        ctx.lineTo(gm.x + 10, ey - dir * 15);
                        ctx.stroke();

                        // Also fill rect for body width
                        let w = (c.n === "The Log") ? 70 : 44;
                        ctx.fillStyle = ghostFill;
                        ctx.fillRect(gm.x - w / 2, Math.min(gm.y, ey), w, dist);
                    } else if (spellShape.type === 'circle') {
                        ctx.beginPath();
                        ctx.arc(gm.x, gm.y, spellShape.val, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                    } else if (spellShape.type === 'rect') {
                        ctx.beginPath();
                        ctx.rect(gm.x - spellShape.w / 2, gm.y - spellShape.h / 2, spellShape.w, spellShape.h);
                        ctx.fill();
                        ctx.stroke();
                    }

                    // Reset Dash
                    ctx.setLineDash([]);
                    ctx.lineWidth = 1;

                    // Center marker
                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.arc(gm.x, gm.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(0,0,0,0.5)";
                    ctx.stroke();
                } else {
                    // Snapped ghost preview — one shape per unit the card spawns, each
                    // the size that unit will actually be.
                    ctx.globalAlpha = 1.0;
                    let snap = this.snapToGrid(this.mouse.x, this.mouse.y);
                    let gx = snap.x, gy = snap.y;
                    let effR = this.effectRadius(c);          // splash for hop/suicide units
                    let range = effR > 0 ? 0 : (c.rn || 0);   // …otherwise the attack range
                    // The placement ghost is plain WHITE by default (never tinted by the
                    // unit's own colour — that olive/gray read as a stray "ghost dot"). It
                    // turns RED only where the card can't be placed (the river, the enemy
                    // half, on top of a structure, …) for clear "you can't drop here" feedback.
                    let valid = canAfford && this.eng.isValid(gy, gx, c, ghostTeam) && this.mouse.y < H - 150;
                    let col = valid ? "#ffffff" : "#ff5a5a";
                    let outline = valid ? "#ffffff" : "#ff5a5a";
                    let isBuilding = c.t === 3;

                    if (effR > 0) {
                        // Explosion / splash area (where the spirit or wall breaker
                        // hits) — a clear tinted disc so it's not "just a dot".
                        ctx.fillStyle = this.hexA(col, 0.3);
                        ctx.beginPath(); ctx.arc(gx, gy, effR, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = this.hexA(col, 0.95);
                        ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]);
                        ctx.beginPath(); ctx.arc(gx, gy, effR, 0, Math.PI * 2); ctx.stroke();
                        ctx.setLineDash([]); ctx.lineWidth = 1;
                    } else if (range > 0) {
                        ctx.beginPath();
                        ctx.strokeStyle = "rgba(255,255,255,0.4)";
                        ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
                        ctx.arc(gx, gy, range, 0, Math.PI * 2); ctx.stroke();
                        ctx.setLineDash([]); ctx.lineWidth = 1;
                    }
                    for (const gp of this.ghostLayout(c)) {
                        let px = gx + gp.dx, py = gy + gp.dy;
                        ctx.globalAlpha = 0.7;
                        ctx.fillStyle = col;
                        if (isBuilding) {
                            // Buildings show their VISUAL SQUARE (matches the deployed
                            // building), not a hitbox circle.
                            this.drawRoundRect(px - gp.r, py - gp.r, gp.r * 2, gp.r * 2, 4, true, false);
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
                            this.drawRoundRect(px - gp.r, py - gp.r, gp.r * 2, gp.r * 2, 4, false, false); ctx.stroke();
                        } else {
                            ctx.beginPath(); ctx.arc(px, py, gp.r, 0, Math.PI * 2); ctx.fill();
                            ctx.globalAlpha = 1.0;
                            ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
                            ctx.beginPath(); ctx.arc(px, py, gp.r + 1, 0, Math.PI * 2); ctx.stroke();
                        }
                        ctx.setLineDash([]); ctx.lineWidth = 1;
                    }
                    this.drawCenteredString(c.n, gx, gy - 26, "700 11px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.92)");
                }
                ctx.globalAlpha = 1.0;
            }

            // Per-projectile ground renderer (bullets, area effects, cannonball, the
            // delivery crate, boulders…). Arcs / arrows / drops / logs are handled by
            // drawProj instead, so return for those.
            const drawGroundProj = (p) => {
                // These are all drawn by drawProj — skip them here so the default circle
                // below never leaves a stray lightgray "ghost" dot under them.
                if (p.isArrows || p.isSpellArc || p.isLog || p.isSpellDrop || p.isVines ||
                    p.isDynamite || p.isIceCrystal || p.isPhantom || p.isElectricRing || p.isShockwave) return;
                if (p.isDeathBomb) {
                    // Balloon's crash bomb: just a black circle that falls onto the
                    // balloon's shadow, then sits ticking until it detonates (1.5s).
                    let drop = (p.dropFall && p.dropMax) ? (p.dropFall / p.dropMax) * 22 : 0;
                    // Ground shadow grows as the bomb nears the ground.
                    let sh = 5 + (1 - (drop / 22)) * 4;
                    ctx.fillStyle = "rgba(0,0,0,0.28)";
                    ctx.beginPath(); ctx.ellipse(p.x, p.y + 7, sh, sh * 0.45, 0, 0, Math.PI * 2); ctx.fill();
                    let by = p.y - drop;
                    ctx.fillStyle = "#000000";
                    ctx.beginPath(); ctx.arc(p.x, by, 11, 0, Math.PI * 2); ctx.fill();
                    return;
                }
                if (p.isBomb) {
                    // A dark bomb with a burning, shrinking fuse + spark.
                    let f = p.bombFuse / (p.bombMax || 30);
                    ctx.fillStyle = "rgba(0,0,0,0.22)";
                    ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#262629";
                    ctx.beginPath(); ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "rgba(255,255,255,0.25)";
                    ctx.beginPath(); ctx.arc(p.x - 2, p.y - 2, 2, 0, Math.PI * 2); ctx.fill();
                    // fuse + spark (burns down as the fuse runs out)
                    ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(p.x + 3, p.y - 5); ctx.lineTo(p.x + 5 + f * 3, p.y - 9 - f * 3); ctx.stroke();
                    let blink = Math.floor(Date.now() / 60) % 2 === 0;
                    ctx.fillStyle = blink ? "#ffd24d" : "#ff7a1e";
                    ctx.beginPath(); ctx.arc(p.x + 5 + f * 3, p.y - 9 - f * 3, 2.2, 0, Math.PI * 2); ctx.fill();
                    ctx.lineWidth = 1;
                    return;
                }
                if (p.isRage) {
                    if (p.rageWindup > 0) {
                        // A pink circle springs UP then back DOWN to splash (sin arc).
                        let prog = 1 - p.rageWindup / (p.rageMax || 28);
                        let hop = Math.sin(prog * Math.PI) * 34;
                        let by = p.y - hop;
                        // landing shadow
                        ctx.fillStyle = "rgba(0,0,0,0.25)";
                        ctx.beginPath(); ctx.ellipse(p.x, p.y, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
                        // A rounded-trapezoid GLASS bottle (wider at the base) with pink
                        // rage filling the lower part — plus a small cork.
                        let cx = p.x, cy0 = by - 5;
                        let topW = 13, botW = 21, bh = 15, r = 4;
                        let tY = cy0 - bh / 2, bY = cy0 + bh / 2;
                        const trap = (tw, bw, t0, b0) => {
                            ctx.beginPath();
                            ctx.moveTo(cx, t0);
                            ctx.arcTo(cx + tw / 2, t0, cx + bw / 2, b0, r);
                            ctx.arcTo(cx + bw / 2, b0, cx - bw / 2, b0, r);
                            ctx.arcTo(cx - bw / 2, b0, cx - tw / 2, t0, r);
                            ctx.arcTo(cx - tw / 2, t0, cx + tw / 2, t0, r);
                            ctx.closePath();
                        };
                        // cork
                        ctx.fillStyle = "#9a6a35";
                        ctx.fillRect(cx - 3.5, tY - 4, 7, 4);
                        // translucent glass body
                        ctx.fillStyle = "rgba(216,232,242,0.42)";
                        trap(topW, botW, tY, bY); ctx.fill();
                        // pink rage filling the lower ~60% (width interpolated to fit inside)
                        let midY = cy0 - 1;
                        let midW = topW + (botW - topW) * ((midY - tY) / bh);
                        ctx.fillStyle = "#ff5fb0";
                        trap(midW - 3, botW - 3, midY, bY - 1.5); ctx.fill();
                        // glass outline + a bright highlight streak (the shine)
                        ctx.strokeStyle = "rgba(150,30,90,0.35)"; ctx.lineWidth = 1.2;
                        trap(topW, botW, tY, bY); ctx.stroke();
                        ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.4;
                        ctx.beginPath(); ctx.moveTo(cx - topW / 2 + 3, tY + 3); ctx.lineTo(cx - botW / 2 + 4, bY - 3); ctx.stroke();
                        ctx.lineWidth = 1;
                    } else {
                        // Active rage pool — translucent PINK disc that gently pulses.
                        let pulse = 0.16 + 0.06 * Math.sin(Date.now() / 160);
                        ctx.fillStyle = `rgba(255,95,176,${pulse})`;
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = "rgba(255,130,195,0.6)"; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.stroke();
                        ctx.lineWidth = 1;
                    }
                    return;
                }
                if (p.shockBeams) {
                    // Electro Giant: near-straight electric beams that FLICKER (each
                    // blinks on/off rapidly).
                    let sx = p.shockSrc.x, sy = p.shockSrc.y - (p.shockSrc.fly ? 22 : 0);
                    ctx.lineCap = "round";
                    let phase = Math.floor(Date.now() / 35);
                    for (let i = 0; i < p.shockBeams.length; i++) {
                        if ((phase + i) % 2 !== 0) continue; // flicker (offset per beam)
                        let tgt = p.shockBeams[i];
                        let tx = tgt.x, ty = tgt.y - (tgt.fly ? 22 : 0);
                        let dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy) || 1;
                        let nx = -dy / len, ny = dx / len;
                        const pts = [];
                        for (let s = 0; s <= 3; s++) {
                            let f = s / 3;
                            let jit = (s === 0 || s === 3) ? 0 : (s % 2 === 0 ? 1.5 : -1.5); // barely jagged
                            pts.push([sx + dx * f + nx * jit, sy + dy * f + ny * jit]);
                        }
                        ctx.strokeStyle = "#5fa8ff"; ctx.lineWidth = 2.5;
                        ctx.beginPath(); pts.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
                        ctx.fillStyle = "#dceeff"; ctx.beginPath(); ctx.arc(tx, ty, 2.5, 0, Math.PI * 2); ctx.fill();
                    }
                    ctx.lineCap = "butt"; ctx.lineWidth = 1;
                    return;
                }
                if (p.barrel) {
                    ctx.fillStyle = "#643200";
                } else if (p.fireArea) {
                    // Explosions read as a BURST now: core flash + an expanding, fading
                    // shockring + radial sparks (Graphics: Low keeps just the flash).
                    let size = p.rad * 2;
                    const lifeK = Math.max(0, Math.min(1, (p.life || 1) / 6)); // 1 → 0 as it fades
                    if (p.isGray) {
                        ctx.fillStyle = "rgba(100, 100, 100, 0.7)";
                        ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "lightgray";
                        ctx.beginPath(); ctx.arc(p.x, p.y, size / 4, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.globalAlpha = 0.75 * (0.4 + 0.6 * lifeK);
                        ctx.fillStyle = p.flashCol || "#ff4500";
                        ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
                        ctx.globalAlpha = 1.0;
                        ctx.fillStyle = p.flashCol === "#cfeeff" ? "#eaf7ff" : "yellow";
                        ctx.beginPath(); ctx.arc(p.x, p.y, (size / 4) * (0.7 + 0.3 * lifeK), 0, Math.PI * 2); ctx.fill();
                    }
                    if (this.gfxHigh) {
                        const ringR = (size / 2) * (1.15 + (1 - lifeK) * 0.55);
                        ctx.globalAlpha = 0.85 * lifeK;
                        ctx.strokeStyle = p.isGray ? "#d8d8d8" : "#ffffff";
                        ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2); ctx.stroke();
                        // six radial sparks flying outward
                        ctx.lineWidth = 2; ctx.lineCap = "round";
                        for (let si = 0; si < 6; si++) {
                            const a = si * Math.PI / 3 + 0.35;
                            const r0 = ringR * 0.85, r1 = ringR * (1.0 + 0.25 * (1 - lifeK));
                            ctx.beginPath();
                            ctx.moveTo(p.x + Math.cos(a) * r0, p.y + Math.sin(a) * r0);
                            ctx.lineTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1);
                            ctx.stroke();
                        }
                        ctx.lineCap = "butt"; ctx.lineWidth = 1; ctx.globalAlpha = 1;
                    }
                } else if (p.isCannonball) {
                    // Royal Giant: a heavy dark cannonball with a highlight.
                    ctx.fillStyle = "#2b2b2b";
                    ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#5a5a5a";
                    ctx.beginPath(); ctx.arc(p.x - 2, p.y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
                    return;
                } else if (p.isDelivery) {
                    // Falling wooden crate: a shadow that grows over ~1.5s while the
                    // big crate descends into it.
                    let frac = 1 - (p.life - 5) / ((p.deliveryMax || 95) - 5);
                    frac = Math.max(0, Math.min(1, frac));
                    ctx.fillStyle = "rgba(0,0,0,0.3)";
                    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(4, p.rad * 0.75 * frac), 0, Math.PI * 2); ctx.fill();
                    // A plain cardboard box showing TWO faces: a cardboard TOP (trapezoid
                    // receding back) with a single seam line running through it, and a
                    // cardboard FRONT carrying a small rotated post-it / shipping label.
                    let cw = 42, hw = cw / 2, ch = 42, hy = ch / 2, dep = 9, fy = -hy + dep, inset = 6;
                    let ccy = p.y - (1 - frac) * 150;
                    ctx.save(); ctx.translate(p.x, ccy);
                    // cardboard TOP face (trapezoid receding straight back), a touch lighter
                    ctx.fillStyle = "#d8ad6a";
                    ctx.beginPath();
                    ctx.moveTo(-hw, fy); ctx.lineTo(-hw + inset, -hy); ctx.lineTo(hw - inset, -hy); ctx.lineTo(hw, fy);
                    ctx.closePath(); ctx.fill();
                    // seam line going through the top (front edge → back edge, down the middle)
                    ctx.strokeStyle = "rgba(90,60,25,0.7)"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(0, -hy); ctx.stroke();
                    // cardboard FRONT face
                    ctx.fillStyle = "#c79a5e"; ctx.fillRect(-hw, fy, cw, ch - dep);
                    // small rotated post-it / shipping label on the front
                    ctx.save();
                    ctx.translate(hw * 0.12, fy + (ch - dep) * 0.52);
                    ctx.rotate(-0.22);
                    ctx.fillStyle = "#f0e3a4"; // light yellowish note
                    ctx.fillRect(-9, -10, 18, 20);
                    ctx.strokeStyle = "rgba(120,100,40,0.55)"; ctx.lineWidth = 1; ctx.strokeRect(-9, -10, 18, 20);
                    // faint writing lines so it reads as a label
                    ctx.beginPath();
                    ctx.moveTo(-6, -3); ctx.lineTo(6, -3); ctx.moveTo(-6, 2); ctx.lineTo(6, 2); ctx.moveTo(-6, 7); ctx.lineTo(3, 7);
                    ctx.stroke();
                    ctx.restore();
                    // box outline
                    ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.5; ctx.strokeRect(-hw, fy, cw, ch - dep);
                    ctx.lineWidth = 1;
                    ctx.restore();
                    return;
                } else if (p.isHeal) {
                    ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
                } else if (p.redArea) {
                    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
                } else if (p.brownArea) {
                    ctx.fillStyle = p.impactCol || "#8b4513"; // solid impact colour
                } else if (p.poison) {
                    ctx.fillStyle = "rgba(0, 128, 0, 0.4)";
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.fill();
                } else if (p.graveyard) {
                    ctx.fillStyle = "rgba(0, 0, 139, 0.4)";
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.fill();
                } else if (p.isLightBlue) {
                    ctx.fillStyle = "#64c8ff";
                } else if (p.isClone) {
                    ctx.fillStyle = "rgba(0, 255, 255, 0.4)";
                } else if (p.isIceNova) {
                    ctx.fillStyle = "rgba(135, 206, 250, 0.6)"; // Light Sky Blue
                    // Instant size (no expansion animation)
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "white";
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.stroke();
                } else if (p.isRolling) {
                    if (p.isLog) {
                        if (p.barbBarrelLog) {
                            // A proper BARREL (not a log): rounded wooden body rolling on
                            // its side — two dark hoops around it, a stave seam along it.
                            let w = 42, h = 26, rx = p.x - w / 2, ry = p.y - h / 2;
                            ctx.fillStyle = (p.tm === 1) ? "#8b3a2e" : "#9c6b3a";
                            this.drawRoundRect(rx, ry, w, h, h * 0.45, true, false);
                            ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5;
                            this.drawRoundRect(rx, ry, w, h, h * 0.45, false, false); ctx.stroke();
                            ctx.strokeStyle = "#4d3018"; ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.moveTo(p.x - w * 0.22, ry + 1.5); ctx.lineTo(p.x - w * 0.22, ry + h - 1.5);
                            ctx.moveTo(p.x + w * 0.22, ry + 1.5); ctx.lineTo(p.x + w * 0.22, ry + h - 1.5);
                            ctx.stroke();
                            ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1;
                            ctx.beginPath(); ctx.moveTo(rx + 4, p.y); ctx.lineTo(rx + w - 4, p.y); ctx.stroke();
                            return; // skip default circle rendering
                        }
                        if (p.tm === 1) ctx.fillStyle = "#8b0000"; // Dark Red for Enemy
                        else ctx.fillStyle = "#8b4513"; // Brown for Player
                        // Render as rectangle
                        let w = 70, h = 20;
                        ctx.fillRect(p.x - w / 2, p.y - h / 2, w, h);
                        return; // Skip default circle rendering
                    }
                    ctx.fillStyle = "#640096";
                } else {
                    ctx.fillStyle = p.flashCol || (p.spl ? (p.rad < 10 ? "cyan" : "orange") : "lightgray");
                }

                // chainTargets / shockBeams draw their OWN lines below, and the heal effect
                // draws its own green ring in drawProj — none of them should ALSO drop the
                // default circle here (that was the stray "ghost dot").
                if (!p.fireArea && !p.poison && !p.graveyard && !p.chainTargets && !p.shockBeams && !p.isHeal) {
                    let size = p.rad * 2;
                    if (!p.spl && !p.barrel && !p.redArea && !p.brownArea && !p.isHeal && !p.barbBreak && !p.isRolling && !p.isLightBlue) size = 8;
                    ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
                }

                if (p.chainTargets) {
                    // A mostly-STRAIGHT blue electric current with only a few small jags
                    // and little sparkles travelling along it — a single flat colour, no
                    // glow / white highlight.
                    ctx.lineCap = "round";
                    for (let i = 0; i < p.chainTargets.length - 1; i++) {
                        let a = p.chainTargets[i], b = p.chainTargets[i + 1];
                        if (!a || !b) continue;
                        // Connect to each unit's VISUAL body (flying units float 22px
                        // above their shadow), not the ground point.
                        let ax = a.x, ay = a.y - (a.fly ? 22 : 0);
                        let bx = b.x, by = b.y - (b.fly ? 22 : 0);
                        let dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
                        let nx = -dy / len, ny = dx / len;
                        const segs = 5;
                        const pts = [];
                        for (let s = 0; s <= segs; s++) {
                            let f = s / segs;
                            let jit = (s === 0 || s === segs) ? 0 : (s % 2 === 0 ? 2 : -2); // very slight jag
                            pts.push([ax + dx * f + nx * jit, ay + dy * f + ny * jit]);
                        }
                        ctx.strokeStyle = "#4f9bff"; ctx.lineWidth = 3;
                        ctx.beginPath(); pts.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
                        // twinkling sparkles along the current
                        ctx.fillStyle = "#bfe3ff";
                        for (let s = 1; s < segs; s++) {
                            if ((Math.floor(Date.now() / 60) + s) % 2 === 0) {
                                ctx.beginPath(); ctx.arc(pts[s][0], pts[s][1], 1.3 + (s % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
                            }
                        }
                    }
                    ctx.lineCap = "butt"; ctx.lineWidth = 1;
                }
            };
            // Non-spell ground projectiles (bullets, cannonball, boulders, area
            // effects) render BELOW the ground troops.
            for (let p of this.eng.projs) if (!this.isSpellProj(p)) drawGroundProj(p);

            // Entities (Shadows/Effects first)
            for (let e of this.eng.ents) {
                if (e instanceof Troop) {
                    if ((e.c.n === "Sparky" || e.c.n === "Zappies") && e.chargeT > 0) {
                        this.drawCharge(e);
                    }
                    if (e.c.n === "Electro Giant") {
                        ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
                        // Match the logical radius: (rad + 10) * 2.0 approx
                        let r = (e.rad + 10) * 2.0;
                        ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.stroke();
                        ctx.lineWidth = 1;
                    }
                }

                // Soft ground shadow under units. Ground units cast it at their
                // feet; fliers float above a smaller one; a jumper's shadow
                // shrinks toward the apex.
                if (e instanceof Troop || e instanceof Building) {
                    let baseR = e.rad * 0.88;
                    if (e.fly) {
                        // Perfect-circle shadow for airborne units.
                        ctx.fillStyle = "rgba(0,0,0,0.18)";
                        ctx.beginPath(); ctx.arc(e.x, e.y + 4, baseR * 0.85, 0, Math.PI * 2); ctx.fill();
                    } else if (e instanceof Troop && e.jp && e.jt) {
                        let s = 1 - 0.4 * Math.sin((1.0 - (e.dist(e.jt) / (e.jd || 1))) * Math.PI);
                        ctx.fillStyle = "rgba(0,0,0,0.18)";
                        ctx.beginPath(); ctx.arc(e.x, e.y + baseR * 0.5, baseR * 0.6 * s, 0, Math.PI * 2); ctx.fill();
                    } else if (e instanceof Troop && e.sjT > 0) {
                        // Spirit mid-hop: a soft OVAL ground shadow that shrinks as it arcs up
                        // (reads as a real shadow, not a flat dot).
                        let s = 1 - 0.45 * Math.sin((1 - e.sjT / (e.sjMax || 1)) * Math.PI);
                        ctx.fillStyle = "rgba(0,0,0,0.20)";
                        ctx.beginPath(); ctx.ellipse(e.x, e.y + baseR * 0.5, baseR * 0.72 * s, baseR * 0.32 * s, 0, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.fillStyle = "rgba(0,0,0,0.20)";
                        ctx.beginPath(); ctx.arc(e.x, e.y + baseR * 0.5, baseR * 0.6, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }

            // Fallen units: a brief fall-over — the body squashes flat, slumps a touch,
            // and fades out (like the real game's death animations; Graphics: Low skips these).
            for (let ci = this.corpses.length - 1; ci >= 0; ci--) {
                const cp = this.corpses[ci];
                cp.life--;
                if (cp.life <= 0) { this.corpses.splice(ci, 1); continue; }
                const k = cp.life / cp.max; // 1 → 0
                ctx.globalAlpha = 0.65 * k;
                ctx.fillStyle = this.getUnitColor(cp.name);
                ctx.beginPath();
                ctx.ellipse(cp.x, cp.y + cp.rad * (1 - k) * 0.4, cp.rad * (1 + (1 - k) * 0.4), Math.max(2, cp.rad * k), 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Debug Path
            if (this.eng.debugView) {
                ctx.strokeStyle = "white";
                for (let e of this.eng.ents) {
                    if (e instanceof Troop && e.path.length > 0) {
                        ctx.beginPath();
                        let prevX = e.x, prevY = e.y;
                        for (let p of e.path) {
                            ctx.moveTo(prevX, prevY);
                            ctx.lineTo(p.x, p.y);
                            prevX = p.x; prevY = p.y;
                        }
                        ctx.stroke();
                    }
                }
            }

            // Layered draw order (bottom → top): ground units/towers, then flying
            // units above them, then deploy clocks, and finally spells on the very
            // top. (Anything airborne — a jumping unit, the goblin barrel — already
            // has fly set, so it renders in the flying layer.)
            // Inferno beams render BELOW the units.
            for (let e of this.eng.ents) {
                let isInf = e.atk && e.lk && e.lk.hp > 0 &&
                    ((e instanceof Troop && e.c.n === "Inferno Dragon") || (e instanceof Building && e.c.n === "Inferno Tower"));
                if (!isInf) continue;
                let stage = Math.min(5, Math.floor((e.infernoTick || 0) / 90)); // steps up only every ~1.5s
                let t = stage / 5;
                let rt = e.c.rt || 24;
                let pulse = 0.6 + 0.4 * ((e.cd || 0) / rt); // flares on each damage burst, dims during the delay
                let sy = e.y - (e.fly ? 22 : 0), ty = e.lk.y - (e.lk.fly ? 22 : 0);
                ctx.lineCap = "round";
                ctx.lineWidth = (3 + t * 9) * pulse;
                ctx.strokeStyle = `rgb(255, ${Math.round(200 - t * 200)}, ${Math.round(40 - t * 40)})`;
                ctx.beginPath(); ctx.moveTo(e.x, sy); ctx.lineTo(e.lk.x, ty); ctx.stroke();
                ctx.lineWidth = (1.5 + t * 3) * pulse;
                ctx.strokeStyle = `rgb(255, 255, ${Math.round(200 - t * 120)})`;
                ctx.beginPath(); ctx.moveTo(e.x, sy); ctx.lineTo(e.lk.x, ty); ctx.stroke();
                ctx.lineCap = "butt"; ctx.lineWidth = 1;
            }

            // Ground troops + buildings (NOT towers). Ghosts (Lumberjack rage-ghost, and
            // fallen Evo Skeleton Army skeletons) render as faint translucent phantoms.
            // Depth-sorted (by y) so a unit lower on screen always draws IN FRONT — two
            // troops never render ambiguously on top of each other.
            const groundBodies = this.eng.ents.filter(e => !e.fly && !(e instanceof Tower)).sort((a, b) => a.y - b.y);
            for (let e of groundBodies) this.drawEntityBody(e);

            // Only the rolling Log / Barbarian Barrel render here — above ground troops
            // but BELOW the towers.
            for (let p of this.eng.projs) if (p.isLog) this.drawProj(p);

            // Towers above the rolling logs.
            for (let e of this.eng.ents) if (!e.fly && (e instanceof Tower)) this.drawEntityBody(e);

            // Flying troops.
            const flyBodies = this.eng.ents.filter(e => e.fly).sort((a, b) => a.y - b.y);
            for (let e of flyBodies) this.drawEntityBody(e);

            // Deploy-time clocks (one per card, above the units)
            this.drawDeploys();

            // Health bars sit above every unit/tower/flyer (only spells go over them).
            this.drawHealthBars();

            // Every OTHER spell (arcs, Goblin Barrel, arrows, Zap / Freeze drops, the
            // delivery crate, area spells) renders ABOVE EVERYTHING.
            for (let p of this.eng.projs) if (this.isSpellProj(p) && !p.isLog) { drawGroundProj(p); this.drawProj(p); }

            // Status Effects
            for (let e of this.eng.ents) {
                if (e instanceof Troop && e.curseTime > 0) {
                    // Sit the curse on the unit's BODY (the visual/hitbox), not its ground
                    // shadow — a flying unit's body floats 22px above its shadow.
                    let cy = e.y - (e.fly ? 22 : 0);
                    let r = e.rad + 5;
                    // The Balloon's body is its ENVELOPE, drawn higher and larger than the
                    // nominal centre — put the ring there so it wraps the balloon, not the air.
                    if (e.c && e.c.n === "Balloon") { let R = e.rad * 0.88 * 1.1; cy -= R * 0.35; r = R + 5; }
                    ctx.fillStyle = "rgba(128, 0, 128, 0.4)";
                    ctx.beginPath(); ctx.arc(e.x, cy, r, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "magenta";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(e.x, cy, r, 0, Math.PI * 2); ctx.stroke();
                    ctx.lineWidth = 1;
                }
            }

            if (this.eng.debugView) {
                for (let e of this.eng.ents) {
                    if (e instanceof Troop) {
                        ctx.strokeStyle = "rgba(255, 255, 0, 0.2)";
                        ctx.beginPath(); ctx.arc(e.x, e.y, e.sightRange, 0, Math.PI * 2); ctx.stroke();
                        ctx.strokeStyle = "rgba(255, 165, 0, 0.6)";
                        let ar = e.c.rn;
                        if (ar > 0) { ctx.beginPath(); ctx.arc(e.x, e.y, ar, 0, Math.PI * 2); ctx.stroke(); }
                    } else if (e instanceof Tower || e instanceof Building) {
                        // attack reach: range param + the structure's own hitbox.
                        let rng = (e instanceof Tower) ? e.range : (e.c ? e.c.rn : 0);
                        if (rng > 0) {
                            ctx.strokeStyle = "rgba(255, 165, 0, 0.6)";
                            ctx.beginPath(); ctx.arc(e.x, e.y, rng + this.eng.getHitboxRadius(e), 0, Math.PI * 2); ctx.stroke();
                        }
                    }
                }
            }

            // Gameplay UI
            if (this.state === State.PLAY || this.state === State.CNT || this.state === State.OVER) {
                // HUD backdrop panel — starts exactly at the play-field bottom (810,
                // tile 27) so the bottom area lines up with the 18×32 grid.
                ctx.fillStyle = "rgba(18,26,22,0.82)";
                this.drawRoundRect(-12, H - 150, W + 24, 162, 16, true, false);

                // Elixir bar — full width, one screen edge to the other.
                const ebX = 0, ebY = H - 146, ebW = W, ebH = 16;
                ctx.fillStyle = "#2a1430";
                this.drawRoundRect(ebX, ebY, ebW, ebH, 11, true, false);
                let elxPct = Math.max(0, Math.min(1, this.eng.p1.elx / 10.0));
                if (elxPct > 0.001) {
                    ctx.fillStyle = "#d426c8";
                    this.drawRoundRect(ebX, ebY, ebW * elxPct, ebH, 11, true, false);
                }
                ctx.strokeStyle = "rgba(0,0,0,0.35)";
                ctx.lineWidth = 1;
                for (let i = 1; i < 10; i++) {
                    let px = ebX + i * (ebW / 10);
                    ctx.beginPath(); ctx.moveTo(px, ebY + 3); ctx.lineTo(px, ebY + ebH - 3); ctx.stroke();
                }
                this.drawCenteredString(`${Math.floor(this.eng.p1.elx)}`, W / 2, ebY + ebH - 6, "bold 15px 'Baloo 2', 'Segoe UI', sans-serif", "white");

                // Debug Opponent Elixir
                if (this.eng.debugEnemyElixir) {
                    ctx.fillStyle = "red";
                    ctx.font = "bold 20px 'Baloo 2', 'Segoe UI', sans-serif";
                    ctx.textAlign = "right";
                    ctx.fillText(`OPP: ${Math.floor(this.eng.p2.elx)}`, W - 10, 60);
                }

                // Cards
                for (let i = 0; i < 4; i++) {
                    if (i < this.eng.p1.h.length) {
                        let c = this.eng.p1.h[i];
                        let r = this.cardRects[i];
                        let hoverOff = this.cardOffsets[i] || 0;

                        let isSel = this.eng.sel === c;
                        let canAfford = this.eng.p1.elx >= c.c;

                        // Only a SELECTED card pokes up, and only a little (hovering
                        // does nothing).
                        let paintY = r.y - (isSel ? 12 : 0);

                        // When this card's evolution is charged, the NEXT play is the evo —
                        // so the face shows the evo version (gem-stamped units).
                        let evoReady = this.eng.p1.evos && this.eng.p1.evos.has(c.n) &&
                            (this.eng.p1.evoProgress[c.n] || 0) >= this.eng.EVO_REQ[c.n];

                        // Same face as the deck builder: name on top, the unit visual under
                        // it, elixir badge. Greyed when unaffordable.
                        if (c.n === "Mirror" && this.eng.p1.lastPlayedCard) {
                            // Mirror wears the face of the card it will replay (the engine
                            // keeps c.c at that card's cost +1), tinted + tagged as Mirror.
                            const mc = this.eng.p1.lastPlayedCard;
                            this.drawCardFace(r.x, paintY, r.w, r.h, mc, canAfford ? "#f2e7fa" : "#b9bdb7", false);
                            this.drawElixirCost(r.x + 13, paintY + 13, c.c);
                            ctx.fillStyle = "#8a6bbf";
                            this.drawRoundRect(r.x + r.w / 2 - 25, paintY + r.h - 16, 50, 13, 6, true, false);
                            this.drawCenteredString("MIRROR", r.x + r.w / 2, paintY + r.h - 6, "800 8px 'Baloo 2', 'Segoe UI', sans-serif", "#ffffff");
                        } else {
                            this.drawCardFace(r.x, paintY, r.w, r.h, c, canAfford ? "#ffffff" : "#b9bdb7", evoReady);
                        }
                        if (isSel) {
                            ctx.strokeStyle = "#ffd24d"; ctx.lineWidth = 3;
                            this.drawRoundRect(r.x, paintY, r.w, r.h, 5, false, false); ctx.stroke();
                            ctx.lineWidth = 1;
                        }
                        // Evolution indicator: purple diamonds fill as the card cycles;
                        // once charged (progress >= req) they glow. Playing the evo resets.
                        if (this.eng.p1.evos && this.eng.p1.evos.has(c.n)) {
                            let req = this.eng.EVO_REQ[c.n];
                            let prog = this.eng.p1.evoProgress[c.n] || 0;
                            let charged = prog >= req;
                            if (charged) {
                                ctx.strokeStyle = "#c45cff"; ctx.lineWidth = 2;
                                this.drawRoundRect(r.x, paintY, r.w, r.h, 5, false, false); ctx.stroke(); ctx.lineWidth = 1;
                            }
                            this.drawEvoPips(r.x + r.w / 2, paintY + r.h - 7, req, charged ? req : prog, charged);
                        }
                    }
                }

                // Next Card
                if (this.eng.p1.pile.length > 0) {
                    let nextC = this.eng.p1.pile[0];
                    let nr = this.nextCardRect;
                    ctx.fillStyle = "rgba(255,255,255,0.18)";
                    this.drawRoundRect(nr.x, nr.y, nr.w, nr.h, 5, true, false);
                    this.drawCenteredString("Next", nr.x + nr.w / 2, nr.y + 14, "600 9px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.85)");
                    // Stack the name word-by-word in a small font so it fits the card.
                    let words = nextC.n.split(' ');
                    let fy = nr.y + nr.h / 2 - (words.length - 1) * 4.5 + 6;
                    for (let wd of words) {
                        this.drawCenteredString(wd, nr.x + nr.w / 2, fy, "700 8px 'Baloo 2', 'Segoe UI', sans-serif", "white");
                        fy += 9;
                    }
                }

                // Timer / Messages
                if (this.state === State.CNT) {
                    // COUNTDOWN OVERLAY
                    let elapsed = Date.now() - this.t0;
                    let count = 3 - Math.floor(elapsed / 1000);
                    if (count > 0) {
                        ctx.fillStyle = "rgba(0,0,0,0.5)";
                        ctx.fillRect(0, 0, W, H);
                        this.drawCenteredString(count.toString(), W / 2, H / 2, "bold 100px 'Baloo 2', 'Segoe UI', sans-serif", "white");
                    }
                } else {
                    let time = (Date.now() - this.eng.gameStart) / 1000;
                    let remaining = 180 - time;
                    if (remaining < 0) remaining = 0; // Overtime handled by state
                    // Both banners want centre screen; when they're up at the same time
                    // (tiebreaker starts while the elixir banner is still fading) they
                    // stack instead of drawing on top of each other.
                    const bothBanners = this.eng.tiebreaker && this.eng.doubleElixirAnim > 0;
                    if (this.eng.tiebreaker) {
                        this.drawCenteredString("TIEBREAKER!", W / 2, bothBanners ? H / 2 - 32 : H / 2, "bold 40px 'Baloo 2', 'Segoe UI', sans-serif", "red");
                    }

                    if (this.eng.doubleElixirAnim > 0) {
                        ctx.globalAlpha = this.eng.doubleElixirAnim / 100;
                        this.drawCenteredString("2x ELIXIR", W / 2, bothBanners ? H / 2 + 36 : H / 2, "bold 50px 'Baloo 2', 'Segoe UI', sans-serif", "magenta");
                        ctx.globalAlpha = 1.0;
                    }

                    let mins = Math.floor(remaining / 60);
                    let secs = Math.floor(remaining % 60);
                    let timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                    ctx.fillStyle = (remaining <= 10 && remaining % 1 > 0.5) ? "red" : "black"; // Blink effect
                    if (this.eng.tiebreaker) ctx.fillStyle = "red";
                    ctx.font = "bold 20px 'Baloo 2', 'Segoe UI', sans-serif";
                    ctx.fillText(timeStr, W - 40, 30);

                    // Save & quit the match (single-player only — MP can't pause/park).
                    if (!this.eng.isMultiplayer && this.state === State.PLAY) {
                        this.drawBtn(this.saveQuitBtn, "SAVE+QUIT", "#5a7ea6");
                    }
                }
            }


        } // End PLAY|CNT block

        if (this.state === State.SANDBOX) {
            // Bottom bar replaces the card/elixir HUD — same panel style, same strip
            // (the play field above keeps its exact 18×27 tile grid).
            ctx.fillStyle = "rgba(18,26,22,0.82)";
            this.drawRoundRect(-12, H - 150, W + 24, 162, 16, true, false);

            // Row 1: card picker, side, map, tools.
            this.drawBtn(this.sbDeckBtn, "DECK", "#FFA500");
            let blue = this.eng.sandboxSide === 0;
            this.drawBtn(this.sbSideBtn, blue ? "SIDE: BLUE" : "SIDE: RED", blue ? "#3296ff" : "#ff5a5a");
            this.drawBtn(this.sbMapBtn, `MAP: ${this.sbMapNames[this.eng.sandboxMap] || '?'}`, "#39c44e");
            this.drawBtn(this.sbToolsBtn, this.sandboxEraser ? "TOOLS ✶" : "TOOLS", this.sandboxEraser ? "#e84d8a" : "#8a8f5a");

            // Row 2: world edit, speed, pause, back.
            this.drawBtn(this.sbWorldBtn, "WORLD", "#3aa17e");
            this.drawBtn(this.sbSpeedBtn, `SPEED ${this.sandboxSpeed}x`, "#e0b13c");
            this.drawBtn(this.sbPauseBtn, this.sandboxPaused ? "PLAY" : "PAUSE", this.sandboxPaused ? "#39c44e" : "#e0b13c");
            this.drawBtn(this.sbBackBtn, "BACK", "#FF6347");

            // Hint line: what a field tap will do right now.
            let hint;
            if (this.sandboxEraser) hint = "Eraser: tap a troop to delete it";
            else if (this.sandboxTowerArm) hint = `Placing: ${this.sandboxTowerArm === 'king' ? 'King' : 'Princess'} Tower`;
            else if (this.eng.sel) hint = `Placing: ${this.eng.sel.n}${this.sandboxEvoSel && this.eng.isEvoCapable(this.eng.sel.n) ? " (EVO)" : ""}`;
            else hint = "DECK to pick a card · tap a card's crystal for its EVO";
            this.drawCenteredString(hint, W / 2, H - 36, "600 12px 'Baloo 2', 'Segoe UI', sans-serif", "#d9e8d9");

            // Frozen-sim banner so a pause is obvious at a glance.
            if (this.sandboxPaused) {
                ctx.fillStyle = "rgba(0,0,0,0.45)";
                this.drawRoundRect(W / 2 - 70, 10, 140, 34, 10, true, false);
                this.drawCenteredString("PAUSED", W / 2, 33, "bold 18px 'Baloo 2', 'Segoe UI', sans-serif", "#ffd24d");
            }

            // Eraser / tower-stamp cursor on the field.
            if (this.mouse.y < H - 150 && !this.sandboxDeckOpen && !this.sandboxMapOpen && !this.sandboxToolsOpen && !this.sandboxWorldOpen) {
                if (this.sandboxEraser) {
                    if (this.eraserImgLoaded) {
                        // Pixel art at images/eraser.png, drawn crisp (no smoothing).
                        const sz = 52;
                        let prev = ctx.imageSmoothingEnabled;
                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(this.eraserImg, this.mouse.x - sz / 2, this.mouse.y - sz / 2, sz, sz);
                        ctx.imageSmoothingEnabled = prev;
                    } else {
                        this.drawEraserIcon(this.mouse.x, this.mouse.y, 1.9);
                    }
                } else if (this.sandboxTowerArm) {
                    let gm = this.snapToGrid(this.mouse.x, this.mouse.y);
                    let r = (this.sandboxTowerArm === 'king' ? 50 : 36) * 0.88;
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = "#b65cd6";
                    this.drawRoundRect(gm.x - r, gm.y - r, r * 2, r * 2, 8, true, false);
                    ctx.globalAlpha = 1;
                }
            }

            // ---- Popups (drawn over the bar) ----
            // The title is anchored a clear margin ABOVE the first button so the
            // two never collide.
            const popupBg = (title, firstBtnY) => {
                ctx.fillStyle = "rgba(0,0,0,0.62)";
                ctx.fillRect(0, 0, W, H);
                this.drawCenteredString(title, W / 2, firstBtnY - 28, "bold 26px 'Baloo 2', 'Segoe UI', sans-serif", "#ffffff");
            };
            if (this.sandboxMapOpen) {
                let rects = this.sandboxMapRects();
                popupBg("Choose a Map", rects[0].y);
                for (const o of rects) {
                    let active = o.map === this.eng.sandboxMap;
                    this.drawBtn(o, o.label + (active ? "  ✓" : ""), active ? "#39c44e" : "#3296ff");
                }
            } else if (this.sandboxToolsOpen) {
                let rects = this.sandboxToolRects();
                popupBg("Tools", rects[0].y);
                for (const o of rects) this.drawBtn(o, o.label, o.color);
            } else if (this.sandboxWorldOpen) {
                let rects = this.sandboxWorldRects();
                popupBg("World Edit", rects[0].y - 26); // leave room for the info line
                for (const o of rects) this.drawBtn(o, o.label, o.color);
                if (!this.eng.sandboxNoRiver) {
                    this.drawCenteredString(`River y: ${this.eng.RIV_Y} · Bridges: ${(this.eng.bridgeXs || []).map(b => Math.round(b)).join(' / ')}`,
                        W / 2, rects[0].y - 16, "600 12px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.75)");
                }
            } else if (this.sandboxSpeedOpen) {
                this.drawSpeedPopup();
            }

            // ---- Full-screen ALL-cards picker (mirrors the deck-builder look) ----
            if (this.sandboxDeckOpen) {
                this.paintBg(this.theme().deck);
                let cols = 4, margin = 20, cardW = (W - 5 * margin) / 4, cardH = 140;
                for (let i = 0; i < this.eng.allCards.length; i++) {
                    let c = this.eng.allCards[i];
                    let row = Math.floor(i / cols), col = i % cols;
                    let cx = margin + col * (cardW + margin);
                    let cy = 100 + row * (cardH + margin) - this.scrollY;
                    if (cy > H || cy + cardH < 0) continue;
                    this.drawDeckCard(cx, cy, cardW, cardH, c, this.eng.sel === c, this.sandboxEvoSel && this.eng.sel === c);
                    // Evo crystal on every evo-capable card: tap it to summon the EVO.
                    if (this.eng.isEvoCapable(c.n)) {
                        let armed = this.eng.sel === c && this.sandboxEvoSel;
                        let req = this.eng.EVO_REQ[c.n];
                        if (armed) { ctx.strokeStyle = "#b13bff"; ctx.lineWidth = 2.5; this.drawRoundRect(cx, cy, cardW, cardH, 10, false, false); ctx.stroke(); ctx.lineWidth = 1; }
                        this.drawEvoPips(cx + cardW / 2, cy + cardH - 8, req, armed ? req : 0, armed);
                    }
                }
                // Header panel
                ctx.fillStyle = "rgba(10,18,12,0.94)";
                ctx.fillRect(0, 0, W, 92);
                ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(W, 92); ctx.stroke();
                this.drawCenteredString("Pick a Card", W / 2, 38, "bold 26px 'Baloo 2', 'Segoe UI', sans-serif", "#eaffea");
                let selLbl = this.eng.sel ? `Selected: ${this.eng.sel.n}${this.sandboxEvoSel ? " (EVO)" : ""}` : "tap a crystal to summon the EVO";
                this.drawCenteredString(selLbl, W / 2, 70, "600 13px 'Baloo 2', 'Segoe UI', sans-serif", "#d9a8ff");
                // Opaque footer behind BACK so the card grid never shows through it.
                ctx.fillStyle = "rgba(10,18,12,0.94)";
                ctx.fillRect(0, H - 140, W, 140);
                ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, H - 140); ctx.lineTo(W, H - 140); ctx.stroke();
                this.drawBtn(this.backBtn, "BACK", "#FF6347");
            }
        }

        if (this.state === State.OVER) {
            // The frozen battlefield + cards stay fully visible underneath; only a
            // light dim + a centered result panel sit on top as the overlay.
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(0, 0, W, H);
            let pw = 300, ph = 190, px = W / 2 - pw / 2, py = H / 2 - 105;
            ctx.fillStyle = "rgba(18,26,22,0.9)";
            this.drawRoundRect(px, py, pw, ph, 18, true, false);
            let msg = this.eng.win === 0 ? "You Win!" : "You Lose!";
            let color = this.eng.win === 0 ? "#32CD32" : "#FF6347";
            this.drawCenteredString(msg, W / 2, H / 2 - 50, "bold 50px 'Baloo 2', 'Segoe UI', sans-serif", color);
            this.drawBtn(this.exitBtn, "EXIT", "#FFA500");
        }
    } // End render()

    drawEntityBody(e, card = false) {
        // A unit at 0 HP is gone visually — it may still linger a few ticks in the
        // engine (the dying delay that lets mutual kills draw), but it must DISAPPEAR
        // immediately on screen, with no leftover body or health bar (so a one-shot
        // kill never flashes a bar).
        if (e.hp <= 0) return;

        let x = e.x;
        let y = e.y;
        // Sprite is drawn smaller than the collision/hitbox radius so units keep
        // a gap instead of clipping into each other and the towers.
        let radius = e.rad * 0.88;

        // A LEAPING troop (Mega-Knight jump, river hop, an Evo-MK knock-jump victim) arcs
        // up from the ground and back to it, so its height must start and end at 0.
        const isLeaping = e instanceof Troop && e.jp && e.jdx !== undefined;

        // Natural fliers float a FIXED height above their ground shadow. A leaper does not —
        // applying that flat offset would pop the body up 22px the instant the leap begins
        // and drop it 22px on landing (the "teleport"); its height is purely the arc below.
        if (e.fly && !isLeaping) {
            y -= 22;
            radius *= 1.1;
        }

        // Jump offset — a smooth arc that is 0 at take-off and at landing.
        if (isLeaping) {
            let progress = 1.0 - (Math.hypot(e.jdx - e.x, e.jdy - e.y) / (e.jd || 1));
            y -= 42.0 * Math.sin(progress * Math.PI);
        }

        // Spirit hop onto the enemy — arc up (the ground shadow stays put, showing
        // it's airborne) then explode on landing.
        if (e instanceof Troop && e.sjT > 0) {
            let prog = 1 - e.sjT / (e.sjMax || 1);
            y -= 20 * Math.sin(prog * Math.PI);
        }

        // Faux-3D: every unit casts a soft contact shadow on the ground (e.x/e.y is the
        // ground point — the body floats above it for fliers/leapers). Skipped on the
        // deck card, which sits on a flat coloured tile.
        if (!card) this.unitShadow(e.x, e.y, e.rad * 0.88, !!(e.fly && !isLeaping));

        // (Sparky / Zappies charge ring is drawn once in drawCharge — no duplicate
        // aura here.)
        let name = e.c ? e.c.n : "";
        if (name === "Elite Musketeer") name = "Musketeer"; // display name only — stats stay elite

        let isFriend = (e.tm === 0);
        // Each unit keeps its own identity color; friend vs foe is shown ONLY by
        // the health-bar color drawn below. Crown towers stay team-colored.
        let color;
        if (e instanceof Tower) {
            color = isFriend ? "#4aa3ff" : "#ff5a5a";
        } else {
            color = this.getUnitColor(e.c ? e.c.n : name); // colour by the REAL card (so Elite ≠ regular Musketeer)
            if (e.isClone) color = "#bce8ff"; // light tint; translucency comes from globalAlpha below
            if (e.isGhosted) color = "#bce8ff"; // ghosts render like clones — pale glassy blue
            if (e.c && e.c.isFake) color = "#c4e3a6"; // fake (decoy) goblins: pale, washed-out green
            if (e.isSkeleGeneral) color = "#a35cd6"; // the Skeleton Army general is purple
        }

        // Freeze/Slow status tints temporarily override the identity color. A Fireball
        // slow (slowMul 0.5) leaves NO tint — only icy slows (0.65x) read blue.
        if (e instanceof Troop) {
            if (e.fr > 0) color = "#bfe8ff";
            else if (e.sl > 0 && !(e.slowMul > 0 && e.slowMul < 0.6)) color = "#9ad2f5"; // Fireball slows (0.5/0.2) leave no tint
        }

        // While deploying, the body is a touch translucent (the per-card clock
        // indicator is drawn separately, once per card — see drawDeploys).
        ctx.globalAlpha = (e instanceof Troop && e.deployTime > 0) ? 0.75 : 1;
        if (e.isClone) ctx.globalAlpha *= 0.5; // cloned troops are translucent
        if (e.isGhosted) ctx.globalAlpha *= 0.4; // ghosts are see-through, like clones
        if (e.c && e.c.isFake) ctx.globalAlpha *= 0.8; // fakes read slightly ghostly
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; // soft outline, not harsh black
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (e instanceof Tower) {
            // ROUNDED TOWER
            let r = radius;
            this.extrudeWall(x, y, r, card ? 0 : r * 0.85, color, false); // raised block
            ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
            this.drawRoundRect(x - r, y - r, r * 2, r * 2, 8, true, false); // lit top face
            ctx.stroke();
            // Flat two-tone finish: a darker inner border band inside the rim.
            if (this.gfxHigh && typeof color === "string" && color[0] === "#") {
                const tb = Math.max(3, r * 0.13);
                ctx.strokeStyle = this.shade(color, -0.12); ctx.lineWidth = tb;
                this.drawRoundRect(x - r + tb / 2 + 1, y - r + tb / 2 + 1, 2 * r - tb - 2, 2 * r - tb - 2, 6, false, false);
                ctx.stroke();
                ctx.lineWidth = 1;
            }
            // Turret(s) rotate to aim at the tower's current target, each with a
            // barrel sticking out. The KING also has a smaller "shooter" above.
            // Smoothly ease the displayed turret angle toward the aim angle (along
            // the shortest arc) so the barrel turns instead of snapping.
            let aim = (e.aimAngle !== undefined) ? e.aimAngle : (isFriend ? -Math.PI / 2 : Math.PI / 2);
            if (e.dispAngle === undefined) e.dispAngle = aim;
            let da = aim - e.dispAngle;
            while (da > Math.PI) da -= 2 * Math.PI;
            while (da < -Math.PI) da += 2 * Math.PI;
            e.dispAngle += da * 0.16;
            let ang = e.dispAngle;
            const turret = (cx, cy, tr, withBarrel) => {
                // barrel (drawn first, under the base, pointing toward the target)
                if (withBarrel) {
                    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
                    ctx.fillStyle = "#3a3e44";
                    ctx.fillRect(tr * 0.3, -tr * 0.34, tr * 1.35, tr * 0.68);
                    ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1;
                    ctx.strokeRect(tr * 0.3, -tr * 0.34, tr * 1.35, tr * 0.68);
                    ctx.restore();
                }
                // turret base + muzzle
                ctx.fillStyle = "#4a4e55";
                ctx.beginPath(); ctx.arc(cx, cy, tr, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1; ctx.stroke();
                ctx.fillStyle = "#26282c";
                ctx.beginPath(); ctx.arc(cx, cy, tr * 0.44, 0, Math.PI * 2); ctx.fill();
            };
            if (e.noTurret) {
                // Heist king: keeps the big spell-vent cannon, but has no shooter
                // station or hatch (and never fires — see Tower.act).
                let fs = isFriend ? -1 : 1;
                turret(x, y - fs * r * 0.32, r * 0.4, false);
            } else if (!e.kg) {
                turret(x, y, r * 0.5, true); // princess cannon — barrel, aims
            } else {
                // King: big spell vent (no barrel) pushed BACK; the aiming shooter
                // lives in a box toward the FRONT and rises out of it on activation.
                let fs = isFriend ? -1 : 1;                   // front = toward the enemy half
                turret(x, y - fs * r * 0.32, r * 0.4, false); // spell vent, pushed back
                let shY = y + fs * r * 0.52, bs = r * 0.32;   // shooter station, toward the front
                // rounded-rect path (keeps the soft outline, slightly rounded corners)
                const rr = (rx, ry, rw, rh, rad) => {
                    rad = Math.min(rad, rw / 2, rh / 2);
                    ctx.beginPath();
                    ctx.moveTo(rx + rad, ry);
                    ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rad);
                    ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
                    ctx.arcTo(rx, ry + rh, rx, ry, rad);
                    ctx.arcTo(rx, ry, rx + rw, ry, rad);
                    ctx.closePath();
                };
                // box mount
                ctx.fillStyle = "#3a3e44"; rr(x - bs, shY - bs, bs * 2, bs * 2, 5); ctx.fill();
                ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.lineWidth = 1;
                // open fraction: 0 asleep, 0→1 during the wake animation, 1 active
                let p = !e.actv ? 0 : (e.activateAnim > 0 ? 1 - e.activateAnim / 45 : 1);
                let sp = Math.max(0, (p - 0.2) / 0.8); // shooter scales up as the lids part
                if (sp > 0) turret(x, shY, r * 0.28 * sp, sp > 0.55);
                // Two lids: meet in the middle when closed, slide apart as it opens,
                // and REMAIN open at the sides afterwards (they never disappear).
                let slide = p * (bs + 2);
                ctx.fillStyle = "#5a5f66"; ctx.strokeStyle = "rgba(0,0,0,0.4)";
                rr(x - bs - slide, shY - bs, bs + 1, bs * 2, 4); ctx.fill(); ctx.stroke();
                rr(x + slide - 1, shY - bs, bs + 1, bs * 2, 4); ctx.fill(); ctx.stroke();
            }
            ctx.lineWidth = 1;
        } else if (e instanceof Building) {
            let s = radius;
            const bn = e.c ? e.c.n : "";
            // Ease a display angle toward the current target (for aimed buildings).
            let aim = (e.tm === 0) ? -Math.PI / 2 : Math.PI / 2;
            if (e.lk && e.lk.hp > 0) aim = Math.atan2(e.lk.y - y, e.lk.x - x);
            if (e.dispAngle === undefined) e.dispAngle = aim;
            let da = aim - e.dispAngle;
            while (da > Math.PI) da -= 2 * Math.PI;
            while (da < -Math.PI) da += 2 * Math.PI;
            e.dispAngle += da * 0.15;

            if (bn === "Cannon") {
                // A round WOODEN base with an actual cannon on top, aimed at its target.
                ctx.fillStyle = "#8a5c33"; ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(x, y, s * 1.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                if (this.gfxHigh) { // plank seams
                    ctx.strokeStyle = "rgba(0,0,0,0.22)"; ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(x - s * 0.95, y - s * 0.35); ctx.lineTo(x + s * 0.95, y - s * 0.35);
                    ctx.moveTo(x - s * 0.95, y + s * 0.35); ctx.lineTo(x + s * 0.95, y + s * 0.35);
                    ctx.stroke();
                }
                ctx.save(); ctx.translate(x, y); ctx.rotate(e.dispAngle);
                ctx.fillStyle = "#33373d";                                 // barrel
                this.drawRoundRect(0, -s * 0.26, s * 1.35, s * 0.52, s * 0.2, true, false);
                ctx.fillStyle = "#22252a";                                 // muzzle
                ctx.fillRect(s * 1.12, -s * 0.3, s * 0.24, s * 0.6);
                ctx.fillStyle = "#4a4e55";                                 // breech
                ctx.beginPath(); ctx.arc(0, 0, s * 0.48, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                ctx.lineWidth = 1;
            } else if (bn === "Inferno Tower") {
                // Round base with a glowing core that flares while it burns a target.
                ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                this.tone2Circle(x, y, s, color);
                ctx.fillStyle = "#2c2118";
                ctx.beginPath(); ctx.arc(x, y, s * 0.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = e.atk ? "#ffb63c" : "#e06a2c";
                ctx.beginPath(); ctx.arc(x, y, s * (e.atk ? 0.34 : 0.24), 0, Math.PI * 2); ctx.fill();
                ctx.lineWidth = 1;
            } else if (bn === "Tesla") {
                // Underground: just a closed hatch on the ground (like the king's
                // shooter box) — untargetable, unhittable, walk right over it.
                if (e.teslaHidden) {
                    ctx.fillStyle = "#3b4148"; ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.5;
                    this.drawRoundRect(x - s * 0.55, y - s * 0.4, s * 1.1, s * 0.8, s * 0.2, true, false); ctx.stroke();
                    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(x - s * 0.35, y); ctx.lineTo(x + s * 0.35, y); ctx.stroke();
                    ctx.lineWidth = 1;
                    return; // no body, no bars, nothing else
                }
                // A smaller, BLUE Inferno-style tower: round base, dark core, bright
                // centre that flares while it zaps.
                const ts = s * 0.85;
                ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(x, y, ts, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                this.tone2Circle(x, y, ts, color);
                ctx.fillStyle = "#1e3742";
                ctx.beginPath(); ctx.arc(x, y, ts * 0.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = e.atk ? "#eaffff" : "#9fdcf2";
                ctx.beginPath(); ctx.arc(x, y, ts * (e.atk ? 0.34 : 0.24), 0, Math.PI * 2); ctx.fill();
                ctx.lineWidth = 1;
            } else if (bn === "Bomb Tower") {
                // Plain round stone tower — no bomb on show; just a darker inner disc.
                ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                this.tone2Circle(x, y, s, color);
                ctx.fillStyle = this.shade(color, -0.22);
                ctx.beginPath(); ctx.arc(x, y, s * 0.42, 0, Math.PI * 2); ctx.fill();
                ctx.lineWidth = 1;
            } else {
                // (Tombstone deliberately falls through here: it looks almost like any
                // other tower — the standard square — plus a small cross on the face.)
                this.extrudeWall(x, y, s, card ? 0 : s * 0.85, color, false); // raised block
                ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.rect(x - s, y - s, s * 2, s * 2);        // lit top face
                ctx.fill();
                ctx.stroke();
                // Flat two-tone finish: darker inner border band + a lighter top edge.
                if (this.gfxHigh && typeof color === "string" && color[0] === "#" && s > 8) {
                    const ib = Math.min(5, Math.max(2, s * 0.18));
                    ctx.strokeStyle = this.shade(color, -0.13); ctx.lineWidth = ib;
                    ctx.strokeRect(x - s + ib / 2 + 1, y - s + ib / 2 + 1, 2 * (s - ib / 2 - 1), 2 * (s - ib / 2 - 1));
                    ctx.strokeStyle = this.shade(color, 0.24); ctx.lineWidth = Math.max(1.5, ib * 0.6);
                    ctx.beginPath(); ctx.moveTo(x - s + ib + 2, y - s + ib); ctx.lineTo(x + s - ib - 2, y - s + ib); ctx.stroke();
                    ctx.lineWidth = 1;
                }
                if (bn === "Tombstone") {
                    // Its one identifying mark: a small cross on the face.
                    ctx.strokeStyle = this.shade(color, -0.3); ctx.lineWidth = Math.max(2, s * 0.12); ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(x, y - s * 0.4); ctx.lineTo(x, y + s * 0.35);
                    ctx.moveTo(x - s * 0.26, y - s * 0.12); ctx.lineTo(x + s * 0.26, y - s * 0.12);
                    ctx.stroke();
                    ctx.lineCap = "butt"; ctx.lineWidth = 1;
                }
            }
            if (FAUX3D) {
                // raised bevel (flat solid edges, no gradient): bright top-left, dark bottom-right
                ctx.lineWidth = 2.2;
                ctx.strokeStyle = "rgba(255,255,255,0.30)";
                ctx.beginPath(); ctx.moveTo(x - s, y + s); ctx.lineTo(x - s, y - s); ctx.lineTo(x + s, y - s); ctx.stroke();
                ctx.strokeStyle = "rgba(0,0,0,0.34)";
                ctx.beginPath(); ctx.moveTo(x + s, y - s); ctx.lineTo(x + s, y + s); ctx.lineTo(x - s, y + s); ctx.stroke();
                ctx.lineWidth = 1;
            }
        } else if (e.c && e.c.n === "Skeleton Barrel") {
            // A wooden barrel: brown disc with two darker hoop bands.
            ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = "rgba(60,36,14,0.55)"; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - radius * 0.9, y - radius * 0.35); ctx.lineTo(x + radius * 0.9, y - radius * 0.35);
            ctx.moveTo(x - radius * 0.9, y + radius * 0.35); ctx.lineTo(x + radius * 0.9, y + radius * 0.35);
            ctx.stroke(); ctx.lineWidth = 1;
            ctx.beginPath(); // keep the generic stroke below happy (no-op path)
        } else if (e.c && e.c.n === "Balloon") {
            // A PLAIN balloon in the team's colour (blue = yours, red = enemy): a blank
            // round envelope over a simple rectangle basket that peeks out underneath —
            // the balloon covers the basket's top. No ropes, seams, or decorations.
            let R = radius;
            let ey = y - R * 0.35;                       // envelope centre (raised up)
            let bw = R * 0.62, bh = R * 0.85;
            // basket FIRST so the envelope overlaps it
            ctx.fillStyle = "#8a5c33";
            ctx.fillRect(x - bw / 2, ey + R * 0.5, bw, bh);
            ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1;
            ctx.strokeRect(x - bw / 2, ey + R * 0.5, bw, bh);
            // blank CIRCLE envelope on top (with the flat two-tone edge band)
            const envCol = isFriend ? "#4f8fe0" : "#e05555";
            ctx.fillStyle = envCol;
            ctx.beginPath(); ctx.arc(x, ey, R, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5; ctx.stroke();
            this.tone2Circle(x, ey, R, envCol);
            ctx.lineWidth = 1;
            ctx.beginPath(); // keep the generic stroke below happy (no-op path)
        } else {
            this.extrudeWall(x, y, radius, card ? 0 : radius * 0.7, color, true); // raised cylinder
            ctx.fillStyle = color; ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);              // lit top face
            ctx.fill();
            ctx.stroke();
            this.tone2Circle(x, y, radius, color); // flat two-tone finish
            this.specDot(x, y, radius); // upper-left glint (flat, no gradient)
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;

        // Faint SIDE outline (blue = yours, red = enemy) so you can tell sides apart at
        // a glance — replaces colouring the unit's name. (Not on the card face.)
        if (e instanceof Troop && !card) {
            ctx.strokeStyle = isFriend ? "rgba(90,165,255,0.5)" : "rgba(255,95,95,0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, radius + 1.5, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1;
        }

        // Evolution marker: evolved troops carry a small round purple gem on the body.
        // The gem scales with the body so it stays small enough to FIT on tiny units
        // (e.g. evo Skeletons) instead of swamping them.
        // Every evo troop carries the small crystal — incl. evo-spawned units whose card
        // isn't itself the evo card (Minion Horde minions, the Skeleton Army general). The
        // x/y here already include the flying offset, so it sits on the visual body.
        if (e instanceof Troop && ((e.c && e.c.isEvo) || e.isSkeleGeneral || e.evoGhostOnHit)) {
            this.drawEvoGem(x, y, Math.min(7, Math.max(2.6, radius * 0.45)), true);
        }

        // Ghost troops read like SEE-THROUGH GLASS: the body fill is faint (low alpha set
        // by the caller), topped with a crisp bright rim so it looks glassy, not just dim.
        if (e instanceof Troop && e.isGhosted) {
            let prevA = ctx.globalAlpha;
            ctx.globalAlpha = Math.min(1, prevA + 0.5);
            ctx.strokeStyle = "rgba(228,246,255,0.9)"; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.arc(x, y, radius + 0.5, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 0.18;
            ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.5, Math.PI * 0.9, Math.PI * 1.7); ctx.stroke();
            ctx.globalAlpha = prevA; ctx.lineWidth = 1;
        }

        // Evo Skeleton Army GENERAL: a gold ring + crown marks the one unit you must
        // kill to end the (otherwise self-reviving) army.
        if (e instanceof Troop && e.isSkeleGeneral) {
            ctx.strokeStyle = "rgba(255,205,70,0.95)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, radius + 3, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = "#ffcf3c";
            let cyC = y - radius - 6, cw = 9;
            ctx.beginPath();
            ctx.moveTo(x - cw / 2, cyC + 4);
            ctx.lineTo(x - cw / 2, cyC);
            ctx.lineTo(x - cw / 4, cyC + 2.5);
            ctx.lineTo(x, cyC - 2);
            ctx.lineTo(x + cw / 4, cyC + 2.5);
            ctx.lineTo(x + cw / 2, cyC);
            ctx.lineTo(x + cw / 2, cyC + 4);
            ctx.closePath(); ctx.fill();
        }

        // Raged: a pulsing pink aura ring + little spark ticks.
        if (e.ragedTime > 0) {
            let t = Date.now() / 120;
            ctx.strokeStyle = `rgba(255,120,190,${0.55 + 0.3 * Math.sin(t)})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(x, y, radius + 3, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = "rgba(255,170,210,0.9)";
            for (let i = 0; i < 4; i++) {
                let a = t * 1.5 + i * Math.PI / 2;
                ctx.beginPath(); ctx.arc(x + Math.cos(a) * (radius + 4), y + Math.sin(a) * (radius + 4), 1.6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.lineWidth = 1;
        }

        // Mega Knight wind-up: a contracting golden ring telegraphs the jump
        // during its pre-jump crouch. The Hopper plays the same animation, smaller.
        if (e instanceof Troop && e.preJump > 0 && (e.c.n === "Mega Knight" || e.c.n === "Hopper")) {
            let t = e.preJump / 45; // 1 → 0 as the jump nears
            let sm = e.c.n === "Hopper" ? 0.45 : 1; // the Hopper telegraphs a smaller crouch
            ctx.strokeStyle = `rgba(255,210,80,${0.35 + 0.55 * (1 - t)})`;
            ctx.lineWidth = 3 * sm + 0.5;
            ctx.beginPath(); ctx.arc(x, y, radius + (4 + 16 * t) * sm, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1;
        }

        // Vined: a simple green ring that gently pulses (no movement) + a few
        // small static tendrils.
        if (e instanceof Troop && e.vinedTime > 0) {
            let pulse = 0.55 + 0.4 * Math.sin(Date.now() / 200);
            ctx.strokeStyle = `rgba(95,211,90,${pulse})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(x, y, radius + 3, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                let a = i * Math.PI / 2 + Math.PI / 4;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(a) * (radius + 1), y + Math.sin(a) * (radius + 1));
                ctx.lineTo(x + Math.cos(a) * (radius + 6), y + Math.sin(a) * (radius + 6));
                ctx.stroke();
            }
            ctx.lineWidth = 1;
        }


        // Health bar — its COLOR is the only friend/foe indicator (blue = yours,
        // red = enemy). The bar GEOMETRY is computed here because it needs this
        // sprite's flying/jump offsets, but the bars are DRAWN later in a dedicated
        // pass so they sit above every unit/tower (only spells draw over them).
        // See drawHealthBars().
        e._barX = x;
        e._barY = y - radius - 9;
        e._barW = (e instanceof Tower) ? 42 : Math.max(24, radius * 1.9);
        e._barFriend = isFriend;

        // Unit name (white). The friend/foe side is shown by the body's faint colored
        // outline (see drawEntityBody) and the health-bar colour, not the name.
        if (name && name.length > 0 && !card) {
            let fontSize = Math.max(9, Math.min(13, 8 + radius * 0.4));
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.font = `${fontSize}px 'Baloo 2', 'Segoe UI', sans-serif`;
            ctx.textAlign = "center";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 2;
            ctx.fillText(name, x, e._barY - (e.shield > 0 ? 9 : 4));
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
        }
    }

    // Per-card identity color so units aren't just blue/red. Friend vs foe is
    // conveyed by the health-bar color, not the body.
    getUnitColor(name) {
        const C = {
            "Knight": "#9aa6b2", "Archers": "#c98fb0", "Giant": "#e0a458",
            "Mini PEKKA": "#5566a0", "Skeletons": "#e6e3d3", "Skeleton Army": "#e6e3d3",
            "Musketeer": "#7c8fc7", "Elite Musketeer": "#ec7fb4", "Mega Knight": "#6b5b8a", "P.E.K.K.A": "#4b4f86",
            "Barbarians": "#d8a24e", "Fire Spirit": "#ff7a3c", "Ice Spirit": "#9ddcef",
            "Electro Spirit": "#4f9bff", "Heal Spirit": "#76d98a", "Minions": "#356b6b",
            "Goblins": "#79b44a", "Spear Goblins": "#8cc04f", "Bats": "#6a4a78",
            "Goblin Demolisher": "#5e9c3a",
            "Wizard": "#ff7043", "Witch": "#8e4fb0", "Mega Minion": "#2f4f6e",
            "Minion Horde": "#356b6b", "Baby Dragon": "#79c267", "Inferno Dragon": "#ff5a2c",
            "Golem": "#8a6a4a", "Lava Hound": "#cf5a3c", "Elixir Golem": "#d56ab5",
            "Elite Barbarians": "#e0934a", "Zappies": "#ffd24d", "Sparky": "#64c8ff",
            "Wall Breakers": "#b5733a", "Royal Giant": "#e6b15a", "Electro Giant": "#46b6c4",
            "Bowler": "#7456b0", "Hog Rider": "#b07a45", "Royal Hogs": "#e89ab5",
            "Prince": "#f1c64a", "Mother Witch": "#7a3f9c", "Royal Recruits": "#b9a06a",
            "Dark Prince": "#4a3f5a", "Ice Golem": "#a9dcef", "Cannon": "#6b7079",
            "Lumberjack": "#5a7a3a", "Balloon": "#9c2b3a", "Hopper": "#6db84a", "Skeleton Barrel": "#a5713a",
            "Inferno Tower": "#b5563a", "Elixir Collector": "#c46fb0", "Crate": "#9c7b4a",
            "Tesla": "#57b8d8", "Bomb Tower": "#8a8f99", "Tombstone": "#9aa0a8", "Firecracker": "#e87ea1",
            "Golemite": "#8a8a8a", "Lava Pup": "#ff8a4c", "Elixir Golemite": "#d56ab5",
            "Elixir Blob": "#d56ab5", "Cursed Hog": "#8e4fb0", "Golem": "#8a8a8a"
        };
        return C[name] || "#b9b1a0";
    }

    // Lighten (amt > 0) or darken (amt < 0) a #rrggbb color. Non-hex passes through.
    shade(hex, amt) {
        if (typeof hex !== "string" || hex[0] !== "#" || hex.length < 7) return hex;
        const clamp = v => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
        const r = clamp(parseInt(hex.slice(1, 3), 16));
        const g = clamp(parseInt(hex.slice(3, 5), 16));
        const b = clamp(parseInt(hex.slice(5, 7), 16));
        return `rgb(${r},${g},${b})`;
    }

    // === Faux-3D shading (flat tones only — NO gradients) ====================
    // Extrude a footprint into a raised block: draws the darker "height" wall
    // dropping `h` px BELOW the body, so the normal flat top face (drawn by the
    // caller afterward) reads as the lit top of a solid block. Vertical extrusion
    // only — unit x/y positions are unchanged. `round` = cylinder vs box wall.
    // Flat solid side tone, no gradient.
    extrudeWall(x, yTop, r, h, top, round) {
        if (!FAUX3D || h <= 0) return;
        const yb = yTop + h;
        ctx.fillStyle = this.shade(top, -0.34);
        if (round) {
            ctx.beginPath(); ctx.arc(x, yb, r, 0, Math.PI * 2); ctx.fill(); // rounded base
            ctx.fillRect(x - r, yTop, 2 * r, h);                           // straight walls
        } else {
            ctx.fillRect(x - r, yTop, 2 * r, h);
        }
        // dark silhouette on the visible wall edges
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - r, yTop); ctx.lineTo(x - r, yb);
        if (round) ctx.arc(x, yb, r, Math.PI, 0, false); else ctx.lineTo(x + r, yb);
        ctx.lineTo(x + r, yTop);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    // A soft elliptical contact shadow on the GROUND at (gx, gy). Fliers cast a
    // smaller, fainter shadow so they read as airborne.
    unitShadow(gx, gy, radius, fly) {
        if (!FAUX3D) return;
        const a = ctx.globalAlpha;
        ctx.globalAlpha = fly ? 0.13 : 0.24;
        ctx.fillStyle = "#0a0e14";
        const rx = radius * (fly ? 0.68 : 0.92), ry = rx * 0.42;
        ctx.beginPath();
        ctx.ellipse(gx, gy + radius * 0.66, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
    }

    // === Flat two-tone finish ===============================================
    // "Slightly more complicated but simple": a darker flat edge band inside the
    // rim plus one short lighter arc, all solid tones — no gradients, shadows,
    // or speculars. Tiny swarm bodies stay plain so they don't get noisy.
    tone2Circle(x, y, radius, color) {
        if (!this.gfxHigh) return; // Graphics: Low = plain flat bodies
        if (radius < 5.5 || typeof color !== "string" || color[0] !== "#") return;
        const bw = Math.min(6, Math.max(1.5, radius * 0.22));
        ctx.strokeStyle = this.shade(color, -0.14);
        ctx.lineWidth = bw;
        ctx.beginPath(); ctx.arc(x, y, radius - bw / 2 - 0.5, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = this.shade(color, 0.26);
        ctx.lineWidth = Math.min(3.5, Math.max(1.2, radius * 0.14));
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.arc(x, y, radius * 0.52, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
        ctx.lineCap = "butt"; ctx.lineWidth = 1;
    }

    // A small specular highlight (upper-left) on a round body — the glint that
    // sells the sphere. Respects the current globalAlpha (clones/ghosts stay dim).
    specDot(x, y, radius) {
        if (!FAUX3D) return;
        const a = ctx.globalAlpha;
        ctx.globalAlpha = a * 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x - radius * 0.34, y - radius * 0.40, radius * 0.20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
    }

    paintBg(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, W, H);
    }

    // The active background style (Ocean / Grass / Indigo).
    theme() { return this.themes[this.themeKey] || this.themes.ocean; }
    cycleTheme() {
        let i = this.themeOrder.indexOf(this.themeKey);
        this.themeKey = this.themeOrder[(i + 1) % this.themeOrder.length];
        try { localStorage.setItem("acr_theme", this.themeKey); } catch (e) { }
    }

    setTheme(key) {
        if (this.themes[key]) { this.themeKey = key; try { localStorage.setItem("acr_theme", key); } catch (e) { } }
    }

    // The style option buttons on the Settings screen (one per theme).
    settingsStyleRects() {
        return this.themeOrder.map((key, i) => ({
            key, name: this.themes[key].name,
            x: W / 2 - 110, y: H / 2 - 70 + i * 66, w: 220, h: 52,
        }));
    }

    // Top-left settings button: a small gear (no background), opens the Settings screen.
    drawSettingsButton() {
        const b = this.settingsBtn;
        const hover = this.contains(b, this.mouse.x, this.mouse.y);
        this.drawGearIcon(b.x + b.w / 2, b.y + b.h / 2, hover ? 7.5 : 7);
    }

    // A small SOLID cog: filled gear silhouette (8 squared teeth) with a punched
    // centre hole (even-odd fill, so the background shows through the middle).
    drawGearIcon(cx, cy, r) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        const teeth = 8, inner = r * 0.74, half = (Math.PI / teeth) * 0.45;
        for (let i = 0; i < teeth * 2; i++) {
            const a = (i * Math.PI) / teeth;
            const rad = i % 2 === 0 ? r : inner;
            ctx.lineTo(Math.cos(a - half) * rad, Math.sin(a - half) * rad);
            ctx.lineTo(Math.cos(a + half) * rad, Math.sin(a + half) * rad);
        }
        ctx.closePath();
        ctx.arc(0, 0, r * 0.36, 0, Math.PI * 2, true); // the hole
        ctx.fill("evenodd");
        ctx.restore();
    }

    // Flat solid menu colour in the chosen style.
    menuBg() {
        this.paintBg(this.theme().menu);
    }

    // Clean arena in the chosen style (no gradients): subtle tile bands and a cooler
    // tint on the enemy half for orientation.
    arenaGrass() {
        const t = this.theme();
        this.paintBg(t.field);
        ctx.fillStyle = t.band;
        for (let gy = 0; gy < H - 150; gy += 60) ctx.fillRect(0, gy, W, 30);
        ctx.fillStyle = t.enemy;
        ctx.fillRect(0, 0, W, RIV_Y - 15);
    }

    // Sandbox MAP popup: one button per map, stacked.
    sandboxMapRects() {
        return this.sbMaps.map((m, i) => ({
            map: m, label: this.sbMapNames[m],
            x: W / 2 - 120, y: H / 2 - 150 + i * 62, w: 240, h: 50
        }));
    }

    // Sandbox TOOLS popup.
    sandboxToolRects() {
        const mk = (id, label, i, color) => ({ id, label, color, x: W / 2 - 120, y: H / 2 - 120 + i * 62, w: 240, h: 50 });
        return [
            mk('eraser', this.sandboxEraser ? "ERASER: ON" : "ERASER", 0, this.sandboxEraser ? "#e84d8a" : "#7f8b84"),
            mk('clear', "CLEAR TROOPS", 1, "#e0762c"),
            mk('close', "CLOSE", 2, "#FF6347"),
        ];
    }

    // Sandbox WORLD EDIT popup: placement rules, river / bridge movers, towers.
    // The river / bridge controls are hidden on maps that have no river.
    sandboxWorldRects() {
        const fullW = 260, halfW = 124, x0 = W / 2 - fullW / 2, y0 = H / 2 - 210, rh = 50, gap = 12;
        let i = 0;
        const row = () => y0 + (i++) * (rh + gap);
        const out = [];
        out.push({ id: 'rules', label: this.eng.sandboxNoRules ? "RULES: OFF" : "RULES: ON", color: this.eng.sandboxNoRules ? "#e84d8a" : "#39c44e", x: x0, y: row(), w: fullW, h: rh });
        if (!this.eng.sandboxNoRiver) {
            let r1 = row();
            out.push({ id: 'rivUp', label: "RIVER ↑", color: "#3296ff", x: x0, y: r1, w: halfW, h: rh });
            out.push({ id: 'rivDn', label: "RIVER ↓", color: "#3296ff", x: x0 + fullW - halfW, y: r1, w: halfW, h: rh });
            let r2 = row();
            out.push({ id: 'brIn', label: "BRIDGES →←", color: "#9c6b3a", x: x0, y: r2, w: halfW, h: rh });
            out.push({ id: 'brOut', label: "BRIDGES ←→", color: "#9c6b3a", x: x0 + fullW - halfW, y: r2, w: halfW, h: rh });
        }
        out.push({ id: 'king', label: "+ KING TOWER", color: "#b65cd6", x: x0, y: row(), w: fullW, h: rh });
        out.push({ id: 'princess', label: "+ PRINCESS TOWER", color: "#b65cd6", x: x0, y: row(), w: fullW, h: rh });
        out.push({ id: 'close', label: "CLOSE", color: "#FF6347", x: x0, y: row(), w: fullW, h: rh });
        return out;
    }

    // "#rrggbb" + alpha → an "rgba(...)" string.
    hexA(hex, a) {
        let h = (hex || "#ffffff").replace("#", "");
        if (h.length === 3) h = h.split("").map(ch => ch + ch).join("");
        const r = parseInt(h.slice(0, 2), 16) || 255;
        const g = parseInt(h.slice(2, 4), 16) || 255;
        const b = parseInt(h.slice(4, 6), 16) || 255;
        return `rgba(${r},${g},${b},${a})`;
    }

    // Hop/suicide units (Spirits, Wall Breakers) explode rather than shoot — this is
    // the splash radius where they actually do damage, shown as their ghost preview
    // instead of a misleading tiny "range" ring.
    effectRadius(c) {
        if (c.n === "Ice Spirit") return 50;
        if (["Fire Spirit", "Heal Spirit", "Electro Spirit", "Wall Breakers"].includes(c.n)) return 60;
        return 0;
    }

    // Geometry of the speed-popup slider track.
    speedTrack() {
        const w = 360, x = (W - w) / 2, y = H - 230;
        return { x, y, w };
    }

    // The speed POPUP: a wide draggable slider (0.5x–10x, any 0.1 step) with labelled
    // preset marks. Tap or drag the bar to scrub, tap a preset to jump, tap away to close.
    drawSpeedPopup() {
        const t = this.speedTrack();
        const toX = sp => t.x + (sp - this.sbSpeedMin) / (this.sbSpeedMax - this.sbSpeedMin) * t.w;
        // Dim backdrop + title (matches the other popups).
        ctx.fillStyle = "rgba(0,0,0,0.62)";
        ctx.fillRect(0, 0, W, H);
        this.drawCenteredString("Speed", W / 2, t.y - 70, "bold 26px 'Baloo 2', 'Segoe UI', sans-serif", "#ffffff");
        // Big current value.
        this.drawCenteredString(`${this.sandboxSpeed.toFixed(1)}x`, W / 2, t.y - 26, "800 34px 'Baloo 2', 'Segoe UI', sans-serif", "#ffe6a0");
        // Track.
        ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + t.w, t.y); ctx.stroke();
        // Filled portion + handle.
        let hx = toX(this.sandboxSpeed);
        ctx.strokeStyle = "#e0b13c"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(hx, t.y); ctx.stroke();
        ctx.lineCap = "butt";
        // Preset tick marks + labels.
        for (const p of this.sbSpeedTicks) {
            let px = toX(p);
            ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(px, t.y - 8); ctx.lineTo(px, t.y + 8); ctx.stroke();
            this.drawCenteredString(`${p}x`, px, t.y + 34, "700 13px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.8)");
        }
        // Handle.
        ctx.fillStyle = "#ffd86b"; ctx.strokeStyle = "#7a5a18"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hx, t.y, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 1;
        this.drawCenteredString("tap away to close", W / 2, t.y + 66, "600 12px 'Baloo 2', 'Segoe UI', sans-serif", "rgba(255,255,255,0.55)");
    }

    // Map an x within the speed-popup track to a 0.5–10x speed, snapped to 0.1.
    setSandboxSpeedFromX(px) {
        const t = this.speedTrack();
        let frac = (px - t.x) / t.w;
        frac = Math.max(0, Math.min(1, frac));
        let sp = this.sbSpeedMin + frac * (this.sbSpeedMax - this.sbSpeedMin);
        this.sandboxSpeed = Math.round(sp * 10) / 10; // 0.1 granularity
    }

    // Troops/buildings deploy on a 30px tile grid (like the real game).
    snapToGrid(x, y) {
        const T = 30, oy = (RIV_Y - 15) % T; // RIV_Y=405 → oy=0, so the top/bottom edges and the river all land on tile lines
        return { x: Math.floor(x / T) * T + T / 2, y: Math.floor((y - oy) / T) * T + oy + T / 2 };
    }

    // Approximate drawn radius of one unit of a card (mirrors Troop / Building sizing).
    unitRadius(c) {
        // Buildings: the half-width of their drawn square (matches Building.js rad*0.88).
        if (c.t === 3) {
            let r = (c.n === "Cannon") ? 15 : (c.n === "Crate") ? 14 :
                (c.n === "Tesla") ? 16 : (c.n === "Bomb Tower") ? 17 : 20;
            return r * 0.88;
        }
        let m = 10;
        const n = c.n;
        if (["Skeletons", "Bats"].includes(n)) m = 6;
        else if (n.includes("Spirit")) m = 8; // slightly smaller spirits
        else if (["Goblins", "Archers", "Wall Breakers"].some(x => n.includes(x))) m = 8;
        else if (["Barbarians", "Elite Barbarians", "Royal Recruits"].includes(n)) m = 12;
        else if (n === "Mega Knight" || n === "P.E.K.K.A") m = 20;
        else if (n === "Sparky" || n === "Bowler") m = 18;
        else if (n === "Balloon") m = 19;
        else if (n === "Skeleton Barrel") m = 12;
        else if (n.includes("Dragon") || n === "Lava Hound") m = 16;
        else if (["Giant", "Golem", "Elixir Golem", "Royal Giant", "Electro Giant"].includes(n)) m = 20;
        return m * 0.88;
    }

    // Ghost layout: offsets (relative to the snapped point) + radius for each
    // unit a card spawns, mirroring GameEngine.addU.
    ghostLayout(c) {
        const r = this.unitRadius(c);
        // The engine's deploy formations are the single source of truth — the ghost
        // preview shows EXACTLY where the units will stand.
        const f = this.eng.getFormation(c.n);
        if (f) return f.map(([dx, dy]) => ({ dx, dy, r }));
        return [{ dx: 0, dy: 0, r }];
    }

    elixirColor(c) {
        if (c <= 2) return "#3a8f5a";
        if (c <= 4) return "#3a6f9f";
        if (c <= 6) return "#6a4a9f";
        return "#9f3a6a";
    }

    // A deck-builder card tile: elixir-tinted body, unit-color swatch, name,
    // elixir badge, and a gold ring + check when it's in the deck.
    // Purple evolution indicator: `req` larger DIAMOND gems (the cycle count).
    // `filled` gems are lit; when `glow` they have a halo (charged / selected).
    // Used on deck cards and the in-game hand.
    drawEvoPips(centerX, cy, req, filled, glow) {
        const s = 7, gap = s * 2 + 4; // diamond half-size + spacing
        let startX = centerX - (req - 1) * gap / 2;
        ctx.save();
        for (let i = 0; i < req; i++) {
            let px = startX + i * gap, on = i < filled;
            if (on && glow) { ctx.shadowColor = "#e08bff"; ctx.shadowBlur = 10; }
            ctx.fillStyle = on ? "#c45cff" : "rgba(120,80,160,0.5)";
            ctx.beginPath();
            ctx.moveTo(px, cy - s); ctx.lineTo(px + s, cy); ctx.lineTo(px, cy + s); ctx.lineTo(px - s, cy); ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = on ? "#ffffff" : "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.3;
            ctx.stroke();
            // a little facet highlight so it reads as a gem
            if (on) { ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - s * 0.4, cy - s * 0.2); ctx.lineTo(px, cy - s * 0.7); ctx.stroke(); }
        }
        ctx.restore();
    }

    // A round purple evo gem (shown in the centre of an evo card while it's selected
    // for placement). Glows when the evo is charged.
    drawEvoGem(gx, gy, radius, glow) {
        ctx.save();
        if (glow) { ctx.shadowColor = "#e08bff"; ctx.shadowBlur = 14; }
        ctx.fillStyle = glow ? "#c45cff" : "rgba(150,90,200,0.75)";
        ctx.beginPath(); ctx.arc(gx, gy, radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(gx, gy, radius, 0, Math.PI * 2); ctx.stroke();
        // facet highlight
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath(); ctx.arc(gx - radius * 0.3, gy - radius * 0.3, radius * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // A small tilted two-tone rubber eraser (blue sleeve + light rubbing end). The
    // blue sleeve carries a black band, a white label band, and an "ERASER" label.
    // `s` scales it.
    drawEraserIcon(cx, cy, s = 1) {
        const w = 14 * s, h = 22 * s, r = 3.5 * s;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 4.3); // tilt like the icon
        // drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        this.drawRoundRect(-w / 2 + 1.5 * s, -h / 2 + 2 * s, w, h, r, true, false);
        // clip to the body so everything shares its rounded outline
        this.drawRoundRect(-w / 2, -h / 2, w, h, r, false, false);
        ctx.save(); ctx.clip();
        ctx.fillStyle = "#ece4f0"; ctx.fillRect(-w / 2, -h / 2, w, h);              // rubbing end (light)
        ctx.fillStyle = "#4f7be2"; ctx.fillRect(-w / 2, -h / 2, w, h * 0.58);       // sleeve (blue)
        // black band near the sleeve's far end (the "opposite side" of the label)
        ctx.fillStyle = "#171717"; ctx.fillRect(-w / 2, -h / 2 + h * 0.06, w, h * 0.07);
        // white label band across the middle of the sleeve, with the "ERASER" text
        const stripY = -h / 2 + h * 0.27, stripH = h * 0.17;
        ctx.fillStyle = "#ffffff"; ctx.fillRect(-w / 2, stripY, w, stripH);
        ctx.fillStyle = "#1c1c1c";
        ctx.font = `bold ${Math.max(3, h * 0.13)}px 'Baloo 2', 'Segoe UI', sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("ERASER", 0, stripY + stripH / 2 + 0.3 * s);
        ctx.restore();
        // divider + outline
        ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.2 * s;
        ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * 0.58); ctx.lineTo(w / 2, -h / 2 + h * 0.58); ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.5 * s;
        this.drawRoundRect(-w / 2, -h / 2, w, h, r, false, false); ctx.stroke();
        ctx.restore();
        ctx.lineWidth = 1; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }

    // The bottom-strip hit region where the evo gems live on a deck card.
    evoBadgeHit(cx, cy, w, h, px, py) {
        return px >= cx + w / 2 - 22 && px <= cx + w / 2 + 22 && py >= cy + h - 20 && py <= cy + h + 3;
    }

    // The card NAME across the top of a card, wrapped onto two lines when it's long.
    drawCardName(name, cx, cy, w) {
        let words = name.split(' ');
        if (words.length <= 1) {
            this.drawCenteredString(name, cx + w / 2, cy + 15, "700 12px 'Baloo 2', 'Segoe UI', sans-serif", "#252525");
        } else {
            let mid = Math.ceil(words.length / 2);
            let l1 = words.slice(0, mid).join(' '), l2 = words.slice(mid).join(' ');
            this.drawCenteredString(l1, cx + w / 2, cy + 12, "700 11px 'Baloo 2', 'Segoe UI', sans-serif", "#252525");
            this.drawCenteredString(l2, cx + w / 2, cy + 23, "700 11px 'Baloo 2', 'Segoe UI', sans-serif", "#252525");
        }
    }

    // A spell card's actual cast EFFECT, contained in the box, so it reads like what you
    // see when you place it (Zap = a lightning bolt from the top, Fireball = a blast, …).
    drawCardSpell(cx, cy, w, h, c, isEvo) {
        const ccx = cx + w / 2, ccy = cy + h / 2, n = c.n;
        // Area spells are sized by their REAL radius so they read to-scale (Vines < Freeze <
        // Poison …), clamped to the card.
        const sr = this.eng.getSpellRadius(c);
        const R = Math.min(Math.min(w, h) * 0.46, (sr && sr.val ? sr.val : 100) * 0.4);
        const gem = () => { if (isEvo) this.drawEvoGem(ccx, ccy, 6, true); };
        const disc = (col, a = 1, rr = R) => { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ccx, ccy, rr, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; };

        // Thrown ARC spells — show the projectile IN THE AIR with its shadow below, using
        // the exact renderer from the battlefield (drawSpellArc).
        const arcKind = { "Fireball": "fireball", "Rocket": "rocket", "Goblin Barrel": "barrel", "Giant Snowball": "snowball" }[n];
        if (arcKind) {
            let arcH = h * 0.34;
            this.drawSpellArc({ x: ccx, y: ccy + arcH * 0.55, tx: ccx, ty: ccy + arcH * 0.55 - 50, totalDist: 100, arcMax: arcH, rad: 18, spellKind: arcKind, tm: 0 });
            gem(); return;
        }
        if (n === "Zap") {
            // The FIRST frame of the zap sprite (static on the card); evo uses the evo sheet.
            let size = Math.min(w, h) * 0.82;
            if (!this.drawSprite(isEvo ? "evozap" : "zap", ccx, ccy, size, 0)) {
                ctx.globalAlpha = 0.5; ctx.fillStyle = "#9fe6ff";
                ctx.beginPath(); ctx.arc(ccx, ccy, size * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
            }
            return; // the evo sprite already shows the evo look — no crystal overlay
        }
        if (n === "Arrows") {
            // the real arrows volley, caught mid-fall.
            this.drawArrowsVolley({ x: ccx, y: ccy + 6, rad: Math.min(w, h) * 0.44, life: 23 });
            gem(); return;
        }
        if (n === "The Log" || n === "Barbarian Barrel") {
            // The ORIGINAL rolling-log texture, drawn by the real renderer (drawProj/isLog):
            // a brown cylinder with scrolling bands. Scaled to the card.
            let k = Math.min((w * 0.86) / 70, (h * 0.5) / 20);
            ctx.save(); ctx.translate(ccx, ccy); ctx.scale(k, k);
            this.drawProj({ isLog: true, barbBarrelLog: (n === "Barbarian Barrel"), x: 0, y: 0, tm: 0, rad: 5 });
            ctx.restore();
            gem(); return;
        }
        if (n === "Freeze") {
            disc("rgba(127,216,255,0.45)");
            disc("rgba(127,216,255,0.3)", 1, R * 0.66);
            ctx.strokeStyle = "rgba(120,200,240,0.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
            gem(); return;
        }
        if (n === "Vines") {
            disc("rgba(95,174,79,0.42)");
            disc("rgba(95,174,79,0.28)", 1, R * 0.66);
            ctx.strokeStyle = "rgba(70,150,60,0.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
            gem(); return;
        }
        if (n === "Poison") {
            disc("rgba(0,128,0,0.4)"); disc("rgba(0,128,0,0.4)", 1, R * 0.66); gem(); return; // exact in-game poison patch
        }
        if (n === "Graveyard") { disc("rgba(0,0,139,0.4)"); disc("rgba(0,0,139,0.4)", 1, R * 0.66); gem(); return; }
        if (n === "Clone") { disc("rgba(0,255,255,0.4)"); disc("rgba(0,255,255,0.4)", 1, R * 0.66); gem(); return; }
        if (n === "Rage") {
            // matches the placed rage POOL — a translucent pink disc with a pink rim
            ctx.fillStyle = "rgba(255,95,176,0.22)";
            ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "rgba(255,130,195,0.7)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1; gem(); return;
        }
        if (n === "Tornado") {
            ctx.strokeStyle = "rgba(155,188,208,0.85)"; ctx.lineWidth = 3;
            for (let i = 0; i < 4; i++) { let rr = R * (0.4 + i * 0.2), yy = ccy - R + i * (R * 0.55); ctx.beginPath(); ctx.ellipse(ccx, yy, rr, rr * 0.32, 0, 0, Math.PI * 2); ctx.stroke(); }
            ctx.lineWidth = 1; gem(); return;
        }
        if (n === "Royale Delivery") {
            // the in-game cardboard delivery crate (landed), scaled to the card
            let k = Math.min(w, h) / 70;
            ctx.save(); ctx.translate(ccx, ccy + 2); ctx.scale(k, k);
            const cw = 42, hw = cw / 2, ch = 42, hy = ch / 2, dep = 9, fy = -hy + dep, inset = 6;
            ctx.fillStyle = "#d8ad6a"; // top face (trapezoid receding back)
            ctx.beginPath(); ctx.moveTo(-hw, fy); ctx.lineTo(-hw + inset, -hy); ctx.lineTo(hw - inset, -hy); ctx.lineTo(hw, fy); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "rgba(90,60,25,0.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(0, -hy); ctx.stroke();
            ctx.fillStyle = "#c79a5e"; ctx.fillRect(-hw, fy, cw, ch - dep); // front face
            ctx.save(); ctx.translate(hw * 0.12, fy + (ch - dep) * 0.52); ctx.rotate(-0.22); // label
            ctx.fillStyle = "#f0e3a4"; ctx.fillRect(-9, -10, 18, 20);
            ctx.strokeStyle = "rgba(120,100,40,0.55)"; ctx.lineWidth = 1; ctx.strokeRect(-9, -10, 18, 20);
            ctx.beginPath(); ctx.moveTo(-6, -3); ctx.lineTo(6, -3); ctx.moveTo(-6, 2); ctx.lineTo(6, 2); ctx.moveTo(-6, 7); ctx.lineTo(3, 7); ctx.stroke();
            ctx.restore();
            ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.5; ctx.strokeRect(-hw, fy, cw, ch - dep);
            ctx.lineWidth = 1; ctx.restore();
            gem(); return;
        }
        // Generic spell: a coloured blast with a bright core.
        disc(this.spellColor(n), 0.95); disc("rgba(255,255,255,0.4)", 1, R * 0.5);
        gem();
    }

    // Representative colour for a spell's effect (getUnitColor only covers troops/buildings).
    spellColor(n) {
        const M = {
            "Fireball": "#ff5a2c", "Rocket": "#ff7043", "Giant Snowball": "#9fd8f0", "Arrows": "#caa15a",
            "Poison": "#7fbf4f", "Zap": "#ffe14d", "Freeze": "#7fd8ff", "Rage": "#d24bd2", "Tornado": "#9bbcd0",
            "Vines": "#5fae4f", "The Log": "#8b5a2b", "Barbarian Barrel": "#8b5a2b", "Goblin Barrel": "#79b44a",
            "Clone": "#7fe0e0", "Graveyard": "#7a5a8a", "Royale Delivery": "#c0703a", "Mirror": "#cf8fe0",
        };
        return M[n] || "#cf8fe0";
    }

    // A compact, REPRESENTATIVE sample of a card's unit(s) for the card face. Swarms and
    // wide formations (Royal Recruits, Skeleton Army, …) show only a FEW units at the
    // unit's real relative size instead of cramming the whole spawn in shrunk. Offsets are
    // in px (radius-based); drawCardVisual scales the cluster to fit.
    cardSampleLayout(c) {
        // Cards that spawn a DIFFERENT unit size the sample by that unit (so Skeleton-Army
        // skeletons are skeleton-sized, not card-sized).
        const spawn = { "Skeleton Army": "Skeletons", "Minion Horde": "Minions", "Three Musketeers": "Elite Musketeer" }[c.n];
        const r = this.unitRadius(spawn ? { n: spawn, t: 0 } : c);
        const single = [{ dx: 0, dy: 0, r }];
        // Cells are spaced 2.3r apart so discs (radius r) NEVER touch — a 0.3r gap.
        const G = 2.3 * r;
        const row = (n) => { let a = [], x0 = -(n - 1) * G / 2; for (let i = 0; i < n; i++) a.push({ dx: x0 + i * G, dy: 0, r }); return a; };
        const pack = (n) => {
            let cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), a = [];
            for (let i = 0; i < n; i++) {
                let rowOf = Math.floor(i / cols), inRow = Math.min(cols, n - rowOf * cols), col = i % cols;
                a.push({ dx: (col - (inRow - 1) / 2) * G, dy: (rowOf - (rows - 1) / 2) * G, r });
            }
            return a;
        };
        const n = c.n, full = this.ghostLayout(c).length;
        // Witch: the witch in the centre with a few of her skeletons around her feet.
        if (n === "Witch") {
            const sr = this.unitRadius({ n: "Skeletons", t: 0 });
            return [
                { dx: 0, dy: -r * 0.2, r },
                { dx: -r * 1.4, dy: r * 1.25, r: sr, unit: "Skeletons" },
                { dx: r * 1.4, dy: r * 1.25, r: sr, unit: "Skeletons" },
                { dx: 0, dy: r * 1.75, r: sr, unit: "Skeletons" },
            ];
        }
        // Royal Recruits' real line is the whole lane wide — scaled onto a card the
        // units would be specks, so the face shows a REPRESENTATIVE three at full size.
        if (n === "Royal Recruits") return row(3);
        // FORMATION cards show the REAL deploy formation on the face — the card is
        // aligned exactly how the units stand when placed (scaled to fit the box).
        const f = this.eng.getFormation(n);
        if (f) return f.map(([dx, dy]) => ({ dx, dy, r }));
        void row; void pack; void full; // helpers kept for the Witch-style specials
        return single;
    }

    // The "what this card is" visual, centred in a box: the unit(s) as coloured discs
    // (mirrors the placement ghost), a tinted disc for a spell, or a square for a building.
    // `isEvo` stamps the purple evolution gem on each unit so the evo version reads clearly.
    drawCardVisual(cx, cy, w, h, c, isEvo = false) {
        const ccx = cx + w / 2, ccy = cy + h / 2;
        const col = this.getUnitColor(c.n);
        if (c.t === 2) { this.drawCardSpell(cx, cy, w, h, c, isEvo); return; }
        // Troops AND buildings: draw the EXACT placed sprite via the real renderer
        // (drawEntityBody), at the unit's real size, in a tidy non-overlapping sample. A
        // single scale for every card keeps them to-scale (Giant big, skeleton small).
        // Cards that spawn a DIFFERENT unit show that unit at its real size.
        const spawn = { "Skeleton Army": "Skeletons", "Minion Horde": "Minions", "Three Musketeers": "Elite Musketeer" }[c.n];
        const uc = spawn ? this.eng.getCard(spawn) : c;
        const layout = this.cardSampleLayout(c);
        // Evo Skeleton Army: a GENERAL stands at the BACK (top) and the skeletons carry NO
        // crystal — the general is the only evo marker.
        const skeleGen = isEvo && c.n === "Skeleton Army";
        let entries = layout.slice();
        if (skeleGen) {
            let topY = Math.min(...layout.map(g => g.dy)), gr = layout[0].r * 1.7;
            entries.push({ dx: 0, dy: topY - gr * 1.5, r: gr, unit: "Skeletons", general: true });
        }
        let ext = 1;
        for (const gp of entries) ext = Math.max(ext, Math.hypot(gp.dx, gp.dy) + gp.r);
        const box = Math.min(w, h) * 0.46;
        const scale = Math.min(Math.min(w, h) * 0.011, box / ext);
        ctx.save();
        ctx.translate(ccx, ccy);
        ctx.scale(scale, scale);
        for (const gp of entries) {
            let card = gp.unit ? this.eng.getCard(gp.unit) : uc;
            // Evo cards show the REAL evo unit (drawEntityBody draws its own gem) — never a gem
            // slapped on every troop. (Skeleton Army is the special case above: general, no gems.)
            if (isEvo && !gp.general && card && this.eng.isEvoCapable(card.n)) card = this.eng.makeEvoCard(card);
            let e = (card.t === 3) ? new Building(0, gp.dx, gp.dy, card) : new Troop(0, gp.dx, gp.dy, card);
            e.deployTime = 0; e.fly = false; // card view: no deploy fade, no float offset
            if (gp.general) { e.isSkeleGeneral = true; e.rad = gp.r; }
            this.drawEntityBody(e, true);     // the same renderer used on the battlefield
        }
        ctx.restore();
    }

    // A full card FACE — the same look used in your hand and in the deck builder:
    // white body, NAME across the top, the unit VISUAL filling the area beneath it,
    // and the elixir badge. (Selection / evo chrome is added by the caller.)
    drawCardFace(cx, cy, w, h, c, bg = "#ffffff", isEvo = false) {
        ctx.fillStyle = bg;
        this.drawRoundRect(cx, cy, w, h, Math.min(10, w * 0.09), true, false);
        this.drawCardName(c.n, cx, cy, w);
        let top = cy + 28, bot = cy + h - 9;
        // Cards are STATIC: freeze Date.now() so the reused in-game renderers (zap flicker,
        // barrel tumble, log bands, …) draw a fixed frame instead of animating in the deck.
        const _now = Date.now;
        Date.now = () => 1000;
        try { this.drawCardVisual(cx + 4, top, w - 8, bot - top, c, isEvo); }
        finally { Date.now = _now; }
        this.drawElixirCost(cx + 13, cy + 13, c.c); // top-left corner
    }

    drawDeckCard(cx, cy, w, h, c, selected, isEvo = false) {
        this.drawCardFace(cx, cy, w, h, c, "#ffffff", isEvo);
        if (selected) {
            ctx.strokeStyle = "#ffd24d"; ctx.lineWidth = 3;
            this.drawRoundRect(cx, cy, w, h, 10, false, false); ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = "#2ecc71";
            ctx.beginPath(); ctx.arc(cx + w - 13, cy + 13, 9, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "white"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx + w - 17, cy + 13); ctx.lineTo(cx + w - 14, cy + 16); ctx.lineTo(cx + w - 9, cy + 9); ctx.stroke();
            ctx.lineWidth = 1;
        }
    }

    // Always-on tile grid, aligned to the 30px snap cells (lines on cell edges).
    drawGrid() {
        const T = 30, oy = (RIV_Y - 15) % T; // grid lines fall on the river's edges (1 tile)
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        for (let gx = T; gx < W; gx += T) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H - 150); ctx.stroke(); }
        for (let gy = oy; gy < H - 150; gy += T) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    }

    // Mirror shows and behaves as the card it will replay (your last played card);
    // until you've played something it stays plain Mirror.
    mirroredView(c) {
        if (c && c.n === "Mirror" && this.eng.p1.lastPlayedCard) return this.eng.p1.lastPlayedCard;
        return c;
    }

    // Hovered cell highlight (green valid / red invalid) while placing.
    drawHoverCell(sel) {
        const T = 30, oy = (RIV_Y - 15) % T;
        if (this.mouse.y >= H - 150) return;
        let cx = Math.floor(this.mouse.x / T) * T, cy = Math.floor((this.mouse.y - oy) / T) * T + oy;
        let s = this.snapToGrid(this.mouse.x, this.mouse.y);
        let valid = this.eng.isValid(s.y, s.x, this.mirroredView(sel), 0);
        ctx.fillStyle = valid ? "rgba(80,220,120,0.32)" : "rgba(220,60,60,0.32)";
        ctx.fillRect(cx, cy, T, T);
        ctx.strokeStyle = valid ? "#4aff8a" : "#ff5a5a";
        ctx.lineWidth = 2;
        ctx.strokeRect(cx, cy, T, T);
        ctx.lineWidth = 1;
    }

    drawBtn(rect, txt, color) {
        let isHover = this.contains(rect, this.mouse.x, this.mouse.y);
        let drawRect = { ...rect };

        if (isHover) {
            let scale = 1.1;
            let w = rect.w * scale;
            let h = rect.h * scale;
            drawRect.x = rect.x - (w - rect.w) / 2;
            drawRect.y = rect.y - (h - rect.h) / 2;
            drawRect.w = w;
            drawRect.h = h;
        }

        // Solid body with a soft drop shadow (no gradient, no gloss).
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 7;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = color;
        this.drawRoundRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h, 12, true, false);
        ctx.restore();

        // Thin darker outline for definition
        ctx.strokeStyle = this.shade(color, -0.22);
        ctx.lineWidth = 2;
        this.drawRoundRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h, 12, false, false);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Label
        ctx.fillStyle = "white";
        ctx.font = "bold 17px 'Baloo 2', 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 2;
        ctx.fillText(txt, drawRect.x + drawRect.w / 2, drawRect.y + drawRect.h / 2);
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
        ctx.textBaseline = "alphabetic"; // Reset
    }

    drawCenteredString(txt, x, y, font, color) {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.fillText(txt, x, y);
    }

    drawElixirCost(x, y, val) {
        // Just the cost as a purple number (no circle), with a dark outline for legibility.
        ctx.font = "bold 16px 'Baloo 2', 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3; ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.strokeText(val, x, y);
        ctx.fillStyle = "#d11ad1"; ctx.fillText(val, x, y);
        ctx.lineWidth = 1; ctx.lineJoin = "miter";
        ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    }

    drawRoundRect(x, y, w, h, r, fill, stroke) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
    }

    // True for projectiles that come from a SPELL (incl. Log / Barbarian Barrel and
    // the area spells) — these render above ground troops but below the towers.
    isSpellProj(p) {
        return !!(p.isSpellArc || p.isArrows || p.isSpellDrop || p.isLog || p.isDelivery ||
            p.poison || p.graveyard || p.brownArea || p.isClone || p.isVines || p.chainTargets || p.shockBeams || p.isShockwave || p.isPhantom || p.isElectricRing || p.isIceCrystal || p.isDynamite || p.isRage || p.isBomb);
    }

    drawProj(p) {
        if (p.isArrows) { this.drawArrowsVolley(p); return; }
        if (p.isSpellArc) { this.drawSpellArc(p); return; }
        if (p.isDynamite) {
            // A red stick of dynamite arcing toward its target, with a ground shadow.
            let d = Math.hypot(p.tx - p.x, p.ty - p.y);
            let prog = 1 - Math.min(1, d / (p.dynTotal || 1));
            let lift = Math.sin(prog * Math.PI);
            let arc = lift * 48; // flies high
            // A real ground shadow: a soft OVAL that SHRINKS as the stick rises (a flat dot
            // is what made it read wrong). Sits on the ground while the stick floats above.
            let sh = 1 - 0.45 * lift;
            // Flat, soft ground shadow (a wide low oval reads as a shadow, not a dot).
            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.beginPath(); ctx.ellipse(p.x, p.y + 3, 9 * sh, 2.6 * sh, 0, 0, Math.PI * 2); ctx.fill();
            ctx.save();
            ctx.translate(p.x, p.y - arc);
            ctx.rotate(prog * 5 + 0.5);
            ctx.fillStyle = "#cc2b2b"; ctx.fillRect(-2.5, -6, 5, 12);       // red stick
            ctx.strokeStyle = "#7a1414"; ctx.lineWidth = 1; ctx.strokeRect(-2.5, -6, 5, 12);
            ctx.fillStyle = "#f0e3b0"; ctx.fillRect(-2.5, -6, 5, 2.5);       // pale cap
            ctx.strokeStyle = "#444"; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(1.5, -10); ctx.stroke(); // fuse
            ctx.fillStyle = "#ffcf3c"; ctx.beginPath(); ctx.arc(1.5, -10, 1.3, 0, Math.PI * 2); ctx.fill();   // spark
            ctx.restore();
            return;
        }
        if (p.isSpellDrop) { this.drawSpellDrop(p); return; }
        if (p.isElectricRing) {
            // Expanding electric ring (Evo Zap): a smooth flickering circle, with a much
            // thinner faintly-jagged overlay for the crackle — not a hard zig-zag.
            let prog = 1 - p.life / (p.ringMax || 30);
            let r = Math.max(4, p.rad * prog);
            let fade = 1 - prog;
            let col = p.flashCol || "#d98cff";
            let flick = (Math.floor(Date.now() / 45) % 4 === 0) ? 0.55 : 1;
            ctx.save();
            // smooth main ring
            ctx.strokeStyle = col;
            ctx.globalAlpha = 0.8 * fade * flick;
            ctx.lineWidth = 2.5 * fade + 1;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
            // thin, only slightly jagged crackle overlay
            ctx.globalAlpha = 0.6 * fade * flick;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i <= 28; i++) {
                let a = (i / 28) * Math.PI * 2;
                let jr = r + (i % 2 === 0 ? 0 : 2.5);
                let px = p.x + Math.cos(a) * jr, py = p.y + Math.sin(a) * jr;
                i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
            }
            ctx.closePath(); ctx.stroke();
            ctx.restore();
            ctx.globalAlpha = 1; ctx.lineWidth = 1;
            return;
        }
        if (p.isIceCrystal) {
            // A blue ice DIAMOND hovering above the frozen troop, bobbing gently up and
            // down until it crashes back down (Evo Ice Spirit).
            let bob = Math.sin(Date.now() / 260) * 3;
            let w = 6, h = 9;
            ctx.save();
            ctx.translate(p.x, p.y - 20 + bob);
            // faint drop-shadow on the troop
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "#3a78b0";
            ctx.beginPath(); ctx.ellipse(0, 20 - bob, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            // diamond body
            ctx.fillStyle = "#bfe8ff";
            ctx.strokeStyle = "#5fb6ff"; ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(0, -h); ctx.lineTo(w, 0); ctx.lineTo(0, h); ctx.lineTo(-w, 0); ctx.closePath();
            ctx.fill(); ctx.stroke();
            // facet highlights
            ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(0, h); ctx.moveTo(-w, 0); ctx.lineTo(w, 0); ctx.stroke();
            ctx.restore();
            ctx.globalAlpha = 1; ctx.lineWidth = 1;
            return;
        }
        if (p.isPhantom) {
            // Spectral burst — green ring + rising wisps as the rage-ghost forms/fades.
            let prog = 1 - p.life / (p.phantomMax || 22);
            let r = Math.max(4, p.rad * prog);
            let fade = 1 - prog;
            ctx.save();
            ctx.globalAlpha = 0.30 * fade;
            ctx.fillStyle = "#7ce39a";
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 0.65 * fade;
            ctx.strokeStyle = "#9ff5b6"; ctx.lineWidth = 3.5 * fade + 1;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 0.8 * fade;
            ctx.fillStyle = "#e6fff0";
            for (let i = 0; i < 6; i++) {
                let a = i * Math.PI / 3 + prog * 2.2;
                let wx = p.x + Math.cos(a) * r * 0.85;
                let wy = p.y + Math.sin(a) * r * 0.85 - prog * 12;
                ctx.beginPath(); ctx.arc(wx, wy, 2.4 * fade + 0.8, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            ctx.globalAlpha = 1; ctx.lineWidth = 1;
            return;
        }
        if (p.isShockwave) {
            // Ground-slam shockwave: an expanding dust ring with a bright leading
            // edge and a fading inner haze (Mega Knight spawn / jump landing).
            let prog = 1 - p.life / (p.shockMax || 18);
            let r = Math.max(6, p.rad * prog);
            let fade = 1 - prog;
            ctx.save();
            // inner haze
            ctx.globalAlpha = 0.28 * fade;
            ctx.fillStyle = "#cbb9a2";
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
            // dust ring (thick, fading)
            ctx.globalAlpha = 0.75 * fade;
            ctx.strokeStyle = "#b9a98e"; ctx.lineWidth = 7 * fade + 2;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
            // bright leading edge
            ctx.globalAlpha = 0.9 * fade;
            ctx.strokeStyle = "#f3ead8"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2); ctx.stroke();
            // a few flying dust chips around the ring
            ctx.fillStyle = "#d9cbb2";
            for (let i = 0; i < 8; i++) {
                let a = i * Math.PI / 4 + prog * 0.6;
                let dr = r + 4 + prog * 6;
                ctx.globalAlpha = 0.7 * fade;
                ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * dr, p.y + Math.sin(a) * dr, 2.2 * fade + 0.6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            ctx.globalAlpha = 1; ctx.lineWidth = 1;
            return;
        }

        // Only the rolling LOG renders here (top layer) — it rolls over units. Every
        // other projectile (bullets, boulders, the Royal Giant cannonball, area
        // effects) draws beneath the units in the inline pass, so return.
        if (!p.isLog) return;

        let x = p.x;
        let y = p.y;
        let r = p.rad || 5;

        ctx.save();
        ctx.translate(x, y);

        if (p.isLog) {
            // Simple rolling log: a brown cylinder with bands that scroll along
            // the roll direction so it reads as rolling.
            let w = p.barbBarrelLog ? 46 : 70;
            let h = 20;
            ctx.fillStyle = "#6b4423";
            this.drawRoundRect(-w / 2, -h / 2, w, h, 9, true, false);
            let dir = (p.tm === 0) ? -1 : 1;
            let phase = ((Date.now() / 24 * dir) % h + h) % h;
            ctx.fillStyle = "rgba(176,124,68,0.95)";
            for (let k = -1; k <= 1; k++) {
                let yy = (((phase + k * (h / 2)) % h) + h) % h - h / 2;
                ctx.fillRect(-w / 2 + 3, yy - 1.5, w - 6, 3);
            }
        } else if (p.isRolling) {
            // Bowler boulder
            ctx.fillStyle = "#5a4a6a";
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#2e2440"; ctx.lineWidth = 2; ctx.stroke();
            ctx.lineWidth = 1;
        } else if (p.poison || p.graveyard || p.isHeal) {
            // Area effects
            ctx.fillStyle = p.isHeal ? "rgba(255, 255, 0, 0.3)" : (p.poison ? "rgba(255, 165, 0, 0.3)" : "rgba(128, 128, 128, 0.3)");
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = p.isHeal ? "yellow" : (p.poison ? "orange" : "gray");
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Standard Projectile (Ball)
            let color = "orange"; // Fireball
            if (r < 10) color = "gray"; // Arrow
            if (p.tm === 0) color = "#3296ff"; // Blueish for friend
            else color = "#ff3232"; // Red for enemy

            if (p.isHeal) color = "yellow";

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    // A spell launched from the king tower, arcing to its target. Drawn raised
    // by the arc height with a ground shadow — the gap shows how high it is.
    drawSpellArc(p) {
        let prog = p.totalDist ? 1 - Math.hypot(p.tx - p.x, p.ty - p.y) / p.totalDist : 0;
        prog = Math.max(0, Math.min(1, prog));
        let h = (p.arcMax || 100) * Math.sin(prog * Math.PI);

        // Perfect-circle ground shadow; shrinks a little while high.
        let sr = Math.max(8, p.rad * 0.5) * (1 - 0.3 * Math.sin(prog * Math.PI));
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.arc(p.x, p.y, sr, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.translate(p.x, p.y - h);
        const k = p.spellKind;
        if (k === "arrows") {
            // a fan of arrows spreading outward as they fly toward the target
            for (let i = -2; i <= 2; i++) {
                ctx.save();
                ctx.rotate(i * 0.17);
                ctx.strokeStyle = "#6b4423"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 6); ctx.stroke();
                ctx.fillStyle = "#d9d9d9";
                ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(-2, 5); ctx.lineTo(2, 5); ctx.closePath(); ctx.fill();
                ctx.restore();
            }
        } else if (k === "barrel") {
            // Bigger barrel that tumbles end-over-end as it flies.
            ctx.rotate(Date.now() / 60 * (p.tm === 0 ? -1 : 1));
            ctx.fillStyle = "#8a5a2c";
            this.drawRoundRect(-13, -16, 26, 32, 6, true, false);
            ctx.strokeStyle = "#5c3a18"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-13, -5); ctx.lineTo(13, -5); ctx.moveTo(-13, 5); ctx.lineTo(13, 5); ctx.stroke();
            ctx.lineWidth = 1;
        } else if (k === "snowball") {
            ctx.fillStyle = "#dff1ff"; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#9cc6e8"; ctx.lineWidth = 1.5; ctx.stroke();
        } else if (k === "rocket") {
            // A big heavy brown ball with a white skull on it.
            ctx.fillStyle = "#6e4a2b"; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#46301c"; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = "#8a5f38"; ctx.beginPath(); ctx.arc(-4.5, -4.5, 4.5, 0, Math.PI * 2); ctx.fill(); // highlight
            ctx.fillStyle = "#f2eede";                                              // skull
            ctx.beginPath(); ctx.arc(0, -1.5, 7.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(-4, 3, 8, 4.8);                                            // jaw
            ctx.fillStyle = "#241509";                                             // eyes + nose
            ctx.beginPath(); ctx.arc(-3, -1.8, 2.1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, -1.8, 2.1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(0, 0.5); ctx.lineTo(-1.5, 3); ctx.lineTo(1.5, 3); ctx.closePath(); ctx.fill();
            ctx.lineWidth = 1;
        } else {
            // fireball — a small, solid flaming ball (two layers)
            ctx.fillStyle = "#e8521a"; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffb13a"; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    // Health/shield bars for every unit and damaged tower, drawn in one pass that
    // sits ABOVE all units, towers, and flying troops — only spells render over
    // them. Geometry was stashed on each entity by drawEntityBody this same frame.
    drawHealthBars() {
        for (let e of this.eng.ents) {
            if (e._barY === undefined || e.hp <= 0) continue; // dying units are already gone
            if (e.isGhosted) continue; // phantoms show no bar
            if (e.teslaHidden) continue; // a buried Tesla shows nothing at all

            let x = e._barX, barY = e._barY, barW = e._barW;
            // The shield has been damaged (not full)? Show the shield bar — and the
            // health bar too, so both are visible at once. `shieldHurt` also covers a
            // shield that was broken clean off (shield now 0) so the HP bar still appears.
            let shieldDmg = e.shield > 0 && !(e.maxShield > 0 && e.shield >= e.maxShield);
            let shieldHurt = e.maxShield > 0 && e.shield < e.maxShield;
            if (shieldDmg) {
                // Guard against a missing/zero maxShield (would make the bar infinite).
                let shPct = e.maxShield > 0 ? Math.max(0, Math.min(1, e.shield / e.maxShield)) : 1;
                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect(x - barW / 2 - 1, barY - 6, barW + 2, 5);
                ctx.fillStyle = "#d9b3ff";
                ctx.fillRect(x - barW / 2, barY - 5, barW * shPct, 3);
            }
            // Show a health bar once the unit has taken damage OR its shield is at all hurt
            // (damaged or fully broken — even a one-shot shield break reveals the HP bar).
            if (e.hp < e.mhp || shieldHurt) {
                let hpPct = Math.max(0, Math.min(1, e.hp / e.mhp));
                ctx.fillStyle = "rgba(0,0,0,0.55)";
                ctx.fillRect(x - barW / 2 - 1, barY - 1, barW + 2, 6);
                ctx.fillStyle = e._barFriend ? "#2f8bff" : "#ff4d4d";
                ctx.fillRect(x - barW / 2, barY, barW * hpPct, 4);
                // Goblin Demolisher: a mark at the HALF-way point — below it, it goes into
                // its last-stand charge.
                if (e.c && e.c.n === "Goblin Demolisher") {
                    ctx.fillStyle = "rgba(0,0,0,0.85)";
                    ctx.fillRect(x - 1, barY - 1, 2, 6);
                }
            } else if (e.hp > e.mhp) {
                // OVERHEAL (Evo Witch fed by dying skeletons): full bar, plus a GOLD
                // overcharge segment extending past the right edge (capped at +1 bar).
                ctx.fillStyle = "rgba(0,0,0,0.55)";
                ctx.fillRect(x - barW / 2 - 1, barY - 1, barW + 2, 6);
                ctx.fillStyle = e._barFriend ? "#2f8bff" : "#ff4d4d";
                ctx.fillRect(x - barW / 2, barY, barW, 4);
                let ov = Math.min(1, (e.hp - e.mhp) / e.mhp);
                ctx.fillStyle = "rgba(0,0,0,0.55)";
                ctx.fillRect(x + barW / 2, barY - 1, barW * ov + 1, 6);
                ctx.fillStyle = "#ffd23c";
                ctx.fillRect(x + barW / 2, barY, barW * ov, 4);
            }
            // EVO Musketeer: remaining sniper shots as purple pips above the bar.
            if (e.sniperShots > 0) {
                for (let i = 0; i < e.sniperShots; i++) {
                    let px = x - (e.sniperShots - 1) * 5 + i * 10;
                    ctx.fillStyle = "#c45cff";
                    ctx.beginPath(); ctx.arc(px, barY - 9, 3.2, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(px, barY - 9, 3.2, 0, Math.PI * 2); ctx.stroke();
                }
            }
        }
    }

    // One clock-wipe per card played, coloured by team (blue=player, red=enemy).
    // It fills over the troops' ~1s deploy time, like the real game.
    drawDeploys() {
        for (const d of this.eng.deploys) {
            let frac = Math.max(0, Math.min(1, 1 - d.t / d.max));
            let r = 9;                 // small clock
            // Sits low, near the bottom of the spawned card. Flying units are drawn
            // raised, so their clock sits at the bottom of that raised sprite.
            let cy = d.fly ? d.y - 8 : d.y + 18;
            let col = d.tm === 0 ? "#2f9bff" : "#ff4d4d";
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.beginPath(); ctx.arc(d.x, cy, r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.moveTo(d.x, cy);
            ctx.arc(d.x, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2, false);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(d.x, cy, r, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1;
        }
    }

    drawArrowsVolley(p) {
        // Three SHORT discrete waves with empty gaps between them — reads as
        // "wave, wave, wave", not a continuous rainfall.
        const maxLife = 28;
        const elapsed = maxLife - p.life;          // 0..28
        const windows = [[0, 6], [10, 16], [20, 26]]; // wave time windows (ticks)
        const perWave = 7;
        for (let w = 0; w < windows.length; w++) {
            let [s, e] = windows[w];
            if (elapsed < s || elapsed > e) continue; // nothing between waves
            let wt = (elapsed - s) / (e - s);          // 0..1 within this wave
            let fall = (1 - wt) * 55;
            ctx.globalAlpha = wt > 0.8 ? Math.max(0, (1 - wt) / 0.2) : 1; // fade as they land
            for (let i = 0; i < perWave; i++) {
                let ang = i * 2.399963 + w * 1.3;
                let rr = Math.sqrt((i + 0.5) / perWave) * p.rad * 0.88;
                let ax = p.x + Math.cos(ang) * rr;
                let ay = p.y + Math.sin(ang) * rr;
                ctx.save();
                ctx.translate(ax, ay - fall);
                ctx.strokeStyle = "#6b4423"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
                ctx.fillStyle = "#d9d9d9";
                ctx.beginPath(); ctx.moveTo(0, 11); ctx.lineTo(-3, 6); ctx.lineTo(3, 6); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = "#eaeaea"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(-3, -11); ctx.moveTo(0, -8); ctx.lineTo(3, -11); ctx.stroke();
                ctx.restore();
            }
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
    }

    // Sparky / Zappies charge-up: a single electric ring that grows from slim+dim to
    // thick+bright as it charges. No white tendrils.
    drawCharge(e) {
        let thr = e.c.n === "Sparky" ? 180 : 72;
        let frac = Math.min(1, e.chargeT / thr);
        if (frac < 0.12) return; // barely started — nothing yet
        let cx = e.x, cy = e.y, R = e.rad + 4;
        let seed = Math.floor(Date.now() / 60);
        // Slim & dim early, thick & bright near full charge.
        let width = 0.8 + frac * 2.6;
        let alpha = 0.22 + frac * 0.7;
        // A light flicker while still charging; steady once nearly full.
        let flick = (frac < 0.85 && seed % 2 === 0) ? 0.5 : 1.0;
        ctx.strokeStyle = `rgba(150, 225, 255, ${(alpha * flick).toFixed(2)})`;
        ctx.lineWidth = width;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        // Fully charged: a soft bright inner glow ring (still no spikes).
        if (frac >= 0.85) {
            ctx.strokeStyle = "rgba(205, 245, 255, 0.9)";
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(cx, cy, R - 2, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.lineWidth = 1;
    }

    // Zap: a jagged light-blue lightning bolt strikes down from the sky.
    // Register an animated sprite sheet: a vertical column of `frameSize`×`frameSize` frames
    // (default 16). Frame count is read from the image height once it loads.
    addSprite(name, src, frameSize = 16) {
        const s = { img: new Image(), loaded: false, frames: 1, fs: frameSize };
        s.img.onload = () => { s.loaded = true; s.frames = Math.max(1, Math.round(s.img.height / s.fs)); };
        s.img.src = src;
        this.sprites[name] = s;
        return s;
    }

    // Draw a sprite frame CRISP (no smoothing), centred at (x, y), scaled to `size`×`size`.
    // `frame` wraps around the sheet's frame count (so a rising counter loops forever).
    // Returns false if the sheet hasn't loaded yet (so callers can draw a fallback).
    drawSprite(name, x, y, size, frame) {
        const s = this.sprites[name];
        if (!s || !s.loaded) return false;
        let f = ((Math.floor(frame) % s.frames) + s.frames) % s.frames;
        const sm = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(s.img, 0, f * s.fs, s.fs, s.fs, x - size / 2, y - size / 2, size, size);
        ctx.imageSmoothingEnabled = sm;
        return true;
    }

    drawZapStrike(p) {
        // In-game zap renders NORMALLY (procedural bolt + flash) — the pixel-art sprite is
        // only used on the deck card. On High graphics the strike FORKS (two thinner side
        // bolts feeding the main one) with a glow at the strike point, and the impact pops
        // an expanding electric ring with radial crackle.
        const col = p.flashCol || "#7fdcff";
        if (p.life > 5) {
            ctx.save();
            ctx.lineCap = "round";
            const segs = 8;
            const H = 140; // fixed bolt height — same strike length wherever it's placed
            const bolt = (xoff, phase, w, alpha) => {
                const pts = [];
                for (let i = 0; i <= segs; i++) {
                    let yy = (p.y - H) + (H / segs) * i;
                    let jit = (i === 0 || i === segs) ? 0 : Math.sin(i * 9.3 + phase + Math.floor(Date.now() / 55)) * 13;
                    pts.push([p.x + xoff * (1 - i / segs) + jit, yy]);
                }
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = col; ctx.lineWidth = w;
                ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
                ctx.strokeStyle = "#ffffff"; ctx.lineWidth = Math.max(1, w * 0.35);
                ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
                ctx.globalAlpha = 1;
            };
            bolt(0, 0, 4, 1);
            if (this.gfxHigh) {
                bolt(-26, 3.7, 2, 0.55);
                bolt(26, 7.9, 2, 0.55);
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = "#eaffff";
                ctx.beginPath(); ctx.arc(p.x, p.y, 10 + Math.sin(Date.now() / 40) * 3, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        } else {
            let a = Math.max(0, p.life / 5);
            ctx.globalAlpha = 0.5 * a + 0.12;
            ctx.fillStyle = p.flashCol || "#cdf3ff";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            if (this.gfxHigh) {
                const k = 1 - a;
                ctx.globalAlpha = 0.85 * a;
                ctx.strokeStyle = "#eaffff"; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.rad * (0.55 + 0.5 * k), 0, Math.PI * 2); ctx.stroke();
                ctx.lineWidth = 1.6; ctx.lineCap = "round";
                for (let i = 0; i < 5; i++) {
                    const ang = i * (Math.PI * 2 / 5) + 0.6;
                    const r0 = p.rad * 0.35, r1 = p.rad * (0.75 + 0.3 * k);
                    const mx = p.x + Math.cos(ang + 0.18) * (r0 + r1) / 2, my = p.y + Math.sin(ang + 0.18) * (r0 + r1) / 2;
                    ctx.beginPath();
                    ctx.moveTo(p.x + Math.cos(ang) * r0, p.y + Math.sin(ang) * r0);
                    ctx.lineTo(mx, my);
                    ctx.lineTo(p.x + Math.cos(ang - 0.1) * r1, p.y + Math.sin(ang - 0.1) * r1);
                    ctx.stroke();
                }
                ctx.lineCap = "butt"; ctx.globalAlpha = 1;
            }
        }
        ctx.lineWidth = 1;
    }

    // Placed spell that drops a symbol from the sky, then flashes on impact.
    drawSpellDrop(p) {
        if (p.dropKind === "zap") { this.drawZapStrike(p); return; }
        const impact = 6;
        const maxL = p.dropMax || 30;
        if (p.life > impact) {
            // descending symbol + a growing target shadow (perfect circle)
            let t = (maxL - p.life) / (maxL - impact); // 0..1
            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.beginPath(); ctx.arc(p.x, p.y, 5 + 9 * t, 0, Math.PI * 2); ctx.fill();
            ctx.save();
            ctx.translate(p.x, p.y - (1 - t) * 95);
            this.drawSpellSymbol(p.dropKind, 1);
            ctx.restore();
        } else {
            // impact flash in the spell's colour, with the symbol fading out
            let a = Math.max(0, p.life / impact);
            ctx.globalAlpha = 0.55 * a + 0.15;
            ctx.fillStyle = p.flashCol || "#ffffff";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.rad * (1 - 0.25 * a), 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.save(); ctx.translate(p.x, p.y);
            this.drawSpellSymbol(p.dropKind, a);
            ctx.restore();
        }
    }

    drawSpellSymbol(kind, alpha) {
        ctx.globalAlpha = alpha;
        if (kind === "freeze") {
            ctx.strokeStyle = "#dff3ff"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
            for (let i = 0; i < 6; i++) {
                ctx.save(); ctx.rotate(i * Math.PI / 3);
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -11);
                ctx.moveTo(0, -7); ctx.lineTo(-3, -10); ctx.moveTo(0, -7); ctx.lineTo(3, -10);
                ctx.stroke(); ctx.restore();
            }
            ctx.lineCap = "butt";
        } else if (kind === "zap") {
            ctx.fillStyle = "#9fe6ff";
            ctx.beginPath();
            ctx.moveTo(3, -12); ctx.lineTo(-5, 1); ctx.lineTo(-1, 1); ctx.lineTo(-3, 12);
            ctx.lineTo(6, -3); ctx.lineTo(1, -3); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "#3aa0d6"; ctx.lineWidth = 1; ctx.stroke();
        } else if (kind === "vines") {
            ctx.fillStyle = "#7ad06a";
            ctx.beginPath(); ctx.ellipse(0, 0, 5, 10, 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#3f7a32"; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(-4, 7); ctx.lineTo(4, -7); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
    }
}

new Main();