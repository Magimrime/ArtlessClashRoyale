import Player from './Player.js';
import Card from '../models/Card.js';
import Entity from '../entities/Entity.js';
import Troop from '../entities/Troop.js';
import Building from '../entities/Building.js';
import Tower from '../entities/Tower.js';
import Proj from '../entities/Proj.js';
import EnemyAI from '../ai/EnemyAI.js';

export default class GameEngine {
    constructor() {
        this.W = 540;
        this.H = 960;
        this.RIV_Y = 405;

        this.seed = 12345; // Default seed
        this.nextEntityId = 1;

        this.allCards = [];
        this.unlockedCards = [];
        this.myDeck = [];
        this.enemyDeckSelection = [];

        // Evolutions: which cards CAN evolve and how many normal plays charge the
        // evo. evoSel / enemyEvoSel hold the (≤2) card names chosen as evos per deck.
        this.EVO_REQ = { "Barbarians": 1, "Archers": 2, "Inferno Dragon": 2, "Royal Recruits": 1 };
        this.evoSel = [];
        this.enemyEvoSel = [];

        this.ents = [];
        this.projs = [];
        this.deploys = []; // deploy-time clock indicators (one per card played)

        this.p1 = new Player(0);
        this.p2 = new Player(1);

        this.aiTick = 0;
        this.gameStart = 0;
        this.over = false;
        this.win = 0;

        // Multiplayer Stats
        this.isMultiplayer = false;
        this.serverParams = null; // If client, stores server config

        // SNAPSHOT INTERPOLATION
        // Deterministic Lockstep doesn't need state buffering

        this.doubleElixirAnim = 0;
        this.sel = null;
        // Sandbox mode: free placement, no elixir/AI/game-over. sandboxNoRiver removes
        // the river+bridge crossing (the "Open" map).
        this.sandbox = false;
        this.sandboxMap = 'default';
        this.sandboxNoRiver = false;
        this.cheated = false;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.enemyDeckSelection = [];
        this.debugView = false;
        this.debugEnemyElixir = false;

        // Real Clash Royale stats at Tournament Standard (Level 11), sourced from
        // RoyaleAPI cr-api-data per-level tables. Engine units:
        //   hp / d = real Level 11 hitpoints & per-hit damage
        //   s      = px/tick (tiles-per-min / 120: Slow .375, Med .5, Fast .75, VFast 1)
        //   rn     = px gap (tiles * 30, minus a hitbox allowance)
        //   rt     = reload in ticks (hit-speed seconds * 60)
        //   m      = building lifetime in ticks (unused for troops); si = sight px
        // Spells/Goblin Barrel/Graveyard/Mirror/Clone/Crate/Vines keep d as their
        // effect value (Crate and Vines have no real counterpart).
        this.allCards = [
            new Card("Knight", 3, 1766, 202, 0.5, 14, 0, 100, 72, 150, false, false),
            new Card("Archers", 3, 304, 87, 0.5, 128, 0, 100, 54, 150, false, true),
            new Card("Giant", 5, 4091, 254, 0.375, 14, 1, 100, 90, 150, false, false),
            new Card("Fireball", 4, 0, 689, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Rocket", 6, 0, 1484, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Mini PEKKA", 4, 1361, 720, 0.75, 8, 0, 100, 96, 150, false, false),
            new Card("Zap", 2, 0, 192, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Skeletons", 1, 81, 81, 0.75, 8, 0, 100, 60, 150, false, false),
            new Card("Musketeer", 4, 720, 218, 0.5, 158, 0, 100, 60, 150, false, true),
            new Card("Cannon", 3, 824, 212, 0, 143, 3, 1800, 54, 165, false, false),
            new Card("Mega Knight", 7, 3993, 268, 0.5, 14, 0, 100, 102, 150, false, false),
            new Card("P.E.K.K.A", 7, 3760, 816, 0.375, 14, 0, 100, 108, 150, false, false),
            new Card("Skeleton Army", 3, 81, 81, 0.75, 8, 0, 100, 60, 150, false, false),
            new Card("Barbarians", 5, 715, 192, 0.5, 8, 0, 100, 78, 150, false, false),
            new Card("Goblin Barrel", 3, 0, 0, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Royale Delivery", 3, 0, 250, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Vines", 2, 0, 44, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Freeze", 4, 0, 115, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Fire Spirit", 1, 230, 207, 1, 38, 0, 100, 18, 150, false, true),
            new Card("Ice Spirit", 1, 230, 110, 1, 53, 0, 100, 18, 150, false, true),
            new Card("Electro Spirit", 1, 230, 99, 1, 53, 0, 100, 18, 150, false, true),
            new Card("Heal Spirit", 1, 231, 110, 1, 53, 0, 100, 18, 150, false, true),
            new Card("Arrows", 3, 0, 122, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Minions", 3, 230, 117, 0.75, 26, 0, 100, 60, 150, true, true),
            new Card("Goblins", 2, 202, 120, 0.75, 8, 0, 100, 66, 150, false, false),
            new Card("Spear Goblins", 2, 133, 81, 0.75, 143, 0, 100, 102, 150, false, true),
            new Card("Bats", 2, 81, 81, 1, 14, 0, 100, 78, 150, true, true),
            new Card("Poison", 4, 0, 70, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Wizard", 5, 720, 281, 0.5, 143, 0, 100, 84, 150, false, true),
            new Card("Witch", 5, 838, 134, 0.5, 143, 0, 100, 66, 150, false, true),
            new Card("Graveyard", 5, 0, 0, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Mega Minion", 3, 837, 311, 0.5, 48, 0, 100, 90, 150, true, true),
            new Card("Minion Horde", 5, 230, 117, 0.75, 26, 0, 100, 60, 150, true, true),
            new Card("Baby Dragon", 4, 1152, 160, 0.75, 83, 0, 100, 90, 150, true, true),
            new Card("Inferno Dragon", 4, 1294, 10, 0.5, 83, 0, 100, 24, 150, true, true),
            new Card("Inferno Tower", 5, 1749, 10, 0, 158, 3, 1800, 24, 180, false, true),
            new Card("Golem", 8, 5120, 312, 0.375, 8, 1, 100, 150, 150, false, false),
            new Card("Lava Hound", 7, 3811, 54, 0.375, 83, 1, 100, 78, 150, true, false),
            new Card("Elixir Golem", 3, 1568, 254, 0.375, 8, 1, 100, 66, 150, false, false),
            new Card("Elite Barbarians", 6, 1341, 384, 0.75, 14, 0, 100, 84, 150, false, false),
            new Card("Elixir Collector", 6, 1070, 0, 0, 8, 3, 3900, 0, 0, false, false),
            new Card("Zappies", 4, 530, 116, 0.5, 113, 0, 100, 126, 150, false, true),
            new Card("Sparky", 6, 1452, 1331, 0.375, 128, 0, 100, 240, 150, false, false),
            new Card("Mirror", 1, 0, 0, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Clone", 3, 0, 0, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Wall Breakers", 2, 331, 392, 1, 8, 1, 100, 72, 150, false, false),
            new Card("Royal Giant", 6, 3072, 307, 0.375, 128, 1, 100, 102, 150, false, false),
            new Card("Electro Giant", 7, 3856, 163, 0.375, 14, 1, 100, 126, 150, false, false),
            new Card("Bowler", 5, 2080, 288, 0.375, 98, 0, 100, 150, 150, false, false),
            new Card("Hog Rider", 4, 1696, 318, 0.75, 8, 1, 100, 96, 150, false, false),
            new Card("Royal Hogs", 5, 837, 74, 0.75, 8, 1, 100, 72, 150, false, false),
            new Card("Prince", 5, 1920, 392, 0.5, 26, 0, 100, 84, 150, false, false),
            new Card("Mother Witch", 4, 532, 133, 0.5, 143, 0, 100, 60, 150, false, true),
            new Card("The Log", 2, 0, 290, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Barbarian Barrel", 2, 0, 241, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Royal Recruits", 7, 532, 133, 0.5, 26, 0, 100, 78, 150, false, false),
            new Card("Dark Prince", 4, 1200, 248, 0.5, 14, 0, 100, 78, 150, false, false),
            new Card("Crate", 2, 300, 0, 0, 0, 3, 1800, 0, 0, false, false),
            new Card("Ice Golem", 2, 1197, 84, 0.375, 8, 1, 100, 150, 150, false, false)
        ];

        // Role tags drive the enemy AI's counter logic. (Stats above are already
        // real Level 11 values, so no scaling is applied.)
        this.allCards.forEach(c => { c.tags = this.getCardTags(c); });

        this.tokens = [
            new Card("Golemite", 0, 1040, 49, 0.375, 8, 0, 100, 150, 150, false, false),
            new Card("Lava Pup", 0, 216, 90, 0.5, 26, 0, 100, 102, 150, true, true),
            new Card("Elixir Golemite", 0, 763, 127, 0.5, 8, 0, 100, 66, 150, false, false),
            new Card("Elixir Blob", 0, 360, 63, 0.75, 8, 0, 100, 66, 150, false, false),
            new Card("Cursed Hog", 0, 520, 84, 1, 8, 1, 100, 72, 150, false, false)
        ];

        this.tokens.forEach(c => { c.tags = this.getCardTags(c); });

        this.enemyAI = null;
        this.isMultiplayer = false;
    }

    // Assigns role tags used by EnemyAI to pick counters and build pushes.
    getCardTags(c) {
        const n = c.n;
        const tags = [];
        const has = (arr) => arr.includes(n);

        // Win conditions: cards whose job is to deal tower damage.
        if (has(["Giant", "Golem", "Royal Giant", "Electro Giant", "Hog Rider",
            "Royal Hogs", "Lava Hound", "Elixir Golem", "Wall Breakers",
            "Goblin Barrel", "Graveyard"]))
            tags.push("WinCon");

        // Tanks: high-HP units meant to soak damage up front.
        if (has(["Giant", "Golem", "Royal Giant", "Electro Giant", "Mega Knight",
            "P.E.K.K.A", "Lava Hound", "Elixir Golem", "Ice Golem", "Knight",
            "Royal Recruits"]))
            tags.push("Tank");

        // Swarms: groups of cheap units, weak to area damage.
        if (has(["Skeletons", "Skeleton Army", "Goblins", "Spear Goblins",
            "Minions", "Minion Horde", "Bats", "Barbarians"]))
            tags.push("Swarm");

        // Area damage: splash attackers, strong against swarms.
        if (has(["Wizard", "Witch", "Baby Dragon", "Bowler", "Mega Knight",
            "Dark Prince", "Mother Witch"]))
            tags.push("AOE");

        // High single-target DPS: melts tanks and win conditions.
        if (has(["Mini PEKKA", "P.E.K.K.A", "Musketeer", "Inferno Dragon",
            "Sparky", "Prince", "Elite Barbarians", "Mega Minion", "Wizard"]))
            tags.push("DamageDealer");

        // Direct-damage / effect spells the AI can throw at a threat.
        if (has(["Fireball", "Zap", "Arrows", "Poison", "Freeze", "Vines",
            "The Log", "Barbarian Barrel", "Royale Delivery"]))
            tags.push("Spell");

        // Defensive buildings.
        if (c.t === 3) tags.push("Building");

        return tags;
    }

    // Sandbox: a free-play arena with no opponent, elixir, or win condition. Maps
    // (every map has the two king towers):
    //   'default' — river + bridges + kings
    //   'tower'   — river + bridges + kings + princess towers
    //   'open'    — no river / bridges, kings only
    //   'heist'   — river + bridges + kings that have NO turret (can't shoot)
    setupSandbox(map) {
        this.sandbox = true;
        this.sandboxMap = map || 'default';
        this.sandboxNoRiver = (this.sandboxMap === 'open');
        this.p1 = new Player(0);
        this.p2 = new Player(1);
        this.ents = [];
        this.projs = [];
        this.deploys = [];
        this.sel = null;
        this.over = false;
        this.tiebreaker = false;
        this.isDoubleElixir = false;
        this.aiTick = 0;
        this.gameStart = Date.now();
        this.nextEntityId = 1;
        this.enemyAI = null;
        this.t1L = this.t1R = this.t2L = this.t2R = null;
        this.t1K = new Tower(0, this.W / 2, 735, true); this.ents.push(this.t1K);
        this.t2K = new Tower(1, this.W / 2, 75, true); this.ents.push(this.t2K);
        // Kings are awake from the start (no activation rules in sandbox)…
        this.t1K.actv = true; this.t2K.actv = true;
        if (this.sandboxMap === 'heist') {
            // …except Heist: bare kings with no turret — they can't shoot at all.
            this.t1K.noTurret = true; this.t2K.noTurret = true;
            this.t1K.actv = false; this.t2K.actv = false;
        }
        if (this.sandboxMap === 'tower') {
            this.t1L = new Tower(0, this.W / 4, 645, false); this.ents.push(this.t1L);
            this.t1R = new Tower(0, this.W * 3 / 4, 645, false); this.ents.push(this.t1R);
            this.t2L = new Tower(1, this.W / 4, 165, false); this.ents.push(this.t2L);
            this.t2R = new Tower(1, this.W * 3 / 4, 165, false); this.ents.push(this.t2R);
        }
    }

    // Sandbox placement: free, no elixir / validity rules. The SIDE you drop on
    // decides the team — bottom half spawns blue (team 0), top half red (team 1).
    sandboxPlace(c, x, y) {
        if (!this.sandbox || !c) return false;
        if (!this.isValid(y, x, c, 0)) return false;
        let tm = (y < this.RIV_Y) ? 1 : 0;
        this.addU(tm, c, x, y);
        return true;
    }

    isEvoCapable(name) { return Object.prototype.hasOwnProperty.call(this.EVO_REQ, name); }

    // Build the EVOLVED version of a card: a copy of the card with buffed stats and
    // an isEvo flag (special behaviours like the Royal Recruits dash and the Inferno
    // Dragon ramp read this.c.isEvo in Troop). The base card is never mutated.
    makeEvoCard(c) {
        let e = Object.assign(Object.create(Object.getPrototypeOf(c)), c);
        e.isEvo = true;
        switch (c.n) {
            case "Barbarians":     // +5% dmg, +20% hit speed, +3% hp, +10% speed
                e.d = Math.round(c.d * 1.05); e.rt = Math.max(1, Math.round(c.rt * 0.8));
                e.hp = Math.round(c.hp * 1.03); e.s = c.s * 1.1; break;
            case "Archers":        // +~10% range (was +20%, nerfed 8%), +15% dmg, +8% fire speed
                e.rn = Math.round(c.rn * 1.104); e.d = Math.round(c.d * 1.15); e.rt = Math.max(1, Math.round(c.rt * 0.92)); break;
            case "Inferno Dragon": // base dmg 30, +15% charge & +10% attack speed (charge divisor handled in Troop)
                e.d = 30; e.rt = Math.max(1, Math.round(c.rt * 0.9)); break;
            case "Royal Recruits": // +10% hp, gains a dash (handled in Troop)
                e.hp = Math.round(c.hp * 1.1); break;
        }
        return e;
    }

    setMultiplayer(enabled) {
        this.isMultiplayer = enabled;
    }

    setSeed(s) {
        this.seed = s;
    }

    random() {
        // Mulberry32
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }


    spawnRemote(cardName, x, y, team) {
        // Transform coordinates for local view
        // Incoming (x, y) is from opponent's perspective (they are bottom 0..800 relative)
        let rx = this.W - x;
        let ry = 800 - y;

        // Validation for Player 2 (Remote)
        let p = (team === 1) ? this.p2 : this.p1; // Usually team is 1 for opponent

        // Find card in hand
        let card = p.h.find(c => c.n === cardName);
        if (!card) {
            card = this.getCard(cardName);
        }

        if (card) {
            // Placement Validation
            // ry, rx is correct for isValid(y, x, ...)?
            // isValid(y, x, c, tm)
            if (!this.isValid(ry, rx, card, team)) {
                console.warn("Invalid Remote Placement rejected");
                return;
            }

            // Check Elixir
            if (p.elx >= card.c) {
                p.elx -= card.c;
                this.addU(team, card, rx, ry);

                // Cycle Card
                let idx = p.h.indexOf(card);
                if (idx > -1) {
                    p.h.splice(idx, 1);
                    p.pile.push(card);
                    p.h.push(p.pile.shift());
                }
            }
        }
    }

    giveElixir(teamToGive, amount) {
        if (teamToGive === 0) this.p1.elx = Math.min(10, this.p1.elx + amount);
        else this.p2.elx = Math.min(10, this.p2.elx + amount);
    }

    initCollection() {
        this.cheated = false;
        this.unlockedCards = [];
        this.myDeck = [];
        let pool = [...this.allCards];
        // Shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        for (let i = 0; i < Math.min(9, pool.length); i++)
            this.unlockedCards.push(pool[i]);
        for (let i = 0; i < Math.min(8, this.unlockedCards.length); i++)
            this.myDeck.push(this.unlockedCards[i]);
    }

    unlockRandomCard() {
        let locked = this.allCards.filter(c => !this.unlockedCards.includes(c));
        if (locked.length === 0) return null;
        let c = locked[Math.floor(Math.random() * locked.length)];
        this.unlockedCards.push(c);
        this.saveProgress();
        return c;
    }

    unlockAllCards() {
        this.unlockedCards = [...this.allCards];
        this.saveProgress();
    }

    saveProgress() {
        let data = {
            gamesWon: this.gamesWon,
            gamesPlayed: this.gamesPlayed,
            cheated: this.cheated,
            cheatPressed: this.cheatPressed,
            myDeck: this.myDeck.map(c => c.n),
            debugView: this.debugView,
            debugEnemyElixir: this.debugEnemyElixir,
            enemyDeckSelection: this.enemyDeckSelection.map(c => c.n),
            unlockedCards: this.unlockedCards.map(c => c.n),
            evoSel: this.evoSel,
            enemyEvoSel: this.enemyEvoSel
        };
        const json = JSON.stringify(data, null, 4);
        localStorage.setItem('clash_royale_save', json);

        // Sync to bin/save.json via server
        fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json
        }).catch(err => console.warn("Failed to sync save to server:", err));
    }

    loadProgress() {
        // Try to load from server first, then fallback to local storage
        fetch('/api/load')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("No server save");
            })
            .then(data => {
                this.applySaveData(data);
            })
            .catch(() => {
                // Fallback to localStorage
                let json = localStorage.getItem('clash_royale_save');
                if (json) {
                    try {
                        this.applySaveData(JSON.parse(json));
                    } catch (e) {
                        console.error("Failed to load local save", e);
                    }
                }
            });
    }

    applySaveData(data) {
        this.gamesWon = data.gamesWon || 0;
        this.gamesPlayed = data.gamesPlayed || 0;
        this.cheated = data.cheated || false;
        this.cheatPressed = data.cheatPressed || false; // New field
        this.debugView = data.debugView || false;
        this.debugEnemyElixir = data.debugEnemyElixir || false;

        this.myDeck = [];
        if (data.myDeck) {
            data.myDeck.forEach(n => {
                let c = this.getCard(n);
                if (c) this.myDeck.push(c);
            });
        }

        this.enemyDeckSelection = [];
        if (data.enemyDeckSelection) {
            data.enemyDeckSelection.forEach(n => {
                let c = this.getCard(n);
                if (c) this.enemyDeckSelection.push(c);
            });
        }

        // Evolution selections (only keep ones that are actually evo-capable, ≤2).
        this.evoSel = (data.evoSel || []).filter(n => this.isEvoCapable(n)).slice(0, 2);
        this.enemyEvoSel = (data.enemyEvoSel || []).filter(n => this.isEvoCapable(n)).slice(0, 2);

        this.unlockedCards = [];
        if (data.unlockedCards) {
            data.unlockedCards.forEach(n => {
                let c = this.getCard(n);
                if (c && !this.unlockedCards.includes(c)) this.unlockedCards.push(c);
            });
        }

        // Sanity check
        this.myDeck.forEach(c => {
            if (!this.unlockedCards.includes(c)) this.unlockedCards.push(c);
        });
    }

    deleteProgress() {
        localStorage.removeItem('clash_royale_save');
        fetch('/api/delete', { method: 'POST' }).catch(err => console.warn("Failed to delete server save:", err));
    }

    hasSaveFile() {
        return localStorage.getItem('clash_royale_save') !== null; // Visual check uses local, async load handles server
    }

    reset(enemyDeck) {
        // Singleplayer: pick a fresh random seed each game so the opening hand
        // order varies. Multiplayer keeps the host-supplied seed (set before
        // reset) so both clients stay in lockstep.
        if (!this.isMultiplayer) this.seed = (Math.random() * 2147483647) >>> 0;

        this.p1 = new Player(0);
        this.p2 = new Player(1);
        this.ents = [];
        this.projs = [];
        this.deploys = [];
        this.sel = null;
        this.over = false;
        this.aiTick = 0;
        this.gameStart = Date.now();
        this.isDoubleElixir = false;
        this.tiebreaker = false;
        this.doubleElixirAnim = 0;
        this.nextEntityId = 1;

        this.p1.pile = [...this.myDeck];
        // Shuffle p1 pile
        for (let i = this.p1.pile.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [this.p1.pile[i], this.p1.pile[j]] = [this.p1.pile[j], this.p1.pile[i]];
        }
        this.p1.h = [];
        for (let i = 0; i < 4; i++) this.p1.h.push(this.p1.pile.shift());
        // Player's chosen evolutions (≤2), each starting uncharged.
        this.p1.evos = new Set((this.evoSel || []).slice(0, 2));

        this.enemyAI = new EnemyAI(this);

        if (enemyDeck && enemyDeck.length > 0) {
            // Explicit enemy deck (e.g. from the deck builder).
            this.p2.pile = [];
            enemyDeck.forEach(n => { let c = this.getCard(n); if (c) this.p2.pile.push(c); });
            let pool = [...this.allCards];
            while (this.p2.pile.length < 8) {
                let c = pool[Math.floor(this.random() * pool.length)];
                if (!this.p2.pile.includes(c)) this.p2.pile.push(c);
            }
            for (let i = this.p2.pile.length - 1; i > 0; i--) {
                const j = Math.floor(this.random() * (i + 1));
                [this.p2.pile[i], this.p2.pile[j]] = [this.p2.pile[j], this.p2.pile[i]];
            }
            this.p2.h = [];
            for (let i = 0; i < 4; i++) this.p2.h.push(this.p2.pile.shift());
        } else {
            // Role-balanced premade deck (1 building, 2 spells, tank / dps / swarm /
            // 2 flying / win-con). Sets p2.pile + p2.h and the AI cycles via playAI.
            this.enemyAI.generateDeck();
        }

        // AI evolutions: use the manual enemy selection if given, otherwise auto-pick
        // up to 2 evo-capable cards from the AI's actual deck.
        let p2deck = [...this.p2.h, ...this.p2.pile];
        let aiEvos = (this.enemyEvoSel && this.enemyEvoSel.length)
            ? this.enemyEvoSel.filter(n => p2deck.some(c => c.n === n))
            : p2deck.filter(c => this.isEvoCapable(c.n)).map(c => c.n);
        this.p2.evos = new Set([...new Set(aiEvos)].slice(0, 2));

        // All towers sit on 30px tile centres (y = 15 + 30k). Kings at 735/75 leave
        // exactly one placeable tile behind them (player tile [780-810], enemy tile
        // [0-30] reaching the top edge); princesses at 645/165; river tile [390-420].
        this.t1K = new Tower(0, this.W / 2, 735, true);
        this.ents.push(this.t1K);
        this.t1L = new Tower(0, this.W / 4, 645, false);
        this.ents.push(this.t1L);
        this.t1R = new Tower(0, this.W * 3 / 4, 645, false);
        this.ents.push(this.t1R);

        this.t2K = new Tower(1, this.W / 2, 75, true);
        this.ents.push(this.t2K);
        this.t2L = new Tower(1, this.W / 4, 165, false);
        this.ents.push(this.t2L);
        this.t2R = new Tower(1, this.W * 3 / 4, 165, false);
        this.ents.push(this.t2R);
    }

    isValid(y, x, c, tm) {
        // Sandbox: place anywhere on the field (either side), only not on a structure.
        if (this.sandbox) {
            if (y < 0 || y > 810) return false;
            if (!this.sandboxNoRiver && c.t !== 2 && y > this.RIV_Y - 25 && y < this.RIV_Y + 25 && c.t === 3) return false;
            for (let e of this.ents) {
                let isStruct = e.constructor.name === "Building" || e.constructor.name === "Tower";
                if (isStruct && e.hp > 0) {
                    let gap = this.getHitboxRadius(e) + this.getVisualRadius(c) * (c.t === 3 ? 0.9 : 0.45);
                    if (Math.hypot(e.x - x, e.y - y) < gap) return false;
                }
            }
            return true;
        }
        if (c.n === "The Log" || c.n === "Barbarian Barrel" || c.n === "Royale Delivery") {
            // Log/BarbBarrel must be placed on player's side (roughly) unless tower down
            // P1 (tm=0) plays on bottom (y > RIV_Y), P2 (tm=1) plays on top (y < RIV_Y)

            if (tm === 0) {
                // Player Logic — can be thrown right up to the river's edge.
                if (this.t2L.hp <= 0 && x < this.W / 2 && y >= 200) return true; // Pocket Left
                if (this.t2R.hp <= 0 && x > this.W / 2 && y >= 200) return true; // Pocket Right
                if (y < this.RIV_Y + 5) return false;
                return true;
            } else {
                // Enemy Logic
                if (this.t1L.hp <= 0 && x < this.W / 2 && y <= this.H - 200) return true; // Pocket Left
                if (this.t1R.hp <= 0 && x > this.W / 2 && y <= this.H - 200) return true; // Pocket Right
                if (y > this.RIV_Y - 5) return false;
                return true;
            }
        }
        if (c.t === 2 || c.n === "Goblin Barrel") return true;

        // Placement spans exactly one tile behind each king tower (y 0..810).
        if (y < 0 || y > 810) return false;

        // Can't place a troop or building on top of an existing building OR a tower
        // (and buildings can't go too close to another building).
        for (let e of this.ents) {
            let isStruct = e.constructor.name === "Building" || e.constructor.name === "Tower";
            if (isStruct && e.hp > 0) {
                let gap = this.getHitboxRadius(e) + this.getVisualRadius(c) * (c.t === 3 ? 0.9 : 0.45);
                if (Math.hypot(e.x - x, e.y - y) < gap) return false;
            }
        }

        if (tm === 0) {
            // Buildings can't go in/near the river; troops can be placed right up
            // to the bridge bank (river tile is RIV_Y ± 15).
            if (c.t === 3 && y > this.RIV_Y - 25 && y < this.RIV_Y + 25) return false;
            if (y >= this.RIV_Y + 15) return true;
            if (this.t2L && this.t2L.hp <= 0 && x < this.W / 2 && y >= 200) return true;
            if (this.t2R && this.t2R.hp <= 0 && x > this.W / 2 && y >= 200) return true;
            return false;
        } else {
            // Enemy placement
            if (c.t === 3 && y > this.RIV_Y - 25 && y < this.RIV_Y + 25) return false;
            if (y <= this.RIV_Y - 15) return true;
            if (this.t1L && this.t1L.hp <= 0 && x < this.W / 2 && y <= this.H - 200) return true;
            if (this.t1R && this.t1R.hp <= 0 && x > this.W / 2 && y <= this.H - 200) return true;
            return false;
        }
    }

    getHitboxRadius(e) {
        // Hitbox is just slightly larger than the drawn sprite (sprites render at
        // ~0.88x) so units keep a small gap without clipping.
        if (e instanceof Tower) return e.rad * 0.92;
        if (e instanceof Building) return e.rad * 0.92;
        if (e instanceof Troop) return e.rad * 0.95;
        return e.rad / 2.0;
    }

    // --- Pathfinding (grid A*) -------------------------------------------------
    // Passability grid (30px tiles). Impassable = the river (except the two bridge
    // lanes) and every tower / building footprint. Rebuilt each tick so paths route
    // around the towers into the side lanes and across a bridge — never the centre.
    buildNavGrid() {
        const COLS = 18, ROWS = 32, T = 30;
        this.navCols = COLS; this.navRows = ROWS; this.navT = T;
        let grid = new Uint8Array(COLS * ROWS);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let cx = c * T + 15, cy = r * T + 15, ok = 1;
                // River: passable only in the bridge cells that sit fully on the
                // actual bridge (the river-clamp allows x within ±30 of the bridge).
                if (cy > 385 && cy < 415) ok = (Math.abs(cx - this.W / 4) <= 15 || Math.abs(cx - this.W * 3 / 4) <= 15) ? 1 : 0;
                grid[r * COLS + c] = ok;
            }
        }
        for (let e of this.ents) {
            if ((e instanceof Tower || e instanceof Building) && e.hp > 0) {
                let block = e.rad + 6;
                let c0 = Math.max(0, Math.floor((e.x - block) / T)), c1 = Math.min(COLS - 1, Math.floor((e.x + block) / T));
                let r0 = Math.max(0, Math.floor((e.y - block) / T)), r1 = Math.min(ROWS - 1, Math.floor((e.y + block) / T));
                for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
                    if (Math.hypot(c * T + 15 - e.x, r * T + 15 - e.y) < block) grid[r * COLS + c] = 0;
                }
            }
        }
        this.navGrid = grid;
    }

    _nearestPassable(c, r) {
        const COLS = this.navCols, ROWS = this.navRows, g = this.navGrid;
        const ok = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS && g[r * COLS + c];
        if (ok(c, r)) return [c, r];
        for (let rad = 1; rad < 9; rad++) {
            for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
                if (Math.abs(dr) !== rad && Math.abs(dc) !== rad) continue;
                if (ok(c + dc, r + dr)) return [c + dc, r + dr];
            }
        }
        return [Math.max(0, Math.min(COLS - 1, c)), Math.max(0, Math.min(ROWS - 1, r))];
    }

    // Shortest path of waypoints from (sx,sy) to (gx,gy). Flying units go straight.
    computePath(sx, sy, gx, gy, fly) {
        if (fly || !this.navGrid) return [{ x: gx, y: gy }];
        const COLS = this.navCols, ROWS = this.navRows, T = this.navT, grid = this.navGrid;
        const pass = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS && grid[r * COLS + c] === 1;
        let [sc, sr] = this._nearestPassable(Math.floor(sx / T), Math.floor(sy / T));
        let [gc, gr] = this._nearestPassable(Math.floor(gx / T), Math.floor(gy / T));
        if (sc === gc && sr === gr) return [{ x: gx, y: gy }];
        const idx = (c, r) => r * COLS + c;
        const start = idx(sc, sr), goal = idx(gc, gr);
        const came = new Map(), gS = new Map([[start, 0]]), fS = new Map();
        const h = (c, r) => Math.hypot(c - gc, r - gr);
        fS.set(start, h(sc, sr));
        const open = [start];
        let found = false, guard = 0;
        while (open.length && guard++ < 5000) {
            let bi = 0; for (let i = 1; i < open.length; i++) if ((fS.get(open[i]) ?? 1e9) < (fS.get(open[bi]) ?? 1e9)) bi = i;
            let cur = open.splice(bi, 1)[0];
            if (cur === goal) { found = true; break; }
            let cc = cur % COLS, cr = (cur - cc) / COLS;
            for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
                if (!dc && !dr) continue;
                let nc = cc + dc, nr = cr + dr;
                if (!pass(nc, nr)) continue;
                if (dc && dr && (!pass(cc + dc, cr) || !pass(cc, cr + dr))) continue; // no corner cut
                let ni = idx(nc, nr), tg = (gS.get(cur) ?? 1e9) + ((dc && dr) ? 1.414 : 1);
                if (tg < (gS.get(ni) ?? 1e9)) {
                    came.set(ni, cur); gS.set(ni, tg); fS.set(ni, tg + h(nc, nr));
                    if (!open.includes(ni)) open.push(ni);
                }
            }
        }
        if (!found) return [{ x: gx, y: gy }];
        let cells = [], cur = goal;
        while (cur !== start) { let cc = cur % COLS; cells.push([cc, (cur - cc) / COLS]); cur = came.get(cur); if (cur === undefined) break; }
        cells.reverse();
        let pts = cells.map(([c, r]) => ({ x: c * T + 15, y: r * T + 15 }));
        let path = this._simplifyPath(sx, sy, pts, pass, T);
        if (path.length) path[path.length - 1] = { x: gx, y: gy }; else path = [{ x: gx, y: gy }];
        return path;
    }

    // Greedy string-pulling: keep the farthest waypoint with a clear straight line.
    _simplifyPath(sx, sy, pts, pass, T) {
        const clear = (ax, ay, bx, by) => {
            let n = Math.ceil(Math.hypot(bx - ax, by - ay) / 10);
            for (let i = 1; i < n; i++) {
                let x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
                if (!pass(Math.floor(x / T), Math.floor(y / T))) return false;
            }
            return true;
        };
        let out = [], cx = sx, cy = sy, i = 0;
        while (i < pts.length) {
            let j = pts.length - 1;
            while (j > i && !clear(cx, cy, pts[j].x, pts[j].y)) j--;
            out.push(pts[j]); cx = pts[j].x; cy = pts[j].y; i = j + 1;
        }
        return out;
    }
    // ---------------------------------------------------------------------------

    getVisualRadius(c) {
        if (c.n === "Cannon") return 25;
        if (c.n === "Crate") return 14;
        if (c.t === 3) return 20;
        return 18;
    }

    getSpellRadius(c) {
        // Clash Royale radii (30px / tile), 20% smaller, rounded to integers.
        if (c.n === "Arrows") return { type: 'circle', val: 91 };
        if (c.n === "Poison") return { type: 'circle', val: 95 };
        if (c.n === "Graveyard") return { type: 'circle', val: 92 };
        if (c.n === "Freeze") return { type: 'circle', val: 67 };
        if (c.n === "Vines") return { type: 'circle', val: 59 };
        if (c.n === "Zap") return { type: 'circle', val: 55 };
        if (c.n === "Fireball") return { type: 'circle', val: 55 }; // slightly bigger
        if (c.n === "Giant Snowball") return { type: 'circle', val: 55 };
        if (c.n === "Royale Delivery") return { type: 'circle', val: 58 };
        if (c.n === "Rocket") return { type: 'circle', val: 43 };
        if (c.n === "The Log") return { type: 'rect', w: 83, h: 16 };
        if (c.n === "Barbarian Barrel") return { type: 'rect', w: 46, h: 16 };
        if (c.n === "Goblin Barrel") return { type: 'circle', val: 31 };
        if (c.n === "Clone") return { type: 'circle', val: 79 };
        if (c.n === "Tornado") return { type: 'circle', val: 127 };
        if (c.n === "Heal Spirit") return { type: 'circle', val: 0 };
        if (c.n === "Ice Spirit" || c.n === "Electro Spirit" || c.n === "Fire Spirit") return { type: 'circle', val: 0 };

        // Default for other spells
        if (c.t === 2) return { type: 'circle', val: 43 };

        return null;
    }

    playCard(p, card, x, y, team) {
        if (!card) return;

        let cardToPlay = card;
        let cost = card.c;
        let isMirror = false;

        if (card.n === "Mirror") {
            if (!p.lastPlayedCard) return;
            cardToPlay = p.lastPlayedCard;
            cost = cardToPlay.c + 1;
            isMirror = true;
        }

        // Elixir Check
        if (p.elx < cost) return;

        // Building Placement Check (Don't place on top of buildings)
        if (cardToPlay.t === 3) {
            let newVisualRad = this.getVisualRadius(cardToPlay);
            for (let e of this.ents) {
                if (e instanceof Tower || e instanceof Building) {
                    if (Math.hypot(x - e.x, y - e.y) < e.rad + newVisualRad + 3) return;
                }
            }
        }

        // Valid Area Check
        if (!this.isValid(y, x, cardToPlay, team)) return;

        // Deduct Elixir
        p.elx -= cost;

        // Evolution charge: normal plays of an evo card charge it; once charged the
        // play spawns the EVOLVED unit and the charge resets to 0.
        let useEvo = false;
        if (!isMirror && p.evos && p.evos.has(cardToPlay.n)) {
            const req = this.EVO_REQ[cardToPlay.n] || 1;
            if ((p.evoProgress[cardToPlay.n] || 0) >= req) { useEvo = true; p.evoProgress[cardToPlay.n] = 0; }
            else { p.evoProgress[cardToPlay.n] = (p.evoProgress[cardToPlay.n] || 0) + 1; }
        }

        // Apply Mirror Boost (5% HP/Dmg)
        if (isMirror) {
            let boostedCard = Object.assign(Object.create(Object.getPrototypeOf(cardToPlay)), cardToPlay);
            boostedCard.hp = Math.floor(cardToPlay.hp * 1.05);
            boostedCard.d = Math.floor(cardToPlay.d * 1.05);
            this.addU(team, boostedCard, x, y);
        } else {
            this.addU(team, cardToPlay, x, y, useEvo);
        }

        // Update Last Plays
        if (card.n !== "Mirror") p.lastPlayedCard = card;
        else p.lastPlayedCard = cardToPlay;

        // Update Mirror Cost in Deck (Visual only really)
        // We need to find the Mirror card instance in the game to update its cost?
        // Or just update the one in hand?
        // The one in hand is `card`.
        if (card.n === "Mirror" && p.lastPlayedCard) {
            card.c = p.lastPlayedCard.c + 1;
        } else if (p.lastPlayedCard) {
            // Find Mirror in this player's hand or pile to update its cost
            // This is a bit tricky if multiple mirrors exist but standard game has 1.
            let m = p.h.find(c => c.n === "Mirror") || p.pile.find(c => c.n === "Mirror");
            if (m) m.c = p.lastPlayedCard.c + 1;
        }

        // Cycle Card
        // We use indexOf because we expect `card` to be the actual object from the hand
        let idx = p.h.indexOf(card);
        if (idx > -1) {
            p.h.splice(idx, 1);
            p.pile.push(card);
            p.h.push(p.pile.shift());
        }
    }

    spawn(x, y) {
        if (this.tiebreaker) return;
        if (!this.sel || y > this.H - 150) return;

        // Local Player (Team 0)
        this.playCard(this.p1, this.sel, x, y, 0);

        // Clear selection if played
        // Check if card was actually removed from hand to confirm play
        if (!this.p1.h.includes(this.sel)) {
            this.sel = null;
        }
    }

    // One deploy-time clock per card played, at the drop point, coloured by team.
    addDeploy(x, y, tm, dur = 55, fly = false) {
        this.deploys.push({ x, y, tm, t: dur, max: dur, fly });
    }

    addU(tm, c, x, y, isEvo = false) {
        // Evolved cards spawn buffed units (all copies of a multi-unit card too).
        if (isEvo) c = this.makeEvoCard(c);
        // Troop / building cards show a deploy clock here; spells that spawn troops
        // (Goblin Barrel, Royale Delivery) add theirs where the troops appear.
        if (c.t !== 2) this.addDeploy(x, y, tm, 55, c.fl);
        if (c.n === "Goblin Barrel") {
            // Thrown from the king tower, arcs up and back down (like Fireball but
            // slower) with a flying shadow, then pops 3 goblins on the target tile.
            let kt = (tm === 0) ? this.t1K : this.t2K;
            let p = new Proj(kt.x, kt.y, x, y, null, 2.4, false, 30, 0, tm, false); // 2.5x slower
            p.asSpellArc(150, "barrel");
            p.barrelGoblins = true;
            this.projs.push(p);
        } else if (c.n === "Royale Delivery") {
            let shape = this.getSpellRadius(c);
            let rad = shape && shape.type === 'circle' ? shape.val : 60;
            // Crate falls (growing shadow ~1.5s) then lands → recruit + impact.
            this.projs.push(new Proj(x, y, x, y, null, 0, false, rad, c.d, tm, false).asDelivery());
        } else if (c.n === "Poison") {
            let shape = this.getSpellRadius(c); // Returns val: 100
            let rad = shape && shape.type === 'circle' ? shape.val : 100;
            this.projs.push(new Proj(x, y, x, y, null, 0, true, rad, c.d, tm, false).asPoison());
        } else if (c.n === "Graveyard") {
            let shape = this.getSpellRadius(c); // Returns val: 100
            let rad = shape && shape.type === 'circle' ? shape.val : 100;
            this.projs.push(new Proj(x, y, x, y, null, 0, true, rad, 0, tm, false).asGraveyard());
        } else if (c.n === "The Log") {
            // Log rolls 280px (User requested).
            // Speed: 2.66
            let dist = 280;
            let ty = (tm === 0) ? y - dist : y + dist;
            let p = new Proj(x, y, x, ty, null, 2.66, false, 60, c.d, tm, false).asLog();
            p.crownMult = 0.3; // reduced crown-tower damage
            this.projs.push(p);
        } else if (c.n === "Barbarian Barrel") {
            // 3x shorter than log (303 / 3 = 101)
            let dist = 101;
            let ty = (tm === 0) ? y - dist : y + dist;
            let p = new Proj(x, y, x, ty, null, 2.66, false, 60, Math.floor(c.d), tm, false).asBarbBarrelLog();
            p.crownMult = 0.3;
            this.projs.push(p);
        } else if (c.n === "Clone") {
            let shape = this.getSpellRadius(c);
            let rad = shape && shape.type === 'circle' ? shape.val : 90;
            let p = new Proj(x, y, x, y, null, 0, true, rad, 0, tm, false);
            p.life = 5;
            p.isClone = true;
            this.projs.push(p);

            let toClone = [];
            for (let e of this.ents) {
                if (e instanceof Troop && e.tm === tm && Math.hypot(e.x - x, e.y - y) < rad && !e.isClone && !(e instanceof Building) && !(e instanceof Tower)) {
                    toClone.push(e);
                }
            }
            for (let t of toClone) {
                let clone = new Troop(tm, t.x + 20, t.y, t.c);
                // Clones spawn with 1 HP. Set _hp DIRECTLY: the hp setter routes
                // damage through the shield, so `clone.hp = 1` on a shielded unit
                // would just drain the shield and leave HP full (the health bug).
                clone.shield = 0;
                clone._hp = 1;
                clone.mhp = 1;
                clone.isClone = true;
                clone.deployTime = 0;
                if (t.maxShield > 0) { clone.shield = 1; clone.maxShield = 1; } // shielded clones keep a 1-HP shield
                else { clone.maxShield = 0; }
                this.ents.push(clone);
            }
        } else if (c.t === 2) {
            let shape = this.getSpellRadius(c);
            let rad = shape && shape.type === 'circle' ? shape.val : 60;
            let dmg = c.d; // real Level 11 spell damage from the card table

            // Thrown spells launch from the caster's king tower and arc to the
            // target; speed/arc height depend on the spell.
            const ARC = {
                "Fireball": { spd: 4.5, arc: 130, kind: "fireball" }, // slower
                "Rocket": { spd: 1.8, arc: 160, kind: "rocket" },     // 2.5x slower than Fireball
                "Giant Snowball": { spd: 10, arc: 110, kind: "snowball" }
            };
            // Crown-tower damage multiplier (real CR: spells chip towers).
            const crown = (c.n === "Rocket") ? 0.25 : 0.3;
            if (c.n === "Arrows") {
                // 3-wave volley; each wave deals 105 (one wave kills a skeleton, all
                // three kill goblins/minions and now ARCHERS too — 3×105=315 > 304).
                // A single wave still won't kill a minion (230). Not launched from the tower.
                let p = new Proj(x, y, x, y, null, 0, true, rad, 105, tm, false).asArrows();
                p.crownMult = crown;
                this.projs.push(p);
            } else if (ARC[c.n]) {
                let kt = (tm === 0) ? this.t1K : this.t2K;
                let cfg = ARC[c.n];
                let p = new Proj(kt.x, kt.y, x, y, null, cfg.spd, false, rad, dmg, tm, false);
                p.asSpellArc(cfg.arc, cfg.kind);
                p.crownMult = crown;
                if (c.n === "Fireball") p.hasKnockback = true;
                this.projs.push(p);
            } else {
                // Placed spells fall from the sky as a symbol, then resolve.
                let p = new Proj(x, y, x, y, null, 0, true, rad, dmg, tm, false);
                p.crownMult = crown;
                if (c.n === "Zap") { p.asStun(); p.asSpellDrop("zap", "#7fdcff", 20); }
                else if (c.n === "Vines") { p.isRoot = true; p.isVines = true; p.life = 12; } // root + ground fliers, no visual
                else if (c.n === "Freeze") { p.isFreeze = true; p.flashCol = "#bfe8ff"; p.life = 12; } // instant, no snowflake
                else { p.life = 26; } // any other placed spell still gets a short wind-up
                this.projs.push(p);
            }
        } else if (c.n === "Archers") {
            // Two archers almost touching — just outside the collision radius so they
            // don't immediately snap apart, leaving a tiny visible gap.
            this.ents.push(new Troop(tm, x - 8, y, c));
            this.ents.push(new Troop(tm, x + 8, y, c));
        } else if (["Spear Goblins", "Wall Breakers"].includes(c.n)) {
            this.ents.push(new Troop(tm, x - 15, y, c));
            this.ents.push(new Troop(tm, x + 15, y, c));
            if (c.n.includes("Spear")) this.ents.push(new Troop(tm, x, y + 15, c));
        } else if (c.n === "Skeletons") {
            // Tight triangle (same per-skeleton spacing as Skeleton Army).
            const S = 13;
            this.ents.push(new Troop(tm, x, y - S * 0.6, c));
            this.ents.push(new Troop(tm, x - S * 0.55, y + S * 0.5, c));
            this.ents.push(new Troop(tm, x + S * 0.55, y + S * 0.5, c));
        } else if (c.n === "Goblins") {
            this.ents.push(new Troop(tm, x, y - 10, c));
            this.ents.push(new Troop(tm, x - 10, y + 10, c));
            this.ents.push(new Troop(tm, x + 10, y + 10, c));
        } else if (c.n === "Minions") {
            this.ents.push(new Troop(tm, x, y - 10, c));
            this.ents.push(new Troop(tm, x - 10, y + 10, c));
            this.ents.push(new Troop(tm, x + 10, y + 10, c));
        } else if (c.n === "Minion Horde") {
            for (let i = 0; i < 6; i++)
                this.ents.push(new Troop(tm, x + this.random() * 50 - 25, y + this.random() * 50 - 25, this.getCard("Minions")));
        } else if (c.n === "Skeleton Army") {
            // Spread the 15 skeletons across a wide disk (like the real game).
            for (let i = 0; i < 15; i++) {
                let ang = i * 2.39996;
                let rr = Math.sqrt((i + 0.5) / 15) * 48;
                this.ents.push(new Troop(tm, x + Math.cos(ang) * rr, y + Math.sin(ang) * rr, this.getCard("Skeletons")));
            }
        } else if (c.n === "Bats") {
            for (let i = 0; i < 5; i++)
                this.ents.push(new Troop(tm, x + this.random() * 40 - 20, y + this.random() * 40 - 20, c));
        } else if (c.n === "Barbarians") {
            // Five barbarians in a tight knot (so a Fireball catches them all — and
            // they all just barely survive it).
            for (const [dx, dy] of [[-20, -11], [20, -11], [0, 0], [-20, 13], [20, 13]])
                this.ents.push(new Troop(tm, x + dx, y + dy, c));
        } else if (c.n === "Elite Barbarians") {
            this.ents.push(new Troop(tm, x - 10, y, c));
            this.ents.push(new Troop(tm, x + 10, y, c));
        } else if (c.n === "Zappies") {
            this.ents.push(new Troop(tm, x - 10, y, c));
            this.ents.push(new Troop(tm, x + 10, y, c));
            this.ents.push(new Troop(tm, x, y + 10, c));
        } else if (c.n === "Mega Knight") {
            this.ents.push(new Troop(tm, x, y, c));
            for (let e of this.ents)
                if (e.tm !== tm && !e.fly && Math.hypot(e.x - x, e.y - y) < 100)
                    e.hp -= 340; // spawn-in area damage (real L11)
        } else if (c.t === 3) {
            this.ents.push(new Building(tm, x, y, c));
        } else if (c.n === "Royal Hogs") {
            this.ents.push(new Troop(tm, x - 30, y, c));
            this.ents.push(new Troop(tm, x - 10, y, c));
            this.ents.push(new Troop(tm, x + 10, y, c));
            this.ents.push(new Troop(tm, x + 30, y, c));
        } else if (c.n === "Royal Recruits") {
            let offsets = [-150, -90, -30, 30, 90, 150];
            for (let off of offsets) {
                this.ents.push(new Troop(tm, x + off, y, c));
            }
        } else {
            this.ents.push(new Troop(tm, x, y, c));
        }
    }

    getCard(n) {
        let c = this.allCards.find(c => c.n === n);
        if (c) return c;
        c = this.tokens.find(c => c.n === n);
        if (c) return c;
        return this.allCards[0];
    }

    endGame(winner) {
        if (this.over) return;
        this.over = true;
        this.win = winner;
        this.gamesPlayed++;
        if (this.win === 0) this.gamesWon++;
        this.saveProgress();
    }

    getState() {
        return {
            tick: this.aiTick,
            nextEntityId: this.nextEntityId,
            p1: { elx: this.p1.elx },
            p2: { elx: this.p2.elx },
            towers: {
                t1K: this.t1K.hp, t1L: this.t1L.hp, t1R: this.t1R.hp,
                t2K: this.t2K.hp, t2L: this.t2L.hp, t2R: this.t2R.hp
            },
            ents: this.ents.filter(e => !(e instanceof Tower)).map(e => {
                let s = {
                    id: e.id,
                    type: e.constructor.name,
                    tm: e.tm,
                    x: e.x,
                    y: e.y,
                    hp: e.hp,
                    n: e.c ? e.c.n : null
                };
                if (e.shield !== undefined) s.shield = e.shield;
                if (e.isClone) s.isClone = true;
                return s;
            })
        };
    }

    syncState(state) {
        if (!state) return;
        this.aiTick = state.tick;
        this.nextEntityId = state.nextEntityId;

        // Flip Elixir (Client's P1 is Host's P2)
        this.p2.elx = state.p1.elx;
        this.p1.elx = state.p2.elx;

        // Flip Towers (Client's T1 is Host's T2)
        if (this.t2K) this.t2K.hp = state.towers.t1K;
        if (this.t2L) this.t2L.hp = state.towers.t1L;
        if (this.t2R) this.t2R.hp = state.towers.t1R;

        if (this.t1K) this.t1K.hp = state.towers.t2K;
        if (this.t1L) this.t1L.hp = state.towers.t2L;
        if (this.t1R) this.t1R.hp = state.towers.t2R;

        // Sync Entities
        let localTowers = this.ents.filter(e => e instanceof Tower);
        let localById = new Map();
        for (let e of this.ents) {
            if (!(e instanceof Tower) && e.id) localById.set(e.id, e);
        }

        let syncedEnts = [...localTowers];

        for (let s of state.ents) {
            let cx = this.W - s.x;
            let cy = 2 * this.RIV_Y - s.y; // mirror across the river (RIV_Y=405 → 810-y)
            let ctm = 1 - s.tm;

            if (localById.has(s.id)) {
                let e = localById.get(s.id);
                e.x = cx;
                e.y = cy;
                e.hp = s.hp;
                e.tm = ctm;
                if (s.shield !== undefined) e.shield = s.shield;
                if (s.isClone) e.isClone = true;
                syncedEnts.push(e);
                localById.delete(s.id);
            } else {
                let c = this.getCard(s.n);
                if (!c) continue;
                let e = null;
                if (s.type === 'Troop') e = new Troop(ctm, cx, cy, c);
                else if (s.type === 'Building') e = new Building(ctm, cx, cy, c);

                if (e) {
                    e.id = s.id;
                    e.hp = s.hp;
                    if (s.shield !== undefined) e.shield = s.shield;
                    if (s.isClone) e.isClone = true;
                    syncedEnts.push(e);
                }
            }
        }

        this.ents = syncedEnts;
    }

    upd() {
        // Assign IDs to new entities and snapshot positions for render interpolation.
        for (let e of this.ents) {
            if (!e.id) e.id = this.nextEntityId++;
            e.lx = e.x;
            e.ly = e.y;
        }
        for (let p of this.projs) {
            p.lx = p.x;
            p.ly = p.y;
        }

        if (!this.sandbox) {
            let elapsed = Date.now() - this.gameStart;
            let remaining = 180000 - elapsed; // 3 minutes
            if (remaining <= 60000 && !this.isDoubleElixir) { // 1 minute left
                this.isDoubleElixir = true;
                this.doubleElixirAnim = 300;
            }
            if (remaining <= 0) {
                remaining = 0;
                this.tiebreaker = true;
            }

            if (this.doubleElixirAnim > 0) this.doubleElixirAnim--;

            if (this.t1K.hp <= 0 || this.t2K.hp <= 0) {
                this.endGame(this.t1K.hp <= 0 ? 1 : 0);
                return;
            }
        }

        if (this.tiebreaker) {
            this.ents = this.ents.filter(e => e instanceof Tower);
            let t1Count = (this.t1K.hp > 0 ? 1 : 0) + (this.t1L.hp > 0 ? 1 : 0) + (this.t1R.hp > 0 ? 1 : 0);
            let t2Count = (this.t2K.hp > 0 ? 1 : 0) + (this.t2L.hp > 0 ? 1 : 0) + (this.t2R.hp > 0 ? 1 : 0);

            if (t1Count !== t2Count) {
                this.endGame(t1Count > t2Count ? 0 : 1);
                return;
            }

            for (let e of this.ents) {
                if (e instanceof Tower) {
                    e.hp -= 10;
                    if (e.hp <= 0) {
                        this.endGame(e.tm === 0 ? 1 : 0);
                        return;
                    }
                }
            }
        }

        if (!this.sandbox) {
            let rate = this.isDoubleElixir ? 0.02 : 0.01;
            this.p1.elx = Math.min(10, this.p1.elx + rate);
            if (this.isMultiplayer) {
                this.p2.elx = Math.min(10, this.p2.elx + rate); // Identical rate for multiplayer lockstep
            } else {
                this.p2.elx = Math.min(10, this.p2.elx + rate * 0.85); // 15% slower than player for AI
            }
        }

        this.aiTick++;

        if (!this.sandbox) {
            let pk1 = this.t1K.actv, pk2 = this.t2K.actv;
            this.t1K.actv = (this.t1K.hp < this.t1K.mhp) || (this.t1L.hp <= 0) || (this.t1R.hp <= 0);
            this.t2K.actv = (this.t2K.hp < this.t2K.mhp) || (this.t2L.hp <= 0) || (this.t2R.hp <= 0);
            // On the activation flip, play the "shooter rises from its box" animation (45
            // ticks); otherwise tick it down while it runs.
            if (this.t1K.actv && !pk1) this.t1K.activateAnim = 45; else if (this.t1K.activateAnim > 0) this.t1K.activateAnim--;
            if (this.t2K.actv && !pk2) this.t2K.activateAnim = 45; else if (this.t2K.activateAnim > 0) this.t2K.activateAnim--;
        }

        if (this.enemyAI && !this.isMultiplayer) this.enemyAI.update();

        // Collision physics (handles tower box-collision, buildings via mass, and
        // unit-vs-unit). One pass per pair — no redundant push loop.
        for (let i = 0; i < this.ents.length; i++) {
            let a = this.ents[i];
            for (let j = i + 1; j < this.ents.length; j++) {
                let b = this.ents[j];
                if (a.fly !== b.fly) continue;

                let aIsStruct = a instanceof Tower || a instanceof Building;
                let bIsStruct = b instanceof Tower || b instanceof Building;

                if (aIsStruct || bIsStruct) {
                    if (aIsStruct && bIsStruct) continue; // structures never push each other
                    let t = aIsStruct ? a : b;   // the structure
                    let u = aIsStruct ? b : a;   // the unit
                    let uHb = this.getHitboxRadius(u);

                    if (u.tm !== t.tm) {
                        // ENEMY units collide with the tower's VISUAL SQUARE (half-width
                        // rad*0.88) — a box, so they stop exactly at the drawn edge,
                        // corners included. Pushed out of the nearer face, capped so
                        // they slide rather than teleport.
                        let half = t.rad * 0.88 + uHb;
                        let dx = u.x - t.x, dy = u.y - t.y;
                        if (Math.abs(dx) < half && Math.abs(dy) < half) {
                            let penX = half - Math.abs(dx), penY = half - Math.abs(dy);
                            if (penX <= penY) u.x += (dx < 0 ? -1 : 1) * Math.min(penX, 3.5);
                            else u.y += (dy < 0 ? -1 : 1) * Math.min(penY, 3.5);
                        }
                    } else {
                        // FRIENDLY units collide with the tower's visual too (so they
                        // never overlap their own towers), but as a ROUNDED box, a touch
                        // larger and with rounded sides so they slide smoothly around it.
                        let H = t.rad * 0.92 + uHb, cr = t.rad * 0.4;
                        let dx = u.x - t.x, dy = u.y - t.y;
                        let qx = Math.abs(dx) - H + cr, qy = Math.abs(dy) - H + cr;
                        let mx = Math.max(qx, 0), my = Math.max(qy, 0), outLen = Math.hypot(mx, my);
                        let sdf = Math.min(Math.max(qx, qy), 0) + outLen - cr;
                        if (sdf < 0) {
                            let nx, ny;
                            if (outLen > 1e-4) { nx = Math.sign(dx) * mx / outLen; ny = Math.sign(dy) * my / outLen; }
                            else if (qx > qy) { nx = Math.sign(dx) || 1; ny = 0; }
                            else { nx = 0; ny = Math.sign(dy) || 1; }
                            let push = Math.min(-sdf, 3.5);
                            u.x += nx * push; u.y += ny * push;
                        }
                    }
                    continue;
                }

                let radA = a.rad * 0.95;
                let radB = b.rad * 0.95;

                let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy, r = radA + radB;
                if (d2 < r * r) {
                    let d = Math.sqrt(d2);
                    if (d === 0) {
                        let ang = this.random() * Math.PI * 2;
                        dx = Math.cos(ang); dy = Math.sin(ang); d = 1; // unit vector
                    }
                    // Mass-weighted separation: the lighter unit moves more, the
                    // heavier one barely budges (so tanks plow through swarms). Each
                    // unit's step is capped so they slide apart smoothly, no teleport.
                    let overlap = r - d;
                    let nx = dx / d, ny = dy / d;
                    let total = a.mass + b.mass;
                    let aMove = Math.min(overlap * (b.mass / total), 5);
                    let bMove = Math.min(overlap * (a.mass / total), 5);
                    a.x += nx * aMove; a.y += ny * aMove;
                    b.x -= nx * bMove; b.y -= ny * bMove;
                }
            }
        }

        for (let i = 0; i < this.ents.length; i++) {
            let e = this.ents[i];
            if (e.fr > 0) e.fr--;
            if (e.rt > 0) e.rt--;
            // Vines grounding: restore flight when it wears off.
            if (e.groundedTime > 0) { e.groundedTime--; if (e.groundedTime === 0 && e.wasFlying) { e.fly = true; e.wasFlying = false; } }
            if (e.vinedTime > 0) e.vinedTime--;

            if (e.fr <= 0 && e.hp > 0) e.act(this);

            // Clamp position AFTER acting so a unit ends each tick inside the arena
            // and at the river bank (avoids the 1-tick edge/river jitter). Off-bridge
            // units can't enter the water; crossing units slide along to the bridge.
            if (!(e instanceof Tower) && !(e instanceof Building)) {
                let visualR = e.rad;
                e.x = Math.max(visualR, Math.min(this.W - visualR, e.x));
                e.y = Math.max(visualR, Math.min(810 - visualR, e.y));
                if (!this.sandboxNoRiver && e.y + visualR > this.RIV_Y - 15 && e.y - visualR < this.RIV_Y + 15 && !e.fly) {
                    let onBridge = (e.x >= this.W / 4 - 30 && e.x <= this.W / 4 + 30) || (e.x >= this.W * 3 / 4 - 30 && e.x <= this.W * 3 / 4 + 30);
                    if (!onBridge) {
                        e.y = e.y < this.RIV_Y ? this.RIV_Y - 15 - visualR : this.RIV_Y + 15 + visualR;
                    }
                }
            }
            if (e.hp <= 0) {
                e.die(this);
                this.ents.splice(i, 1);
                i--;
            }
        }

        // Persist each unit's actual per-tick movement so the AI (which runs BEFORE
        // act() each tick) can lead its spells. lx/ly were snapshotted pre-act, so
        // (x - lx) is this tick's real velocity; it's read on the following tick.
        for (let e of this.ents) { e.vx = e.x - e.lx; e.vy = e.y - e.ly; }

        for (let i = 0; i < this.projs.length; i++) {
            let p = this.projs[i];
            p.upd(this);
            if (p.life <= 0) {
                this.projs.splice(i, 1);
                i--;
            }
        }

        // Tick down deploy-time clock indicators.
        for (let i = 0; i < this.deploys.length; i++) {
            if (--this.deploys[i].t <= 0) { this.deploys.splice(i, 1); i--; }
        }
    }

    // Placeholder for render, will be handled in Main.js or a separate Renderer
    render(ctx) {
        // ...
    }

    spawnTroop(team, x, y, card) {
        if (!card) return;
        this.ents.push(new Troop(team, x, y, card));
    }

    handleCrateDeath(building) {
        let rand = Math.floor(this.random() * 3);
        if (rand === 0) {
            // Spawn 3 Skeletons
            let skelCard = this.getCard("Skeletons");
            for (let i = 0; i < 3; i++) {
                this.ents.push(new Troop(building.tm, building.x + (i - 1) * 10, building.y, skelCard));
            }
        } else if (rand === 1) {
            // Spawn Spirit
            let spirits = ["Fire Spirit", "Ice Spirit", "Electro Spirit", "Heal Spirit"];
            let sName = spirits[Math.floor(this.random() * spirits.length)];
            this.ents.push(new Troop(building.tm, building.x, building.y, this.getCard(sName)));
        } else {
            // Explode (240 dmg, 60 radius)
            this.projs.push(new Proj(building.x, building.y, building.x, building.y, null, 0, false, 60, 240, building.tm, false).asFireArea());
        }
    }
}
