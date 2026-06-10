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
const RIV_Y = 400;

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
    MP_JOIN: 'MP_JOIN'
};

class Main {
    constructor() {
        this.state = State.TITLE;
        this.t0 = 0;
        this.scrollY = 0;
        this.eng = new GameEngine();
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

        this.cardRects = [];
        this.nextCardRect = { x: W - 60, y: H - 105, w: 60, h: 105 };
        this.cardOffsets = [0, 0, 0, 0]; // For hover animation

        this.init();
    }

    init() {
        this.playBtn = { x: W / 2 - 60, y: H / 2 + 40 - 150, w: 120, h: 50 };
        this.deckBtn = { x: W / 2 - 60, y: H / 2 + 100 - 150, w: 120, h: 50 };
        this.mpBtn = { x: W / 2 - 60, y: H / 2 + 160 - 150, w: 120, h: 50 };
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

        this.visitorCount = "...";

        // Fetch Visitor Count
        fetch('https://api.counterapi.dev/v1/clash-royale-clone-gemini/visits/up')
            .then(res => res.json())
            .then(data => {
                this.visitorCount = data.count;
            })
            .catch(err => {
                console.error("Counter Error:", err);
                this.visitorCount = "Err";
            });

        let cardPanelY = H - 100;
        let cardAreaW = W - 60;
        let cardW = (cardAreaW - 30) / 4;
        for (let i = 0; i < 4; i++) {
            this.cardRects.push({ x: 6 + i * (cardW + 6), y: cardPanelY, w: cardW, h: 95 });
        }

        canvas.width = W;
        canvas.height = H;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (W / rect.width);
            const my = (e.clientY - rect.top) * (H / rect.height);
            this.mouse = { x: mx, y: my };
        });
        canvas.addEventListener('wheel', (e) => {
            if (this.state === State.DECK || this.state === State.ENEMY_DECK) {
                this.scrollY += Math.sign(e.deltaY) * 20;
                let listSize = (this.state === State.DECK) ? this.eng.unlockedCards.length : this.eng.allCards.length;
                let maxScroll = Math.max(0, (Math.floor(listSize / 3) + 2) * 80 + 150 - H);
                if (this.scrollY < 0) this.scrollY = 0;
                if (this.scrollY > maxScroll) this.scrollY = maxScroll;
            }
        });

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
            } else if (!this.eng.cheatPressed && x > W - 53 && y < 26) {
                this.eng.cheatPressed = true;
                this.eng.saveProgress();
                this.state = State.CHEAT;
            } else if (this.eng.cheated && x > W - 53 && y < 26) {
                this.state = State.DEBUG_MENU;
            }
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
                this.state = State.TITLE;
            }
        } else if (this.state === State.DECK) {
            // ... (Deck logic unchanged)
            if (this.contains(this.backBtn, x, y)) {
                this.state = State.TITLE;
                this.scrollY = 0;
            } else {
                let cols = 3;
                let margin = 20;
                let cardW = (W - (cols + 1) * margin) / cols;
                let cardH = 60;
                for (let i = 0; i < this.eng.unlockedCards.length; i++) {
                    let row = Math.floor(i / cols);
                    let col = i % cols;
                    let cx = margin + col * (cardW + margin);
                    let cy = 100 + row * (cardH + margin) - this.scrollY;
                    if (cy > H || cy + cardH < 0) continue;

                    if (this.contains({ x: cx, y: cy, w: cardW, h: cardH }, x, y)) {
                        let c = this.eng.unlockedCards[i];
                        let idx = this.eng.myDeck.indexOf(c);
                        if (idx > -1) this.eng.myDeck.splice(idx, 1);
                        else if (this.eng.myDeck.length < 8) this.eng.myDeck.push(c);
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
                let cols = 3;
                let margin = 20;
                let cardW = (W - (cols + 1) * margin) / cols;
                let cardH = 60;
                for (let i = 0; i < this.eng.allCards.length; i++) {
                    let c = this.eng.allCards[i];
                    let selected = this.eng.enemyDeckSelection.includes(c);
                    let row = Math.floor(i / cols);
                    let col = i % cols;
                    let cx = margin + col * (cardW + margin);
                    let cy = 100 + row * (cardH + margin) - this.scrollY;
                    if (cy > H || cy + cardH < 0) continue;

                    if (this.contains({ x: cx, y: cy, w: cardW, h: cardH }, x, y)) {
                        let c = this.eng.allCards[i];
                        let idx = this.eng.enemyDeckSelection.indexOf(c);
                        if (idx > -1) this.eng.enemyDeckSelection.splice(idx, 1);
                        else if (this.eng.enemyDeckSelection.length < 8) this.eng.enemyDeckSelection.push(c);
                        this.eng.saveProgress();
                    }
                }
            }
        } else if (this.state === State.PLAY) {
            if (y > H - 130) {
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
                // Troops/buildings snap to the tile grid; spells are placed freely.
                if (this.eng.sel && this.eng.sel.t !== 2) {
                    let s = this.snapToGrid(x, y);
                    rx = s.x; ry = s.y;
                }

                if (this.eng.isMultiplayer) {
                    // Send Spawn Request via MP
                    if (this.eng.sel) {
                        let myTeam = this.mp.isHost ? 0 : 1;
                        this.mp.sendSpawnRequest(this.eng.sel.n, rx, ry, myTeam);
                        this.eng.sel = null;
                    }
                } else {
                    // Singleplayer
                    if (this.eng.sel) {
                        this.eng.spawn(rx, ry);
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
        if (this.state !== State.PLAY && this.state !== State.CNT) return;
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
            this.drawCenteredString("Resume previous game?", W / 2, H / 2 - 75, "bold 30px Arial", "#004000");
            this.drawBtn(this.resumeYesBtn, "YES", "#32CD32");
            this.drawBtn(this.resumeNoBtn, "NO", "#FF6347");
            return;
        }

        if (this.state === State.TITLE) {
            this.menuBg();

            // Draw Visitor Count
            ctx.fillStyle = "#006400";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`${this.visitorCount}`, 10, 20);

            ctx.textAlign = "center";

            this.drawCenteredString("Clash Clone", W / 2, H / 2 - 50 - 150, "bold 40px Arial", "#006400");

            let validDeck = this.eng.myDeck.length === 8;
            this.drawBtn(this.playBtn, "PLAY", validDeck ? "#32CD32" : "gray");
            if (!validDeck) {
                this.drawCenteredString("Build a deck of 8 cards!", W / 2, this.playBtn.y - 10, "12px Arial", "red");
            }
            this.drawBtn(this.deckBtn, "DECK", "#FFA500");
            this.drawBtn(this.mpBtn, "MULTIPLAYER", "#3296ff");

            this.drawCenteredString(`Cards Unlocked: ${this.eng.unlockedCards.length}/${this.eng.allCards.length}`, W / 2, H - 150 - 120, "italic 14px Arial", "#2E8B57");
            this.drawCenteredString(`Wins: ${this.eng.gamesWon} | Matches: ${this.eng.gamesPlayed}`, W / 2, H - 130 - 120, "italic 14px Arial", "#2E8B57");

            if (!this.eng.cheatPressed) {
                ctx.fillStyle = "rgba(0,100,0,0.5)";
                ctx.font = "10px Arial";
                ctx.fillText("cheat", W - 43, 16);
            } else if (this.eng.cheated) {
                ctx.fillStyle = "rgba(0,100,0,0.5)";
                ctx.font = "10px Arial";
                ctx.fillText("debug", W - 49, 16);
            }

            this.drawCenteredString("by Oliver Zhou", W / 2, H - 20, "10px Arial", "rgba(0, 100, 0, 0.5)");
            return;
        }

        if (this.state === State.MP_MENU) {
            this.menuBg();

            this.drawCenteredString("MULTIPLAYER", W / 2, 100, "bold 40px Arial", "white");

            this.drawBtn(this.makeGameBtn, "MAKE GAME", "#3296ff");
            this.drawBtn(this.joinGameBtn, "JOIN GAME", "#FFA500");

            this.drawBtn(this.backBtn, "BACK", "#FF6347");
            // Red warning note
            ctx.fillStyle = "red";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("NOTE: DEBUG FEATURES DISABLED IN MULTIPLAYER", W / 2, H - 20);
            if (this.mp.backendAvailable === false) {
                ctx.fillStyle = "#ffcc00";
                ctx.font = "12px Arial";
                ctx.fillText("No game server reachable for this site.", W / 2, H - 50);
                ctx.fillText("See README to host one (set MP_API_BASE).", W / 2, H - 36);
            }
            return;
        }

        if (this.state === State.MP_HOST) {
            this.menuBg();

            this.drawCenteredString("Waiting for opponent...", W / 2, H / 2 - 100, "24px Arial", "white");

            if (this.mp.code) {
                this.drawCenteredString(`CODE: ${this.mp.code}`, W / 2, H / 2, "bold 60px Arial", "white");
            } else {
                this.drawCenteredString(`Generating Code...`, W / 2, H / 2, "italic 20px Arial", "#eee");
            }

            this.drawBtn(this.backBtn, "CANCEL", "#FF6347");
            return;
        }

        if (this.state === State.MP_JOIN) {
            this.menuBg();

            this.drawCenteredString("ENTER CODE:", W / 2, H / 2 - 100, "bold 30px Arial", "white");

            // Draw Code Digits
            let codeStr = this.enteredCode;
            ctx.font = "bold 50px Courier New";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(codeStr.padEnd(5, '_').split('').join(' '), W / 2, H / 2);

            this.drawCenteredString("Type digits on keyboard. Press Enter to Join.", W / 2, H / 2 + 60, "14px Arial", "#eee");

            this.drawBtn(this.backBtn, "BACK", "#FF6347");
            return;
        }

        if (this.state === State.CHEAT) {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, W, H);
            this.drawCenteredString("Unlock all cards?", W / 2, H / 2 - 50, "bold 30px Arial", "white");
            this.drawBtn(this.yesBtn, "YES", "green");
            this.drawBtn(this.noBtn, "NO", "red");
            return;
        }

        if (this.state === State.DECK) {
            this.paintBg("#243a2b", "#13201a");
            let cols = 3;
            let margin = 20;
            let cardW = (W - (cols + 1) * margin) / cols;
            let cardH = 60;

            for (let i = 0; i < this.eng.unlockedCards.length; i++) {
                let c = this.eng.unlockedCards[i];
                let selected = this.eng.myDeck.includes(c);
                let row = Math.floor(i / cols);
                let col = i % cols;
                let cx = margin + col * (cardW + margin);
                let cy = 100 + row * (cardH + margin) - this.scrollY;
                if (cy > H || cy + cardH < 0) continue;
                this.drawDeckCard(cx, cy, cardW, cardH, c, selected);
            }

            // Header panel
            ctx.fillStyle = "rgba(10,18,12,0.94)";
            ctx.fillRect(0, 0, W, 92);
            ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(W, 92); ctx.stroke();

            let valid = this.eng.myDeck.length === 8;
            this.drawCenteredString("Build Your Deck", W / 2, 38, "bold 26px Arial", "#eaffea");
            this.drawCenteredString(`${this.eng.myDeck.length} / 8`, W / 2 - 70, 70, "bold 16px Arial", valid ? "#7CFC6A" : "#ffd24d");
            let sum = this.eng.myDeck.reduce((a, b) => a + b.c, 0);
            let avg = this.eng.myDeck.length ? (sum / this.eng.myDeck.length).toFixed(1) : "0.0";
            this.drawCenteredString(`Avg Elixir ${avg}`, W / 2 + 60, 70, "bold 15px Arial", "#e08cff");

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
            // (Unchanged enemy deck render)
            ctx.fillStyle = "#282828";
            ctx.fillRect(0, 0, W, H);
            let cols = 3;
            let margin = 20;
            let cardW = (W - (cols + 1) * margin) / cols;
            let cardH = 60;

            for (let i = 0; i < this.eng.allCards.length; i++) {
                let c = this.eng.allCards[i];
                let selected = this.eng.enemyDeckSelection.includes(c);
                let row = Math.floor(i / cols);
                let col = i % cols;
                let cx = margin + col * (cardW + margin);
                let cy = 100 + row * (cardH + margin) - this.scrollY;
                if (cy > H || cy + cardH < 0) continue;

                ctx.fillStyle = selected ? "#00c800" : "#646464";
                ctx.fillRect(cx, cy, cardW, cardH);
                ctx.strokeStyle = "black";
                ctx.strokeRect(cx, cy, cardW, cardH);
                this.drawCenteredString(c.n, cx + cardW / 2, cy + cardH / 2, "bold 11px Arial", "white");
                this.drawElixirCost(cx - 5, cy - 5, c.c);
            }

            ctx.fillStyle = "#282828";
            ctx.fillRect(0, 0, W, 90);
            this.drawCenteredString(`Enemy Deck (${this.eng.enemyDeckSelection.length}/8)`, W / 2, 50, "bold 30px Arial", "white");
            this.drawBtn(this.backBtn, "BACK", "red");
            return;
        }

        if (this.state === State.NEW_CARD) {
            // (Unchanged new card render)
            ctx.fillStyle = "#e0f0e0";
            ctx.fillRect(0, 0, W, H);
            this.drawCenteredString("NEW CARD", W / 2, 150, "bold 30px Arial", "#006400");
            this.drawCenteredString("UNLOCKED!", W / 2, 190, "bold 30px Arial", "#006400");

            if (this.justUnlocked) {
                let cardW = 140, cardH = 180;
                let cx = (W - cardW) / 2;
                let cy = (H - cardH) / 2;

                ctx.fillStyle = "white";
                this.drawRoundRect(cx, cy, cardW, cardH, 15, true, true);

                this.drawCenteredString(this.justUnlocked.n, cx + cardW / 2, cy + cardH / 2, "bold 18px Arial", "black");
                this.drawElixirCost(cx - 10, cy - 10, this.justUnlocked.c);
            }
            this.drawBtn(this.continueBtn, "CONTINUE", "#32CD32");
            return;
        }

        // River with muddy banks and a water gradient
        ctx.fillStyle = "#6b4a2a";
        ctx.fillRect(0, RIV_Y - 18, W, 36);
        const riv = ctx.createLinearGradient(0, RIV_Y - 14, 0, RIV_Y + 14);
        riv.addColorStop(0, "#46a7e6");
        riv.addColorStop(0.5, "#2f7fc0");
        riv.addColorStop(1, "#46a7e6");
        ctx.fillStyle = riv;
        ctx.fillRect(0, RIV_Y - 14, W, 28);
        // Wooden bridges with planks
        for (const bx of [W / 4, W * 3 / 4]) {
            ctx.fillStyle = "#9c6b3a";
            ctx.fillRect(bx - 26, RIV_Y - 20, 52, 40);
            ctx.strokeStyle = "rgba(60,35,15,0.55)";
            ctx.lineWidth = 2;
            for (let py = RIV_Y - 16; py <= RIV_Y + 18; py += 8) {
                ctx.beginPath(); ctx.moveTo(bx - 26, py); ctx.lineTo(bx + 26, py); ctx.stroke();
            }
            ctx.lineWidth = 1;
        }

        // Render Game during COUNTDOWN (CNT) or PLAY
        if (this.state === State.PLAY || this.state === State.CNT) {
            if (this.eng.sel && (this.eng.sel.t !== 2 || ["The Log", "Barbarian Barrel"].includes(this.eng.sel.n))) {
                // Draw invalid area (red tint)
                ctx.fillStyle = "rgba(255, 0, 0, 0.32)";

                // Top Half (Always invalid) - Area behind towers/King
                ctx.fillRect(0, 0, W, 200);

                // Enemy side is invalid until that lane's princess tower falls
                if (this.eng.t2L && this.eng.t2L.hp > 0) ctx.fillRect(0, 200, W / 2, RIV_Y - 200);
                if (this.eng.t2R && this.eng.t2R.hp > 0) ctx.fillRect(W / 2, 200, W / 2, RIV_Y - 200);

                // Tile grid + hovered-cell highlight for troops/buildings
                if (this.eng.sel.t !== 2) this.drawPlacementGrid(this.eng.sel);
            } // Close Invalid Area Logic

            // Entity bodies are drawn below in layered passes
            // (shadows/effects -> ground units -> projectiles -> flying units).

            // HOVER PREVIEW (Ghost Unit & Range)
            if ((this.state === State.PLAY || this.state === State.CNT) && this.eng.sel && this.mouse.y < H - 120) {
                let c = this.eng.sel;
                let spellShape = this.eng.getSpellRadius(c);
                let canAfford = this.eng.p1.elx >= c.c;

                ctx.globalAlpha = 0.6;
                if (spellShape) {
                    // Animated Dashed Border Style
                    let time = Date.now() / 50; // Speed of animation

                    ctx.fillStyle = canAfford ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 100, 100, 0.2)";
                    ctx.strokeStyle = "white"; // Always white for visibility
                    ctx.lineWidth = 3;
                    ctx.setLineDash([10, 10]);
                    ctx.lineDashOffset = -time; // Animate march

                    if (["The Log", "Barbarian Barrel"].includes(c.n)) {
                        // Draw Arrow for rolling spells
                        let dist = (c.n === "The Log") ? 280 : 101;
                        let ey = this.mouse.y - dist;
                        ctx.beginPath();
                        ctx.moveTo(this.mouse.x, this.mouse.y);
                        ctx.lineTo(this.mouse.x, ey);

                        // Arrowhead
                        ctx.lineTo(this.mouse.x - 10, ey + 15);
                        ctx.moveTo(this.mouse.x, ey);
                        ctx.lineTo(this.mouse.x + 10, ey + 15);
                        ctx.stroke();

                        // Also fill rect for body width
                        let w = (c.n === "The Log") ? 70 : 44;
                        ctx.fillStyle = canAfford ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 100, 100, 0.2)";
                        ctx.fillRect(this.mouse.x - w / 2, ey, w, dist);
                    } else if (spellShape.type === 'circle') {
                        ctx.beginPath();
                        ctx.arc(this.mouse.x, this.mouse.y, spellShape.val, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                    } else if (spellShape.type === 'rect') {
                        ctx.beginPath();
                        ctx.rect(this.mouse.x - spellShape.w / 2, this.mouse.y - spellShape.h / 2, spellShape.w, spellShape.h);
                        ctx.fill();
                        ctx.stroke();
                    }

                    // Reset Dash
                    ctx.setLineDash([]);
                    ctx.lineWidth = 1;

                    // Center marker
                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.arc(this.mouse.x, this.mouse.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "black";
                    ctx.stroke();
                } else {
                    // Snapped ghost preview for troops/buildings.
                    let snap = this.snapToGrid(this.mouse.x, this.mouse.y);
                    let gx = snap.x, gy = snap.y;
                    let range = c.rn || 0;
                    let radius = this.eng.getVisualRadius(c);
                    let valid = canAfford && this.eng.isValid(gy, gx, c, 0) && this.mouse.y < H - 130;
                    let col = this.getUnitColor(c.n);

                    // Range ring
                    if (range > 0) {
                        ctx.beginPath();
                        ctx.strokeStyle = "rgba(255,255,255,0.45)";
                        ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
                        ctx.arc(gx, gy, range, 0, Math.PI * 2); ctx.stroke();
                        ctx.setLineDash([]); ctx.lineWidth = 1;
                    }
                    // Ghost body in the unit's colour (grey when can't place)
                    ctx.globalAlpha = valid ? 0.65 : 0.4;
                    ctx.fillStyle = valid ? col : "#8a8a8a";
                    ctx.beginPath(); ctx.arc(gx, gy, radius, 0, Math.PI * 2); ctx.fill();
                    // Dashed outline
                    ctx.globalAlpha = 1.0;
                    ctx.strokeStyle = valid ? "#ffffff" : "#ff6a6a";
                    ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
                    ctx.beginPath(); ctx.arc(gx, gy, radius + 2, 0, Math.PI * 2); ctx.stroke();
                    ctx.setLineDash([]); ctx.lineWidth = 1;
                    // Name label
                    this.drawCenteredString(c.n, gx, gy - radius - 7, "bold 11px Arial", "rgba(255,255,255,0.9)");
                }
                ctx.globalAlpha = 1.0;
            }

            // Projectiles
            for (let p of this.eng.projs) {
                if (p.isArrows || p.isSpellArc || p.isRolling) continue; // drawn in drawProj (top layer)
                if (p.barrel) {
                    ctx.fillStyle = "#643200";
                } else if (p.fireArea) {
                    let size = p.rad * 2;
                    if (p.isGray) {
                        ctx.fillStyle = "rgba(100, 100, 100, 0.7)";
                        ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "lightgray";
                        ctx.beginPath(); ctx.arc(p.x, p.y, size / 4, 0, Math.PI * 2); ctx.fill();
                    } else {
                        // Explosion flash in the spell's colour (fireball orange,
                        // snowball icy, etc.).
                        ctx.globalAlpha = 0.75;
                        ctx.fillStyle = p.flashCol || "#ff4500";
                        ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
                        ctx.globalAlpha = 1.0;
                        ctx.fillStyle = p.flashCol === "#cfeeff" ? "#eaf7ff" : "yellow";
                        ctx.beginPath(); ctx.arc(p.x, p.y, size / 4, 0, Math.PI * 2); ctx.fill();
                    }
                } else if (p.isHeal) {
                    ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
                } else if (p.redArea) {
                    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
                } else if (p.brownArea) {
                    ctx.fillStyle = "rgba(139, 69, 19, 0.6)";
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
                        if (p.tm === 1) ctx.fillStyle = "#8b0000"; // Dark Red for Enemy
                        else ctx.fillStyle = "#8b4513"; // Brown for Player
                        // Render as rectangle
                        let w = p.barbBarrelLog ? 44 : 70;
                        let h = 20;
                        ctx.fillRect(p.x - w / 2, p.y - h / 2, w, h);
                        // ctx.strokeStyle = "black";
                        // ctx.strokeRect(p.x - w / 2, p.y - h / 2, w, h);
                        continue; // Skip default circle rendering
                    }
                    ctx.fillStyle = "#640096";
                } else {
                    ctx.fillStyle = p.flashCol || (p.spl ? (p.rad < 10 ? "cyan" : "orange") : "lightgray");
                }

                if (!p.fireArea && !p.poison && !p.graveyard) {
                    let size = p.rad * 2;
                    if (!p.spl && !p.barrel && !p.redArea && !p.brownArea && !p.isHeal && !p.barbBreak && !p.isRolling && !p.isLightBlue) size = 8;
                    ctx.beginPath(); ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2); ctx.fill();
                }

                if (p.chainTargets) {
                    ctx.strokeStyle = "cyan";
                    ctx.beginPath();
                    for (let i = 0; i < p.chainTargets.length - 1; i++) {
                        let e1 = p.chainTargets[i];
                        let e2 = p.chainTargets[i + 1];
                        if (e1 && e2) {
                            ctx.moveTo(e1.x, e1.y);
                            ctx.lineTo(e2.x, e2.y);
                        }
                    }
                    ctx.stroke();
                }
            }

            // Entities (Shadows/Effects first)
            for (let e of this.eng.ents) {
                if (e instanceof Troop) {
                    if (e.chargeT > 0) {
                        ctx.fillStyle = `rgba(100, 200, 255, ${0.6 + 0.2 * Math.sin(e.chargeT * 0.2)})`;
                        let r = e.rad + 5;
                        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.stroke();
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

                // Inferno Beams
                let isInferno = false;
                let target = null;
                let ticks = e.infernoTick;

                if (e instanceof Troop && e.c.n === "Inferno Dragon" && e.atk) {
                    isInferno = true; target = e.lk;
                } else if (e instanceof Building && e.c.n === "Inferno Tower" && e.atk) {
                    isInferno = true; target = e.lk;
                }

                if (isInferno && target) {
                    let width = 2 + (ticks / 20.0);
                    if (width > 8) width = 8;
                    ctx.lineWidth = width;
                    let green = Math.max(0, 165 - ticks);
                    ctx.strokeStyle = `rgb(255, ${green}, 0)`;
                    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(target.x, target.y); ctx.stroke();
                    ctx.lineWidth = 1;
                }

                // Soft ground shadow under units. Ground units cast it at their
                // feet; fliers float above a smaller one; a jumper's shadow
                // shrinks toward the apex.
                if (e instanceof Troop || e instanceof Building) {
                    let baseR = e.rad * 0.82;
                    if (e.fly) {
                        ctx.fillStyle = "rgba(0,0,0,0.15)";
                        ctx.beginPath(); ctx.ellipse(e.x, e.y + 4, baseR * 0.72, baseR * 0.3, 0, 0, Math.PI * 2); ctx.fill();
                    } else if (e instanceof Troop && e.jp && e.jt) {
                        let s = 1 - 0.4 * Math.sin((1.0 - (e.dist(e.jt) / (e.jd || 1))) * Math.PI);
                        ctx.fillStyle = "rgba(0,0,0,0.18)";
                        ctx.beginPath(); ctx.ellipse(e.x, e.y + baseR * 0.5, baseR * 0.85 * s, baseR * 0.33 * s, 0, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.fillStyle = "rgba(0,0,0,0.20)";
                        ctx.beginPath(); ctx.ellipse(e.x, e.y + baseR * 0.5, baseR * 0.85, baseR * 0.3, 0, 0, Math.PI * 2); ctx.fill();
                    }
                }
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

            // Draw Entities
            for (let e of this.eng.ents) if (!e.fly) this.drawEntityBody(e);

            // Draw Projectiles
            if (this.eng.projs) {
                for (let p of this.eng.projs) this.drawProj(p);
            }

            for (let e of this.eng.ents) if (e.fly) this.drawEntityBody(e);

            // Status Effects
            for (let e of this.eng.ents) {
                if (e instanceof Troop && e.curseTime > 0) {
                    ctx.fillStyle = "rgba(128, 0, 128, 0.4)";
                    let r = e.rad + 5;
                    ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = "magenta";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.stroke();
                    ctx.lineWidth = 1;
                }
            }

            if (this.eng.debugView) {
                ctx.strokeStyle = "rgba(255, 255, 0, 0.2)";
                for (let e of this.eng.ents) {
                    if (e instanceof Troop) {
                        let r = e.sightRange;
                        ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI * 2); ctx.stroke();
                        ctx.strokeStyle = "rgba(255, 165, 0, 0.6)";
                        let ar = e.c.rn;
                        if (ar > 0) { ctx.beginPath(); ctx.arc(e.x, e.y, ar, 0, Math.PI * 2); ctx.stroke(); }
                    }
                }
            }

            // Gameplay UI
            if (this.state === State.PLAY || this.state === State.CNT) {
                // HUD backdrop panel behind the elixir bar + card tray
                ctx.fillStyle = "rgba(18,26,22,0.82)";
                this.drawRoundRect(-12, H - 138, W + 24, 150, 16, true, false);

                // Elixir bar (rounded, gradient, pip ticks)
                const ebX = 10, ebY = H - 130, ebW = W - 20, ebH = 22;
                ctx.fillStyle = "#2a1430";
                this.drawRoundRect(ebX, ebY, ebW, ebH, 11, true, false);
                let elxPct = Math.max(0, Math.min(1, this.eng.p1.elx / 10.0));
                if (elxPct > 0.001) {
                    const eg = ctx.createLinearGradient(ebX, 0, ebX + ebW, 0);
                    eg.addColorStop(0, "#ff5ad6");
                    eg.addColorStop(1, "#b400b4");
                    ctx.fillStyle = eg;
                    this.drawRoundRect(ebX, ebY, ebW * elxPct, ebH, 11, true, false);
                }
                ctx.strokeStyle = "rgba(0,0,0,0.35)";
                ctx.lineWidth = 1;
                for (let i = 1; i < 10; i++) {
                    let px = ebX + i * (ebW / 10);
                    ctx.beginPath(); ctx.moveTo(px, ebY + 3); ctx.lineTo(px, ebY + ebH - 3); ctx.stroke();
                }
                this.drawCenteredString(`${Math.floor(this.eng.p1.elx)}`, W / 2, ebY + ebH - 6, "bold 15px Arial", "white");

                // Debug Opponent Elixir
                if (this.eng.debugEnemyElixir) {
                    ctx.fillStyle = "red";
                    ctx.font = "bold 20px Arial";
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

                        // DISABLED POP UP ON SELECTION
                        // let paintY = r.y - (isSel ? 30 : 0) - hoverOff;
                        // Only hover effect, no selection offset
                        let paintY = r.y - hoverOff;

                        ctx.fillStyle = canAfford ? "#fff" : "#888"; // Gray if can't afford
                        if (isSel) ctx.fillStyle = "#32CD32"; // Green if selected

                        this.drawRoundRect(r.x, paintY, r.w, r.h, 5, true, true);
                        // Image/Text
                        this.drawCenteredString(c.n, r.x + r.w / 2, paintY + r.h / 2, "bold 10px Arial", "black");
                        // MOVED ELIXIR COST INWARD
                        this.drawElixirCost(r.x + 15, paintY + 15, c.c);
                    }
                }

                // Next Card
                if (this.eng.p1.pile.length > 0) {
                    let nextC = this.eng.p1.pile[0];
                    let nr = this.nextCardRect;
                    ctx.fillStyle = "#ccc";
                    this.drawRoundRect(nr.x, nr.y, nr.w, nr.h, 5, true, true);
                    this.drawCenteredString("Next:", nr.x + nr.w / 2, nr.y + 15, "10px Arial", "black");
                    this.drawCenteredString(nextC.n, nr.x + nr.w / 2, nr.y + nr.h / 2, "bold 9px Arial", "black");
                    // MOVED ELIXIR COST INWARD
                }

                // Timer / Messages
                if (this.state === State.CNT) {
                    // COUNTDOWN OVERLAY
                    let elapsed = Date.now() - this.t0;
                    let count = 3 - Math.floor(elapsed / 1000);
                    if (count > 0) {
                        ctx.fillStyle = "rgba(0,0,0,0.5)";
                        ctx.fillRect(0, 0, W, H);
                        this.drawCenteredString(count.toString(), W / 2, H / 2, "bold 100px Arial", "white");
                    }
                } else {
                    let time = (Date.now() - this.eng.gameStart) / 1000;
                    let remaining = 180 - time;
                    if (remaining < 0) remaining = 0; // Overtime handled by state
                    if (this.eng.tiebreaker) {
                        this.drawCenteredString("TIEBREAKER!", W / 2, H / 2, "bold 40px Arial", "red");
                    }

                    if (this.eng.doubleElixirAnim > 0) {
                        ctx.globalAlpha = this.eng.doubleElixirAnim / 100;
                        this.drawCenteredString("2x ELIXIR", W / 2, H / 2, "bold 50px Arial", "magenta");
                        ctx.globalAlpha = 1.0;
                    }

                    let mins = Math.floor(remaining / 60);
                    let secs = Math.floor(remaining % 60);
                    let timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                    ctx.fillStyle = (remaining <= 10 && remaining % 1 > 0.5) ? "red" : "black"; // Blink effect
                    if (this.eng.tiebreaker) ctx.fillStyle = "red";
                    ctx.font = "bold 20px Arial";
                    ctx.fillText(timeStr, W - 40, 30);
                }
            }


        } // End PLAY|CNT block

        if (this.state === State.OVER) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(0, 0, W, H);
            let msg = this.eng.win === 0 ? "You Win!" : "You Lose!";
            let color = this.eng.win === 0 ? "#32CD32" : "#FF6347";
            this.drawCenteredString(msg, W / 2, H / 2 - 50, "bold 50px Arial", color);
            this.drawBtn(this.exitBtn, "EXIT", "#FFA500");
        }
    } // End render()

    drawEntityBody(e) {

        let x = e.x;
        let y = e.y;
        // Sprite is drawn smaller than the collision/hitbox radius so units keep
        // a gap instead of clipping into each other and the towers.
        let radius = e.rad * 0.82;

        // Flying units float above their ground shadow (drawn in the shadow pass).
        if (e.fly) {
            y -= 22;
            radius *= 1.1;
        }

        // Jump offset (kept low — just enough to hop the river)
        if (e instanceof Troop && e.jp) {
            let jumpHeight = 0;
            if (e.jt) {
                let progress = 1.0 - (e.dist(e.jt) / (e.jd || 1));
                jumpHeight = 22.0 * Math.sin(progress * Math.PI);
            }
            y -= jumpHeight;
        }

        // Electric Aura (Blue, Flickering)
        let name = e.c ? e.c.n : "";
        if (name === "Sparky" || name === "Zappies") {
            let threshold = (name === "Zappies") ? 72 : 180;
            let isCharging = (e.chargeT > 0 && e.chargeT < threshold);
            let isReady = (e.chargeT >= threshold);

            if (isCharging) {
                // Flicker while charging
                let flick = (Math.floor(Date.now() / 50) % 2 === 0);
                if (flick) {
                    ctx.strokeStyle = "cyan";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.lineWidth = 1;
                }
            } else if (isReady) {
                // Solid ring when ready? User said "stop flickering".
                // Detailed interpretation: "when it is done charging, it should stop flickering."
                // I will leave it as NO aura when ready, or maybe a solid one.
                // Let's go with SOLID to indicate readiness.
                ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 1;
            }
        }

        let isFriend = (e.tm === 0);
        // Each unit keeps its own identity color; friend vs foe is shown ONLY by
        // the health-bar color drawn below. Crown towers stay team-colored.
        let color;
        if (e instanceof Tower) {
            color = isFriend ? "#4aa3ff" : "#ff5a5a";
        } else {
            color = this.getUnitColor(name);
            if (e.isClone) color = "rgba(185, 240, 255, 0.9)";
        }

        // Freeze/Slow status tints temporarily override the identity color.
        if (e instanceof Troop) {
            if (e.fr > 0) color = "#bfe8ff";
            else if (e.sl > 0) color = "#9ad2f5";
        }

        ctx.fillStyle = color;
        ctx.strokeStyle = "black"; // RESET STROKE STYLE
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (e instanceof Tower) {
            // ROUNDED TOWER
            let r = radius;
            this.drawRoundRect(x - r, y - r, r * 2, r * 2, 8, true, true);
            // Cannon turret (no barrel) sitting on top of the tower.
            ctx.fillStyle = "#4a4e55";
            ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.55)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = "#26282c";
            ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, Math.PI * 2); ctx.fill(); // muzzle
            ctx.lineWidth = 1;
        } else if (e instanceof Building) {
            ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }


        // Health bar — its COLOR is the only friend/foe indicator
        // (blue = yours, red = enemy). Always shown for units so the team is
        // readable even at full HP; towers show it only when damaged.
        let teamCol = isFriend ? "#2f8bff" : "#ff4d4d";
        let barW = (e instanceof Tower) ? 42 : Math.max(24, radius * 1.9);
        let barY = y - radius - 9;

        if (e.shield > 0) {
            let shPct = Math.max(0, e.shield / e.maxShield);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(x - barW / 2 - 1, barY - 6, barW + 2, 5);
            ctx.fillStyle = "#d9b3ff";
            ctx.fillRect(x - barW / 2, barY - 5, barW * shPct, 3);
        }
        if (!(e instanceof Tower) || e.hp < e.mhp) {
            let hpPct = Math.max(0, e.hp / e.mhp);
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillRect(x - barW / 2 - 1, barY - 1, barW + 2, 6);
            ctx.fillStyle = teamCol;
            ctx.fillRect(x - barW / 2, barY, barW * hpPct, 4);
        }

        // Unit name
        if (name && name.length > 0) {
            let fontSize = Math.max(9, Math.min(13, 8 + radius * 0.4));
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 2;
            ctx.fillText(name, x, barY - (e.shield > 0 ? 9 : 4));
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
            "Musketeer": "#7c8fc7", "Mega Knight": "#6b5b8a", "P.E.K.K.A": "#4b4f86",
            "Barbarians": "#d8a24e", "Fire Spirit": "#ff7a3c", "Ice Spirit": "#9ddcef",
            "Electro Spirit": "#ffe14d", "Heal Spirit": "#76d98a", "Minions": "#356b6b",
            "Goblins": "#79b44a", "Spear Goblins": "#8cc04f", "Bats": "#6a4a78",
            "Wizard": "#ff7043", "Witch": "#8e4fb0", "Mega Minion": "#2f4f6e",
            "Minion Horde": "#356b6b", "Baby Dragon": "#79c267", "Inferno Dragon": "#ff5a2c",
            "Golem": "#8a6a4a", "Lava Hound": "#cf5a3c", "Elixir Golem": "#d56ab5",
            "Elite Barbarians": "#e0934a", "Zappies": "#ffd24d", "Sparky": "#ffb13c",
            "Wall Breakers": "#b5733a", "Royal Giant": "#e6b15a", "Electro Giant": "#46b6c4",
            "Bowler": "#7456b0", "Hog Rider": "#b07a45", "Royal Hogs": "#e89ab5",
            "Prince": "#f1c64a", "Mother Witch": "#7a3f9c", "Royal Recruits": "#b9a06a",
            "Dark Prince": "#4a3f5a", "Ice Golem": "#a9dcef", "Cannon": "#6b7079",
            "Inferno Tower": "#b5563a", "Elixir Collector": "#c46fb0", "Crate": "#9c7b4a",
            "Golemite": "#8a6a4a", "Lava Pup": "#ff8a4c", "Elixir Golemite": "#d56ab5",
            "Elixir Blob": "#d56ab5", "Cursed Hog": "#8e4fb0"
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

    paintBg(c1, c2) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    // Rich green gradient + soft vignette for menus.
    menuBg() {
        this.paintBg("#3a9d63", "#155f39");
        const r = ctx.createRadialGradient(W / 2, H * 0.33, 60, W / 2, H * 0.45, H * 0.75);
        r.addColorStop(0, "rgba(255,255,255,0.08)");
        r.addColorStop(1, "rgba(0,0,0,0.28)");
        ctx.fillStyle = r;
        ctx.fillRect(0, 0, W, H);
    }

    // Mowed-grass arena background.
    arenaGrass() {
        this.paintBg("#69bf64", "#54a554");
        ctx.fillStyle = "rgba(0,0,0,0.045)";
        for (let gy = 0; gy < H; gy += 64) ctx.fillRect(0, gy, W, 32);
        // faintly darken the enemy (top) half for orientation
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, W, RIV_Y - 15);
    }

    // Troops/buildings deploy on a 30px tile grid (like the real game).
    snapToGrid(x, y) {
        const T = 30;
        return { x: Math.floor(x / T) * T + T / 2, y: Math.floor(y / T) * T + T / 2 };
    }

    elixirColor(c) {
        if (c <= 2) return "#3a8f5a";
        if (c <= 4) return "#3a6f9f";
        if (c <= 6) return "#6a4a9f";
        return "#9f3a6a";
    }

    // A deck-builder card tile: elixir-tinted body, unit-color swatch, name,
    // elixir badge, and a gold ring + check when it's in the deck.
    drawDeckCard(cx, cy, w, h, c, selected) {
        ctx.fillStyle = this.elixirColor(c.c); // solid colour, no gradient
        this.drawRoundRect(cx, cy, w, h, 10, true, false);

        ctx.fillStyle = this.getUnitColor(c.n);
        this.drawRoundRect(cx + 5, cy + 5, w - 10, 13, 5, true, false);

        this.drawCenteredString(c.n, cx + w / 2, cy + h / 2 + 13, "bold 11px Arial", "white");
        this.drawElixirCost(cx + 12, cy + 13, c.c);

        if (selected) {
            ctx.strokeStyle = "#ffd24d"; ctx.lineWidth = 3;
            this.drawRoundRect(cx, cy, w, h, 10, false, false); ctx.stroke();
            ctx.fillStyle = "#2ecc71";
            ctx.beginPath(); ctx.arc(cx + w - 13, cy + 13, 9, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "white"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx + w - 17, cy + 13); ctx.lineTo(cx + w - 14, cy + 16); ctx.lineTo(cx + w - 9, cy + 9); ctx.stroke();
            ctx.lineWidth = 1;
        } else {
            ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.lineWidth = 1;
            this.drawRoundRect(cx, cy, w, h, 10, false, false); ctx.stroke();
        }
    }

    // Faint placement grid over the deployable region + the hovered cell tinted
    // green (valid) or red (invalid).
    drawPlacementGrid(sel) {
        const T = 30;
        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.lineWidth = 1;
        for (let gx = T; gx < W; gx += T) { ctx.beginPath(); ctx.moveTo(gx, 200); ctx.lineTo(gx, H - 130); ctx.stroke(); }
        for (let gy = 200; gy < H - 130; gy += T) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

        if (this.mouse.y < H - 130) {
            let cx = Math.floor(this.mouse.x / T) * T, cy = Math.floor(this.mouse.y / T) * T;
            let s = this.snapToGrid(this.mouse.x, this.mouse.y);
            let valid = this.eng.isValid(s.y, s.x, sel, 0);
            ctx.fillStyle = valid ? "rgba(80,220,120,0.35)" : "rgba(220,60,60,0.35)";
            ctx.fillRect(cx, cy, T, T);
            ctx.strokeStyle = valid ? "#4aff8a" : "#ff5a5a";
            ctx.lineWidth = 2;
            ctx.strokeRect(cx, cy, T, T);
            ctx.lineWidth = 1;
        }
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

        // Drop shadow + vertical gradient body
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        const g = ctx.createLinearGradient(0, drawRect.y, 0, drawRect.y + drawRect.h);
        g.addColorStop(0, this.shade(color, 0.16));
        g.addColorStop(1, this.shade(color, -0.12));
        ctx.fillStyle = g;
        this.drawRoundRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h, 12, true, false);
        ctx.restore();

        // Glossy top highlight
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        this.drawRoundRect(drawRect.x + 3, drawRect.y + 3, drawRect.w - 6, drawRect.h * 0.42, 8, true, false);

        // Label
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.45)";
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
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#c800c8";
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(val, x, y);
        ctx.textBaseline = "alphabetic";
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

    drawProj(p) {
        if (p.isArrows) { this.drawArrowsVolley(p); return; }
        if (p.isSpellArc) { this.drawSpellArc(p); return; }

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
            ctx.fillStyle = "#caa06a";
            ctx.beginPath(); ctx.ellipse(-w / 2 + 3, 0, 3, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(w / 2 - 3, 0, 3, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fill();
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

        // Ground shadow at the projectile's ground position; shrinks while high.
        let sr = Math.max(5, p.rad * 0.34) * (1 - 0.35 * Math.sin(prog * Math.PI));
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(p.x, p.y, sr, sr * 0.45, 0, 0, Math.PI * 2); ctx.fill();

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
            ctx.fillStyle = "#7c4a22";
            this.drawRoundRect(-9, -11, 18, 22, 5, true, false);
            ctx.strokeStyle = "#4f3016"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(9, -3); ctx.moveTo(-9, 4); ctx.lineTo(9, 4); ctx.stroke();
            ctx.lineWidth = 1;
        } else if (k === "snowball") {
            ctx.fillStyle = "#dff1ff"; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#9cc6e8"; ctx.lineWidth = 1.5; ctx.stroke();
        } else if (k === "rocket") {
            ctx.fillStyle = "#d23b3b"; ctx.fillRect(-4, -10, 8, 16);
            ctx.fillStyle = "#bbb"; ctx.beginPath(); ctx.moveTo(-4, -10); ctx.lineTo(0, -18); ctx.lineTo(4, -10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "#ffb13c"; ctx.beginPath(); ctx.arc(0, 9, 4, 0, Math.PI * 2); ctx.fill();
        } else {
            // fireball
            ctx.fillStyle = "rgba(255,120,30,0.55)"; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ff7a1e"; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffd24d"; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawArrowsVolley(p) {
        // Three staggered waves of arrows that spread out horizontally, fall in
        // tilted, and straighten as they land (asArrows starts life at 36).
        const maxLife = 36;
        const t = Math.max(0, Math.min(1.3, 1 - p.life / maxLife));
        const waves = 3, perWave = 6;
        for (let wv = 0; wv < waves; wv++) {
            let wt = (t - wv * 0.16) / 0.6;          // each wave staggered, lasts ~0.6
            if (wt < 0 || wt > 1.25) continue;
            let fall = Math.max(0, 1 - wt) * 80;     // drop from above
            ctx.globalAlpha = wt > 1 ? Math.max(0, 1.25 - wt) : 1;
            for (let i = 0; i < perWave; i++) {
                let spread = (i / (perWave - 1) - 0.5);            // -0.5..0.5
                let ax = p.x + spread * p.rad * 1.7;
                let ay = p.y + (wv - 1) * 10;
                let tilt = (1 - Math.min(1, wt)) * spread * 1.3;   // tilted, then straight on landing
                ctx.save();
                ctx.translate(ax, ay - fall);
                ctx.rotate(tilt);
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
}

new Main();