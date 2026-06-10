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
        this.RIV_Y = 400;

        this.seed = 12345; // Default seed
        this.nextEntityId = 1;

        this.allCards = [];
        this.unlockedCards = [];
        this.myDeck = [];
        this.enemyDeckSelection = [];

        this.ents = [];
        this.projs = [];

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
            new Card("Archers", 3, 304, 107, 0.5, 128, 0, 100, 54, 150, false, true),
            new Card("Giant", 5, 4091, 254, 0.375, 14, 1, 100, 90, 150, false, false),
            new Card("Fireball", 4, 0, 689, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Mini PEKKA", 4, 1361, 720, 0.75, 8, 0, 100, 96, 150, false, false),
            new Card("Zap", 2, 0, 192, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Skeletons", 1, 81, 81, 0.75, 8, 0, 100, 60, 150, false, false),
            new Card("Musketeer", 4, 720, 218, 0.5, 158, 0, 100, 60, 150, false, true),
            new Card("Cannon", 3, 824, 212, 0, 143, 3, 1800, 54, 165, false, false),
            new Card("Mega Knight", 7, 3993, 268, 0.5, 14, 0, 100, 102, 150, false, false),
            new Card("P.E.K.K.A", 7, 3760, 816, 0.375, 14, 0, 100, 108, 150, false, false),
            new Card("Skeleton Army", 3, 81, 81, 0.75, 8, 0, 100, 60, 150, false, false),
            new Card("Barbarians", 5, 670, 192, 0.5, 8, 0, 100, 78, 150, false, false),
            new Card("Goblin Barrel", 3, 0, 0, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Royale Delivery", 3, 0, 198, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Vines", 2, 0, 20, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Freeze", 4, 0, 115, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Fire Spirit", 1, 230, 207, 1, 38, 0, 100, 18, 150, false, true),
            new Card("Ice Spirit", 1, 230, 110, 1, 53, 0, 100, 18, 150, false, true),
            new Card("Electro Spirit", 1, 230, 99, 1, 53, 0, 100, 18, 150, false, true),
            new Card("Heal Spirit", 1, 231, 110, 1, 53, 0, 100, 18, 150, false, true),
            new Card("Arrows", 3, 0, 122, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Minions", 3, 230, 117, 0.75, 26, 0, 100, 60, 150, true, true),
            new Card("Goblins", 2, 202, 120, 1, 8, 0, 100, 66, 150, false, false),
            new Card("Spear Goblins", 2, 133, 81, 1, 143, 0, 100, 102, 150, false, true),
            new Card("Bats", 2, 81, 81, 1, 14, 0, 100, 78, 150, true, true),
            new Card("Poison", 4, 0, 70, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Wizard", 5, 720, 281, 0.5, 143, 0, 100, 84, 150, false, true),
            new Card("Witch", 5, 838, 134, 0.5, 143, 0, 100, 66, 150, false, true),
            new Card("Graveyard", 5, 0, 0, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Mega Minion", 3, 837, 311, 0.5, 26, 0, 100, 90, 150, true, true),
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
            new Card("Hog Rider", 4, 1696, 318, 1, 8, 1, 100, 96, 150, false, false),
            new Card("Royal Hogs", 5, 837, 74, 1, 8, 1, 100, 72, 150, false, false),
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
            unlockedCards: this.unlockedCards.map(c => c.n)
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
        this.p1 = new Player(0);
        this.p2 = new Player(1);
        this.ents = [];
        this.projs = [];
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

        this.enemyAI = new EnemyAI(this);

        this.p2.pile = [];
        if (enemyDeck && enemyDeck.length > 0) {
            // Use provided enemy deck
            enemyDeck.forEach(n => {
                let c = this.getCard(n);
                if (c) this.p2.pile.push(c);
            });
            // Fallback if deck incomplete?
            if (this.p2.pile.length < 8) {
                // Fill with random?
                let pool = [...this.allCards];
                while (this.p2.pile.length < 8) {
                    let c = pool[Math.floor(this.random() * pool.length)];
                    if (!this.p2.pile.includes(c)) this.p2.pile.push(c);
                }
            }
        } else {
            // Enemy Deck: Random 8 cards from unlocked cards (or all cards if not enough)
            let enemyPool = [...this.unlockedCards];
            if (enemyPool.length < 8) enemyPool = [...this.allCards]; // Fallback

            // Shuffle pool
            for (let i = enemyPool.length - 1; i > 0; i--) {
                const j = Math.floor(this.random() * (i + 1));
                [enemyPool[i], enemyPool[j]] = [enemyPool[j], enemyPool[i]];
            }

            // Pick top 8
            for (let i = 0; i < 8; i++) this.p2.pile.push(enemyPool[i]);
        }

        // Shuffle p2 pile (important for fair draw order even if deck is known)
        for (let i = this.p2.pile.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [this.p2.pile[i], this.p2.pile[j]] = [this.p2.pile[j], this.p2.pile[i]];
        }

        this.p2.h = [];
        for (let i = 0; i < 4; i++) this.p2.h.push(this.p2.pile.shift());

        this.t1K = new Tower(0, this.W / 2, this.H - 230, true);
        this.ents.push(this.t1K);
        this.t1L = new Tower(0, this.W / 4, this.H - 310, false);
        this.ents.push(this.t1L);
        this.t1R = new Tower(0, this.W * 3 / 4, this.H - 310, false);
        this.ents.push(this.t1R);

        this.t2K = new Tower(1, this.W / 2, 70, true);
        this.ents.push(this.t2K);
        this.t2L = new Tower(1, this.W / 4, 150, false);
        this.ents.push(this.t2L);
        this.t2R = new Tower(1, this.W * 3 / 4, 150, false);
        this.ents.push(this.t2R);
    }

    isValid(y, x, c, tm) {
        if (c.n === "The Log" || c.n === "Barbarian Barrel") {
            // Log/BarbBarrel must be placed on player's side (roughly) unless tower down
            // P1 (tm=0) plays on bottom (y > RIV_Y), P2 (tm=1) plays on top (y < RIV_Y)

            if (tm === 0) {
                // Player Logic
                if (this.t2L.hp <= 0 && x < this.W / 2 && y >= 200) return true; // Pocket Left
                if (this.t2R.hp <= 0 && x > this.W / 2 && y >= 200) return true; // Pocket Right
                if (y < this.RIV_Y + 40) return false;
                return true;
            } else {
                // Enemy Logic
                if (this.t1L.hp <= 0 && x < this.W / 2 && y <= this.H - 200) return true; // Pocket Left
                if (this.t1R.hp <= 0 && x > this.W / 2 && y <= this.H - 200) return true; // Pocket Right
                if (y > this.RIV_Y - 40) return false;
                return true;
            }
        }
        if (c.t === 2 || c.n === "Goblin Barrel") return true;

        if (tm === 0) {
            // Buildings can't go in/near the river; troops can be placed right up
            // to the bridge bank.
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
        // Collision/hitbox radius is intentionally a bit larger than the drawn
        // sprite (sprites are rendered at ~0.82x) so units don't visually clip.
        if (e instanceof Tower) return e.rad * 0.95;
        if (e instanceof Building) return e.rad * 0.9;
        if (e instanceof Troop) return e.rad;
        return e.rad / 2.0;
    }

    getVisualRadius(c) {
        if (c.n === "Cannon") return 25;
        if (c.n === "Crate") return 14;
        if (c.t === 3) return 20;
        return 18;
    }

    getSpellRadius(c) {
        // Real Clash Royale radii at 30px / tile.
        if (c.n === "Arrows") return { type: 'circle', val: 120 };        // 4.0 tiles
        if (c.n === "Poison") return { type: 'circle', val: 105 };        // 3.5 tiles
        if (c.n === "Graveyard") return { type: 'circle', val: 100 };
        if (c.n === "Freeze") return { type: 'circle', val: 90 };         // 3.0 tiles
        if (c.n === "Vines") return { type: 'circle', val: 80 };
        if (c.n === "Zap") return { type: 'circle', val: 75 };            // 2.5 tiles
        if (c.n === "Fireball" || c.n === "Giant Snowball") return { type: 'circle', val: 75 }; // 2.5 tiles
        if (c.n === "Royale Delivery" || c.n === "Rocket") return { type: 'circle', val: 60 };  // 2.0 tiles
        if (c.n === "The Log") return { type: 'rect', w: 110, h: 22 };
        if (c.n === "Barbarian Barrel") return { type: 'rect', w: 64, h: 22 };
        if (c.n === "Goblin Barrel") return { type: 'circle', val: 45 };
        if (c.n === "Clone") return { type: 'circle', val: 105 };
        if (c.n === "Tornado") return { type: 'circle', val: 165 };
        if (c.n === "Heal Spirit") return { type: 'circle', val: 0 };
        if (c.n === "Ice Spirit" || c.n === "Electro Spirit" || c.n === "Fire Spirit") return { type: 'circle', val: 0 };

        // Default for other spells
        if (c.t === 2) return { type: 'circle', val: 60 };

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

        // Apply Mirror Boost (5% HP/Dmg)
        if (isMirror) {
            let boostedCard = Object.assign(Object.create(Object.getPrototypeOf(cardToPlay)), cardToPlay);
            boostedCard.hp = Math.floor(cardToPlay.hp * 1.05);
            boostedCard.d = Math.floor(cardToPlay.d * 1.05);
            this.addU(team, boostedCard, x, y);
        } else {
            this.addU(team, cardToPlay, x, y);
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
        if (!this.sel || y > this.H - 120) return;

        // Local Player (Team 0)
        this.playCard(this.p1, this.sel, x, y, 0);

        // Clear selection if played
        // Check if card was actually removed from hand to confirm play
        if (!this.p1.h.includes(this.sel)) {
            this.sel = null;
        }
    }

    addU(tm, c, x, y) {
        if (c.n === "Goblin Barrel") {
            // Thrown from the king tower, arcs up and back down, then pops 3 goblins.
            let kt = (tm === 0) ? this.t1K : this.t2K;
            let p = new Proj(kt.x, kt.y, x, y, null, 7, false, 20, 0, tm, false);
            p.asSpellArc(120, "barrel");
            p.barrelGoblins = true;
            this.projs.push(p);
        } else if (c.n === "Royale Delivery") {
            let shape = this.getSpellRadius(c);
            let rad = shape && shape.type === 'circle' ? shape.val : 60;
            this.projs.push(new Proj(x, y, x, y, null, 0, false, rad, c.d, tm, false).asBrownArea());
            let recruit = this.getCard("Royal Recruits");
            this.ents.push(new Troop(tm, x, y, recruit));
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
            this.projs.push(p);
        } else if (c.n === "Barbarian Barrel") {
            // 3x shorter than log (303 / 3 = 101)
            let dist = 101;
            let ty = (tm === 0) ? y - dist : y + dist;
            let p = new Proj(x, y, x, ty, null, 2.66, false, 60, Math.floor(c.d), tm, false).asBarbBarrelLog();
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
                clone.hp = 1;
                clone.mhp = 1;
                clone.isClone = true;
                if (t.c.n === "Royal Recruits") {
                    clone.shield = 1;
                    clone.maxShield = 1;
                }
                this.ents.push(clone);
            }
        } else if (c.t === 2) {
            let shape = this.getSpellRadius(c);
            let rad = shape && shape.type === 'circle' ? shape.val : 60;
            let dmg = c.d; // real Level 11 spell damage from the card table

            // Thrown spells launch from the caster's king tower and arc to the
            // target; speed/arc height depend on the spell.
            const ARC = {
                "Fireball": { spd: 9, arc: 130, kind: "fireball" },
                "Rocket": { spd: 7, arc: 160, kind: "rocket" },
                "Giant Snowball": { spd: 10, arc: 110, kind: "snowball" }
            };
            if (c.n === "Arrows") {
                // Arrows drop on the target as a 3-wave volley (not from the tower).
                this.projs.push(new Proj(x, y, x, y, null, 0, true, rad, dmg, tm, false).asArrows());
            } else if (ARC[c.n]) {
                let kt = (tm === 0) ? this.t1K : this.t2K;
                let cfg = ARC[c.n];
                let p = new Proj(kt.x, kt.y, x, y, null, cfg.spd, false, rad, dmg, tm, false);
                p.asSpellArc(cfg.arc, cfg.kind);
                if (c.n === "Fireball") p.hasKnockback = true;
                this.projs.push(p);
            } else {
                // Placed spells fall from the sky as a symbol, then resolve.
                let p = new Proj(x, y, x, y, null, 0, true, rad, dmg, tm, false);
                if (c.n === "Zap") { p.asStun(); p.asSpellDrop("zap", "#5ec8ff", 20); }
                else if (c.n === "Vines") { p.isRoot = true; p.asSpellDrop("vines", "#7ad06a", 28); }
                else if (c.n === "Freeze") { p.isFreeze = true; p.asSpellDrop("freeze", "#bfe8ff", 32); }
                else { p.life = 26; } // any other placed spell still gets a short wind-up
                this.projs.push(p);
            }
        } else if (["Archers", "Spear Goblins", "Wall Breakers"].includes(c.n)) {
            this.ents.push(new Troop(tm, x - 15, y, c));
            this.ents.push(new Troop(tm, x + 15, y, c));
            if (c.n.includes("Spear")) this.ents.push(new Troop(tm, x, y + 15, c));
        } else if (["Skeletons", "Goblins"].includes(c.n)) {
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
            for (let i = 0; i < 15; i++)
                this.ents.push(new Troop(tm, x + this.random() * 60 - 30, y + this.random() * 60 - 30, this.getCard("Skeletons")));
        } else if (c.n === "Bats") {
            for (let i = 0; i < 5; i++)
                this.ents.push(new Troop(tm, x + this.random() * 40 - 20, y + this.random() * 40 - 20, c));
        } else if (c.n === "Barbarians") {
            this.ents.push(new Troop(tm, x - 12, y - 12, c));
            this.ents.push(new Troop(tm, x + 12, y - 12, c));
            this.ents.push(new Troop(tm, x - 12, y + 12, c));
            this.ents.push(new Troop(tm, x + 12, y + 12, c));
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
            let cy = 800 - s.y;
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

        let rate = this.isDoubleElixir ? 0.02 : 0.01;
        this.p1.elx = Math.min(10, this.p1.elx + rate);
        if (this.isMultiplayer) {
            this.p2.elx = Math.min(10, this.p2.elx + rate); // Identical rate for multiplayer lockstep
        } else {
            this.p2.elx = Math.min(10, this.p2.elx + rate * 0.85); // 15% slower than player for AI
        }

        this.aiTick++;

        this.t1K.actv = (this.t1K.hp < this.t1K.mhp) || (this.t1L.hp <= 0) || (this.t1R.hp <= 0);
        this.t2K.actv = (this.t2K.hp < this.t2K.mhp) || (this.t2L.hp <= 0) || (this.t2R.hp <= 0);

        if (this.enemyAI && !this.isMultiplayer) this.enemyAI.update();

        // Stuck Push
        for (let e of this.ents) {
            if (e instanceof Tower || e instanceof Building || e.fly) continue;
            for (let b of this.ents) {
                if (b instanceof Tower) {
                    let hR = this.getHitboxRadius(b);
                    let cR = hR * 0.25;
                    let iB = hR - cR;
                    let cx = Math.max(b.x - iB, Math.min(b.x + iB, e.x));
                    let cy = Math.max(b.y - iB, Math.min(b.y + iB, e.y));
                    let dx = e.x - cx;
                    let dy = e.y - cy;
                    let dist = Math.hypot(dx, dy);

                    if (dist === 0 && Math.abs(e.x - b.x) < iB && Math.abs(e.y - b.y) < iB) {
                        let dL = Math.abs(e.x - (b.x - iB)), dR = Math.abs(e.x - (b.x + iB));
                        let dT = Math.abs(e.y - (b.y - iB)), dB = Math.abs(e.y - (b.y + iB));
                        let min = Math.min(Math.min(dL, dR), Math.min(dT, dB));
                        if (min === dL) dx = -1;
                        else if (min === dR) dx = 1;
                        else if (min === dT) dy = -1;
                        else dy = 1;
                        dist = 0.1;
                    }

                    let req = cR + this.getHitboxRadius(e) + 3;
                    if (dist < req) {
                        let pen = req - dist;
                        let pushSpeed = pen / 12.0;
                        if (dist > 0) {
                            e.x += (dx / dist) * pushSpeed;
                            e.y += (dy / dist) * pushSpeed;
                        } else {
                            e.x += dx * pushSpeed;
                            e.y += dy * pushSpeed;
                        }
                    }
                } else if (b instanceof Building) {
                    let dist = e.dist(b);
                    let combinedHitbox = this.getHitboxRadius(e) + this.getHitboxRadius(b);
                    if (dist < combinedHitbox) {
                        let dx = e.x - b.x;
                        let dy = e.y - b.y;
                        let len = Math.hypot(dx, dy);
                        if (len === 0) { dx = 1; dy = 0; len = 1; }
                        e.x += (dx / len) * 2.0;
                        e.y += (dy / len) * 2.0;
                    }
                }
            }
        }

        // Physics
        for (let i = 0; i < this.ents.length; i++) {
            let a = this.ents[i];
            for (let j = i + 1; j < this.ents.length; j++) {
                let b = this.ents[j];
                if (a.fly !== b.fly) continue;

                let aIsTower = a instanceof Tower;
                let bIsTower = b instanceof Tower;

                if (aIsTower || bIsTower) {
                    let t = aIsTower ? a : b;
                    let u = aIsTower ? b : a;
                    if (u instanceof Tower) continue;

                    let hR = this.getHitboxRadius(t);
                    let cR = hR * 0.25;
                    let iB = hR - cR;
                    let cx = Math.max(t.x - iB, Math.min(t.x + iB, u.x));
                    let cy = Math.max(t.y - iB, Math.min(t.y + iB, u.y));
                    let dx = u.x - cx, dy = u.y - cy;
                    let dist = Math.hypot(dx, dy);
                    let req = cR + this.getHitboxRadius(u);

                    if (dist < req) {
                        let pen = req - dist;
                        if (dist === 0) {
                            dx = this.random() - 0.5;
                            dy = this.random() - 0.5;
                            dist = 0.1;
                        }
                        u.x += (dx / dist) * pen;
                        u.y += (dy / dist) * pen;
                    }
                    continue;
                }

                let aIsBuilding = a instanceof Building;
                let bIsBuilding = b instanceof Building;
                let radA = aIsBuilding ? this.getHitboxRadius(a) : a.rad;
                let radB = bIsBuilding ? this.getHitboxRadius(b) : b.rad;

                let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy, r = radA + radB;
                if (d2 < r * r) {
                    let d = Math.sqrt(d2);
                    let pen = r - d;
                    if (d === 0) {
                        d = 0.1;
                        dx = this.random() - 0.5;
                        dy = this.random() - 0.5;
                    }

                    if (a.mass > b.mass) {
                        b.x -= (dx / d) * pen;
                        b.y -= (dy / d) * pen;
                    } else if (b.mass > a.mass) {
                        a.x += (dx / d) * pen;
                        a.y += (dy / d) * pen;
                    } else {
                        let halfPen = pen / 2.0;
                        a.x += (dx / d) * halfPen;
                        a.y += (dy / d) * halfPen;
                        b.x -= (dx / d) * halfPen;
                        b.y -= (dy / d) * halfPen;
                    }
                }
            }
        }

        for (let i = 0; i < this.ents.length; i++) {
            let e = this.ents[i];
            if (e.fr > 0) e.fr--;
            if (e.rt > 0) e.rt--;

            if (!(e instanceof Tower) && !(e instanceof Building)) {
                let visualR = e.rad;
                e.x = Math.max(visualR, Math.min(this.W - visualR, e.x));
                e.y = Math.max(visualR, Math.min(this.H - 140 - visualR, e.y));
                if (e.y + visualR > this.RIV_Y - 15 && e.y - visualR < this.RIV_Y + 15 && !e.fly) {
                    let onBridge = (e.x >= this.W / 4 - 30 && e.x <= this.W / 4 + 30) || (e.x >= this.W * 3 / 4 - 30 && e.x <= this.W * 3 / 4 + 30);
                    if (!onBridge) {
                        // Hold at the near bank but slide toward the nearest bridge,
                        // so units funnel onto it and cross instead of getting stuck.
                        let bx = (e.x < this.W / 2) ? this.W / 4 : this.W * 3 / 4;
                        e.x += Math.max(-2.5, Math.min(2.5, bx - e.x));
                        e.y = e.y < this.RIV_Y ? this.RIV_Y - 15 - visualR : this.RIV_Y + 15 + visualR;
                    }
                }
            }
            if (e.fr <= 0 && e.hp > 0) e.act(this);
            if (e.hp <= 0) {
                e.die(this);
                this.ents.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.projs.length; i++) {
            let p = this.projs[i];
            p.upd(this);
            if (p.life <= 0) {
                this.projs.splice(i, 1);
                i--;
            }
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
