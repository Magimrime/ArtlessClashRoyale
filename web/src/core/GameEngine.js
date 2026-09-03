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
        this.EVO_REQ = { "Barbarians": 1, "Archers": 2, "Inferno Dragon": 2, "Royal Recruits": 1, "Goblin Barrel": 2, "Musketeer": 2, "Wall Breakers": 2, "Mega Knight": 1, "Lumberjack": 2, "Witch": 1, "Skeleton Army": 2, "Skeletons": 2, "Zap": 2, "Ice Spirit": 1, "Royal Giant": 1, "Bats": 2, "Minion Horde": 1, "Royal Hogs": 1 };
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
        this.gameOverTimer = undefined;
        this.win = 0;

        // Multiplayer Stats
        this.isMultiplayer = false;

        // SNAPSHOT INTERPOLATION
        // Deterministic Lockstep doesn't need state buffering

        this.doubleElixirAnim = 0;
        this.sel = null;
        // Sandbox mode: free placement, no elixir/AI/game-over. sandboxNoRiver removes
        // the river+bridge crossing (the "Open" map).
        this.sandbox = false;
        this.sandboxMap = 'default';
        this.sandboxNoRiver = false;
        this.sandboxSide = 0;         // 0 (blue) | 1 (red) — fixes team + placement rules
        this.sandboxNoRules = false;  // world edit: ignore ALL placement limitations
        this.bridgeXs = [this.W / 4, this.W * 3 / 4]; // movable in sandbox world edit
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
            new Card("Knight", 3, 1766, 202, 0.55, 14, 0, 100, 72, 150, false, false),
            new Card("Hopper", 4, 1766, 0, 0, 45, 0, 100, 30, 150, false, false),
            new Card("Archers", 3, 304, 87, 0.55, 128, 0, 100, 54, 150, false, true),
            new Card("Giant", 5, 4091, 254, 0.375, 14, 1, 100, 90, 150, false, false),
            new Card("Fireball", 4, 0, 689, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Rocket", 6, 0, 1484, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Mini PEKKA", 4, 1361, 720, 0.825, 8, 0, 100, 96, 150, false, false),
            new Card("Zap", 2, 0, 192, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Skeletons", 1, 30, 81, 0.825, 8, 0, 100, 60, 150, false, false),
            new Card("Musketeer", 4, 720, 218, 0.55, 158, 0, 100, 60, 150, false, true),
            new Card("Three Musketeers", 9, 883, 204, 0.55, 158, 0, 100, 72, 150, false, true),
            new Card("Cannon", 3, 824, 212, 0, 143, 3, 1800, 54, 165, false, false),
            new Card("Mega Knight", 7, 3993, 268, 0.5, 14, 0, 100, 102, 150, false, false),
            new Card("P.E.K.K.A", 7, 3760, 816, 0.375, 14, 0, 100, 108, 150, false, false),
            new Card("Skeleton Army", 3, 81, 81, 0.825, 8, 0, 100, 60, 150, false, false),
            new Card("Barbarians", 5, 715, 192, 0.45, 8, 0, 100, 78, 150, false, false),
            new Card("Goblin Barrel", 3, 0, 0, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Royale Delivery", 3, 0, 250, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Vines", 2, 0, 44, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Freeze", 4, 0, 115, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Fire Spirit", 1, 230, 207, 1.2, 38, 0, 100, 18, 150, false, true),
            new Card("Ice Spirit", 1, 230, 110, 1.2, 53, 0, 100, 18, 150, false, true),
            new Card("Electro Spirit", 1, 230, 99, 1.2, 53, 0, 100, 18, 150, false, true),
            new Card("Heal Spirit", 1, 231, 110, 1.2, 53, 0, 100, 18, 150, false, true),
            new Card("Arrows", 3, 0, 122, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Minions", 3, 230, 117, 0.75, 26, 0, 100, 60, 150, true, true),
            new Card("Goblin Demolisher", 4, 1100, 130, 0.6, 120, 0, 100, 108, 150, false, true),
            new Card("Goblins", 2, 202, 120, 0.825, 8, 0, 100, 66, 150, false, false),
            new Card("Spear Goblins", 2, 133, 81, 0.825, 143, 0, 100, 102, 150, false, true),
            new Card("Bats", 2, 81, 81, 1, 14, 0, 100, 78, 150, true, true),
            new Card("Poison", 4, 0, 70, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Wizard", 5, 720, 281, 0.55, 143, 0, 100, 84, 150, false, true),
            new Card("Witch", 5, 838, 134, 0.55, 143, 0, 100, 66, 150, false, true),
            new Card("Graveyard", 5, 0, 0, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Mega Minion", 3, 837, 311, 0.5, 48, 0, 100, 90, 150, true, true),
            new Card("Minion Horde", 5, 230, 117, 0.75, 26, 0, 100, 60, 150, true, true),
            new Card("Baby Dragon", 4, 1152, 160, 0.75, 83, 0, 100, 90, 150, true, true),
            new Card("Inferno Dragon", 4, 1294, 10, 0.5, 83, 0, 100, 24, 150, true, true),
            new Card("Inferno Tower", 5, 1749, 10, 0, 158, 3, 1800, 24, 180, false, true),
            new Card("Golem", 8, 5120, 312, 0.375, 8, 1, 100, 150, 150, false, false),
            new Card("Lava Hound", 7, 3811, 54, 0.375, 83, 1, 100, 78, 150, true, false),
            new Card("Elixir Golem", 3, 1568, 254, 0.375, 8, 1, 100, 66, 150, false, false),
            new Card("Elite Barbarians", 6, 1341, 384, 0.825, 14, 0, 100, 84, 150, false, false),
            new Card("Elixir Collector", 6, 1070, 0, 0, 8, 3, 3900, 0, 0, false, false),
            new Card("Zappies", 4, 530, 116, 0.55, 113, 0, 100, 126, 150, false, true),
            new Card("Sparky", 6, 1452, 1331, 0.4125, 128, 0, 100, 240, 150, false, false),
            new Card("Mirror", 1, 0, 0, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Clone", 3, 0, 0, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Wall Breakers", 2, 331, 392, 1.2, 8, 1, 100, 72, 150, false, false),
            new Card("Royal Giant", 6, 3072, 307, 0.375, 128, 1, 100, 102, 150, false, false),
            new Card("Electro Giant", 7, 3856, 163, 0.375, 14, 1, 100, 126, 150, false, false),
            new Card("Bowler", 5, 2080, 288, 0.4125, 98, 0, 100, 150, 150, false, false),
            new Card("Hog Rider", 4, 1696, 318, 0.9, 8, 1, 100, 96, 150, false, false),
            new Card("Royal Hogs", 5, 837, 74, 0.9, 8, 1, 100, 72, 150, false, false),
            new Card("Prince", 5, 1920, 392, 0.55, 26, 0, 100, 84, 150, false, false),
            new Card("Mother Witch", 4, 532, 133, 0.55, 143, 0, 100, 60, 150, false, true),
            new Card("The Log", 2, 0, 290, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Barbarian Barrel", 2, 0, 241, 0, 0, 2, 0, 0, 0, false, false),
            new Card("Royal Recruits", 7, 532, 133, 0.55, 26, 0, 100, 78, 150, false, false),
            new Card("Dark Prince", 4, 1200, 248, 0.55, 14, 0, 100, 78, 150, false, false),
            new Card("Crate", 2, 300, 0, 0, 0, 3, 1800, 0, 0, false, false),
            new Card("Ice Golem", 2, 1197, 84, 0.375, 8, 1, 100, 150, 150, false, false),
            new Card("Lumberjack", 4, 1244, 150, 1.1, 14, 0, 100, 60, 150, false, false),
            new Card("Rage", 2, 0, 140, 0, 0, 2, 0, 0, 0, false, true),
            new Card("Balloon", 5, 1421, 644, 0.75, 14, 1, 100, 120, 150, true, false),
            // Skeleton Barrel: real L11 stats — 625 hp, no attack of its own; d=105 is
            // the area DEATH damage when it pops, dropping 7 Skeletons (see Troop.js).
            // Fast flying building-targeter (same engine speed as the other Fast fliers).
            new Card("Skeleton Barrel", 3, 625, 105, 1.0, 14, 1, 100, 78, 150, true, false),
            // Three more real buildings (real L11 stats):
            // Tesla — 954 hp, 190 dmg, 1.1s hit speed, 5.5-tile range, hits air, 35s life.
            new Card("Tesla", 4, 954, 190, 0, 165, 3, 2100, 66, 180, false, true),
            // Bomb Tower — 1059 hp, 222 splash dmg, 1.6s, 6 tiles, ground only, 25s life;
            // drops a fused death bomb (222) when it goes down (see Building.die).
            new Card("Bomb Tower", 4, 1059, 222, 0, 180, 3, 1500, 96, 200, false, false),
            // Tombstone — 422 hp, spawns Skeletons in PAIRS (2 every 7s — the real
            // cadence; rt=420 is the spawn interval), 4 burst out on death, 40s life.
            new Card("Tombstone", 3, 422, 0, 0, 0, 3, 2400, 420, 0, false, false),
            // Firecracker — real L11: 3 elixir, 300 hp, 168 spark-burst splash, 3s hit
            // speed, 6-tile range (engine scale ≈150), Fast, hits air; her shot kicks
            // HER backward (see Troop.js).
            new Card("Firecracker", 3, 300, 168, 0.825, 150, 0, 100, 180, 160, false, true),
            // Valkyrie — real L11: 4 elixir, 2224 hp, 322 damage, 1.5s hit speed (rt=90),
            // Medium, melee "long", ground only. Her swing is a 360° SPIN that hits every
            // ground enemy around her, not just her target (see Troop.js).
            new Card("Valkyrie", 4, 2224, 322, 0.55, 20, 0, 100, 90, 150, false, false),
            // Executioner — real L11: 5 elixir, 1289 hp, 267 area damage, 2.4s hit speed
            // (rt=144), Medium, 4.5-tile range (≈117), hits air. Throws a spinning AXE
            // that flies out and BOOMERANGS back, hitting everything on both passes.
            new Card("Executioner", 5, 1289, 267, 0.55, 117, 0, 100, 144, 150, false, true),
            // Giant Snowball — real L11: 2 elixir, 159 damage in a 2.5-tile radius; slows
            // (35% for 2.5s) and knocks back. Its arc + radius were already wired up.
            new Card("Giant Snowball", 2, 0, 159, 0, 0, 2, 0, 0, 0, false, true),
            // Hunter — real L11: 4 elixir, 885 hp, 84 damage x10 pellets (840 point-blank),
            // 2.2s hit speed (rt=132), Medium, 4-tile range (120px - hitbox), air + ground.
            // The pellets fan out in a cone and each stops at the first thing it hits, so
            // he shreds up close and only clips at range — the whole point of the card.
            new Card("Hunter", 4, 885, 84, 0.5, 104, 0, 100, 132, 150, false, true),
            // Electro Wizard — real L11: 4 elixir, 714 hp, 115 damage to TWO targets per
            // attack, each hit stuns 0.5s, 1.8s hit speed (rt=108), Fast, 5-tile range,
            // air + ground. Lands with a spawn zap: 192 damage + 0.5s stun in 3 tiles.
            new Card("Electro Wizard", 4, 714, 115, 0.75, 132, 0, 100, 108, 150, false, true),
            // Bandit — real L11: 3 elixir, 906 hp, 194 damage, 1.0s hit speed (rt=60),
            // Fast, short melee, ground only. DASH: a ground target 3.5-6 tiles away is
            // charged in 0.8s for 389 (double) damage, and she cannot be hit on the way.
            new Card("Bandit", 3, 906, 194, 0.75, 12, 0, 100, 60, 150, false, false)
        ];

        // Role tags drive the enemy AI's counter logic. (Stats above are already
        // real Level 11 values, so no scaling is applied.)
        this.allCards.forEach(c => { c.tags = this.getCardTags(c); });

        this.tokens = [
            // Season-77 rework: Three Musketeers deploy ELITE Musketeers — tankier
            // (883 vs 720 hp), slower-firing (1.2s vs 1.0s), slightly weaker shots
            // (204 vs 218), plus a 314-damage bayonet MELEE vs close ground targets.
            new Card("Elite Musketeer", 0, 883, 204, 0.5, 158, 0, 100, 72, 150, false, true),
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
            "Goblin Barrel", "Graveyard", "Balloon", "Skeleton Barrel"]))
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
            "Dark Prince", "Mother Witch", "Valkyrie", "Executioner", "Firecracker",
            "Bomb Tower"]))
            tags.push("AOE");

        // High single-target DPS: melts tanks and win conditions.
        if (has(["Mini PEKKA", "P.E.K.K.A", "Musketeer", "Inferno Dragon",
            "Sparky", "Prince", "Elite Barbarians", "Mega Minion", "Wizard",
            "Three Musketeers", "Elite Musketeer", "Lumberjack",
            "Hunter", "Electro Wizard", "Bandit"]))
            tags.push("DamageDealer");

        // Direct-damage / effect spells the AI can throw at a threat.
        if (has(["Fireball", "Zap", "Arrows", "Poison", "Freeze", "Vines",
            "The Log", "Barbarian Barrel", "Royale Delivery", "Giant Snowball"]))
            tags.push("Spell");

        // Defensive buildings.
        if (c.t === 3) tags.push("Building");

        return tags;
    }

    // Sandbox: a free-play arena with no opponent, elixir, or win condition. Maps
    // (every map has the two king towers):
    //   'default' — river + bridges + kings + princess towers (the standard arena)
    //   'tower'   — river + bridges + kings only
    //   'open'    — no river / bridges, kings only
    //   'heist'   — river + bridges + kings that have NO turret (can't shoot)
    setupSandbox(map) {
        this.sandbox = true;
        this.sandboxMap = map || 'default';
        // 'open' and 'blank' have no river. ('blank' also has no towers.)
        this.sandboxNoRiver = (this.sandboxMap === 'open' || this.sandboxMap === 'blank');
        // Reset world-edit geometry (side / rules prefs survive map switches).
        this.RIV_Y = 405;
        this.bridgeXs = [this.W / 4, this.W * 3 / 4];
        // '3 Bridges': an extra crossing straight up the middle.
        if (this.sandboxMap === 'bridges3') this.bridgeXs = [this.W / 6, this.W / 2, this.W * 5 / 6];
        // 'Fortress': the river is a MOAT hugging the enemy base — their towers sit
        // behind it and the only way in is one central bridge.
        if (this.sandboxMap === 'fortress') { this.RIV_Y = 250; this.bridgeXs = [this.W / 2]; }
        if (this.sandboxSide !== 0 && this.sandboxSide !== 1) this.sandboxSide = 0; // always a chosen side
        this.p1 = new Player(0);
        this.p2 = new Player(1);
        this.ents = [];
        this.projs = [];
        this.deploys = [];
        this.sel = null;
        this.over = false;
        this.gameOverTimer = undefined;
        this.tiebreaker = false;
        this.isDoubleElixir = false;
        this.aiTick = 0;
        this.gameStart = Date.now();
        this.nextEntityId = 1;
        this.enemyAI = null;
        this.t1L = this.t1R = this.t2L = this.t2R = this.t1K = this.t2K = null;
        // 'river' (river only) and 'blank' (empty) have NO towers at all.
        const hasKings = (this.sandboxMap !== 'river' && this.sandboxMap !== 'blank');
        if (hasKings) {
            this.t1K = new Tower(0, this.W / 2, 735, true); this.ents.push(this.t1K);
            this.t2K = new Tower(1, this.W / 2, 75, true); this.ents.push(this.t2K);
            // Kings start ASLEEP (like a real match) and wake when attacked — see the
            // sandbox activation check in upd().
            if (this.sandboxMap === 'heist') {
                // Heist: bare kings with no turret — they can't shoot at all.
                this.t1K.noTurret = true; this.t2K.noTurret = true;
            }
        }
        if (['default', 'bridges3', 'fortress'].includes(this.sandboxMap)) {
            this.t1L = new Tower(0, this.W / 4, 645, false); this.ents.push(this.t1L);
            this.t1R = new Tower(0, this.W * 3 / 4, 645, false); this.ents.push(this.t1R);
            this.t2L = new Tower(1, this.W / 4, 165, false); this.ents.push(this.t2L);
            this.t2R = new Tower(1, this.W * 3 / 4, 165, false); this.ents.push(this.t2R);
        }
    }

    // Sandbox placement: no elixir. Every placement is the CHOSEN side's team and
    // that side's normal placement rules apply (unless world-edit rules are off).
    // useEvo spawns the evolved version of evo-capable cards.
    sandboxPlace(c, x, y, useEvo = false) {
        if (!this.sandbox || !c) return false;
        let side = this.sandboxSide;
        let tm = (side === 0 || side === 1) ? side : ((y < this.RIV_Y) ? 1 : 0);
        if (!this.isValid(y, x, c, tm)) return false;
        this.addU(tm, c, x, y, useEvo && this.isEvoCapable(c.n));
        return true;
    }

    // Sandbox eraser: delete the troop/building (not a tower) under the point.
    sandboxErase(x, y) {
        let best = null, bd = 1e9, bi = -1;
        for (let i = 0; i < this.ents.length; i++) {
            let e = this.ents[i];
            if (e.constructor.name === "Tower") continue;
            let ey = e.y - (e.fly ? 22 : 0);
            let d = Math.hypot(e.x - x, ey - y);
            if (d < Math.max(e.rad, 14) + 8 && d < bd) { bd = d; best = e; bi = i; }
        }
        if (best) { this.ents.splice(bi, 1); return true; } // no death effects on erase
        return false;
    }

    // Sandbox: wipe every troop and building (towers stay).
    sandboxClearTroops() {
        this.ents = this.ents.filter(e => e.constructor.name === "Tower");
        this.projs = [];
        this.deploys = [];
    }

    // Sandbox world edit: drop an EXTRA tower (king or princess). Team follows the
    // chosen side, otherwise the half it lands on. Skips overlapping structures.
    sandboxPlaceTower(kind, x, y) {
        if (!this.sandbox) return false;
        if (y < 60 || y > 750) return false;
        let side = this.sandboxSide;
        let tm = (side === 0 || side === 1) ? side : ((y < this.RIV_Y) ? 1 : 0);
        let rad = kind === 'king' ? 50 : 36;
        for (let e of this.ents) {
            if ((e.constructor.name === "Tower" || e.constructor.name === "Building") && e.hp > 0) {
                if (Math.hypot(e.x - x, e.y - y) < e.rad + rad) return false;
            }
        }
        let t = new Tower(tm, x, y, kind === 'king');
        t.actv = true;
        if (this.sandboxMap === 'heist') { t.noTurret = true; t.actv = false; }
        this.ents.push(t);
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

        // NOTE: the enemy-deck selection is NOT restored from the save — otherwise a deck
        // built once in the debug screen would pin the opponent's deck for every future
        // match. Normal play always rolls a fresh role-balanced random deck (generateDeck).
        this.enemyDeckSelection = [];

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

        // Three Musketeers ships unlocked for existing saves, so it's choosable
        // everywhere (deck builder + sandbox), not stuck in the locked pool.
        let tm3 = this.getCard("Three Musketeers");
        if (tm3 && !this.unlockedCards.includes(tm3)) this.unlockedCards.push(tm3);
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

        // Leave sandbox mode and restore any world-edited geometry.
        this.sandbox = false;
        this.sandboxNoRiver = false;
        this.RIV_Y = 405;
        this.bridgeXs = [this.W / 4, this.W * 3 / 4];

        this.p1 = new Player(0);
        this.p2 = new Player(1);
        this.ents = [];
        this.projs = [];
        this.deploys = [];
        this.sel = null;
        this.over = false;
        this.gameOverTimer = undefined;
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
        if (this.sandbox) {
            if (y < 0 || y > 810) return false;
            // Sandbox drops without the side restriction, but spells (and "rules off")
            // still go anywhere.
            if (this.sandboxNoRules || c.t === 2 || c.n === "Goblin Barrel") return true;
            // You still can't drop a troop/building IN the river (only the bridges cross it).
            if (!this.sandboxNoRiver && y > this.RIV_Y - 15 && y < this.RIV_Y + 15) {
                let onBridge = (this.bridgeXs || []).some(bx => Math.abs(x - bx) < 30);
                if (!onBridge) return false;
            }
            // …and you can't place on top of a tower or building.
            for (let e of this.ents) {
                let isStruct = e.constructor.name === "Building" || e.constructor.name === "Tower";
                if (isStruct && e.hp > 0) {
                    let gap = this.getHitboxRadius(e) + this.getVisualRadius(c) * (c.t === 3 ? 0.9 : 0.45);
                    if (Math.abs(e.x - x) < gap && Math.abs(e.y - y) < gap) return false;
                }
            }
            return true;
        }
        if (c.n === "The Log" || c.n === "Barbarian Barrel" || c.n === "Royale Delivery") {
            // Log/BarbBarrel must be placed on player's side (roughly) unless tower down
            // P1 (tm=0) plays on bottom (y > RIV_Y), P2 (tm=1) plays on top (y < RIV_Y)

            if (tm === 0) {
                // Player Logic — can be thrown right up to the river's edge.
                if (this.t2L && this.t2L.hp <= 0 && x < this.W / 2 && y >= 200) return true; // Pocket Left
                if (this.t2R && this.t2R.hp <= 0 && x > this.W / 2 && y >= 200) return true; // Pocket Right
                if (y < this.RIV_Y + 5) return false;
                return true;
            } else {
                // Enemy Logic
                if (this.t1L && this.t1L.hp <= 0 && x < this.W / 2 && y <= this.H - 200) return true; // Pocket Left
                if (this.t1R && this.t1R.hp <= 0 && x > this.W / 2 && y <= this.H - 200) return true; // Pocket Right
                if (y > this.RIV_Y - 5) return false;
                return true;
            }
        }
        if (c.t === 2 || c.n === "Goblin Barrel") return true;

        // Placement spans exactly one tile behind each king tower (y 0..810).
        if (y < 0 || y > 810) return false;

        // Can't place a troop or building on top of an existing building OR a tower
        // (and buildings can't go too close to another building). Towers/buildings
        // are SQUARES, so use a BOX test — otherwise their corners stay placeable.
        for (let e of this.ents) {
            let isStruct = e.constructor.name === "Building" || e.constructor.name === "Tower";
            if (isStruct && e.hp > 0) {
                let gap = this.getHitboxRadius(e) + this.getVisualRadius(c) * (c.t === 3 ? 0.9 : 0.45);
                if (Math.abs(e.x - x) < gap && Math.abs(e.y - y) < gap) return false;
            }
        }

        // The Skeleton Barrel is only ever dropped on your OWN half — it flies the
        // rest of the way itself — so, unlike other troops, it gets no pocket
        // placement on the enemy side when one of their towers is down.
        if (c.n === "Skeleton Barrel") return tm === 0 ? y >= this.RIV_Y + 15 : y <= this.RIV_Y - 15;

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
        const RY = this.RIV_Y || 405;
        const bxs = this.bridgeXs || [this.W / 4, this.W * 3 / 4];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let cx = c * T + 15, cy = r * T + 15, ok = 1;
                // River (live position): impassable except the bridge columns. Maps with
                // no river leave the whole field open.
                if (!this.sandboxNoRiver && Math.abs(cy - RY) <= 15) {
                    ok = bxs.some(bx => Math.abs(cx - bx) <= 16) ? 1 : 0;
                }
                grid[r * COLS + c] = ok;
            }
        }
        for (let e of this.ents) {
            if ((e instanceof Tower || e instanceof Building) && e.hp > 0 && !e.teslaHidden) {
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
    // The line is tested as a CORRIDOR (centre + two side offsets) so the pulled
    // segment leaves room for the troop's body — a rope pulled tight against a
    // tower corner would otherwise shove the walker off its own path.
    _simplifyPath(sx, sy, pts, pass, T) {
        const clear = (ax, ay, bx, by) => {
            let dx = bx - ax, dy = by - ay;
            let len = Math.hypot(dx, dy) || 1;
            let px = -dy / len * 9, py = dx / len * 9; // perpendicular half-width
            let n = Math.ceil(len / 10);
            for (let i = 1; i < n; i++) {
                let x = ax + dx * i / n, y = ay + dy * i / n;
                if (!pass(Math.floor(x / T), Math.floor(y / T))) return false;
                if (!pass(Math.floor((x + px) / T), Math.floor((y + py) / T))) return false;
                if (!pass(Math.floor((x - px) / T), Math.floor((y - py) / T))) return false;
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
        if (c.n === "Rage") return { type: 'circle', val: 72 }; // matches the Lumberjack's dropped rage
        if (c.n === "Freeze") return { type: 'circle', val: 67 };
        if (c.n === "Vines") return { type: 'circle', val: 52 };
        if (c.n === "Zap") return { type: 'circle', val: 64 }; // a touch bigger
        if (c.n === "Fireball") return { type: 'circle', val: 55 }; // slightly bigger
        if (c.n === "Giant Snowball") return { type: 'circle', val: 55 };
        if (c.n === "Royale Delivery") return { type: 'circle', val: 58 };
        if (c.n === "Rocket") return { type: 'circle', val: 43 };
        if (c.n === "The Log") return { type: 'rect', w: 83, h: 16 };
        if (c.n === "Barbarian Barrel") return { type: 'rect', w: 46, h: 16 };
        if (c.n === "Goblin Barrel") return { type: 'circle', val: 31 };
        if (c.n === "Clone") return { type: 'circle', val: 79 };
        // NOTE: spirits are TROOPS, not spells — they must return null here. Returning a
        // (truthy) zero-radius shape made the placement preview render them down the SPELL
        // path, whose white "center marker" dot looked like a stray gray dot under the
        // hover ghost. With null they take the troop path (proper body + splash preview).

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

        // Building Placement Check (Don't place on top of buildings/towers — box
        // test so the square corners of a structure block too).
        if (cardToPlay.t === 3) {
            let newVisualRad = this.getVisualRadius(cardToPlay);
            for (let e of this.ents) {
                if (e instanceof Tower || e instanceof Building) {
                    let gap = e.rad + newVisualRad + 3;
                    if (Math.abs(x - e.x) < gap && Math.abs(y - e.y) < gap) return;
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

    // Centre-column placement (either of the two middle tiles) splits multi-unit
    // cards so the units head to OPPOSITE lanes, like real CR.
    isMidSplit(x) { return Math.abs(x - this.W / 2) <= 30; }

    // Deploy FORMATIONS — the single source of truth for where a card's units
    // stand, used both when PLACING and for the card face art (so the card shows
    // exactly the formation you'll get). Offsets are px from the placement point.
    getFormation(n) {
        if (!this._formations) {
            const spiral = [];
            for (let i = 0; i < 15; i++) {
                let ang = i * 2.39996, rr = Math.sqrt((i + 0.5) / 15) * 48;
                spiral.push([Math.cos(ang) * rr, Math.sin(ang) * rr]);
            }
            this._formations = {
                "Archers": [[-8, 0], [8, 0]],
                "Spear Goblins": [[-15, 0], [15, 0], [0, 15]],
                // Close (but not touching) — the centre-placement lane SPLIT comes
                // from the pathfinding (laneAssign), not from spawning them apart.
                "Wall Breakers": [[-10, 0], [10, 0]],
                "Skeletons": [[0, -8], [-7, 6.5], [7, 6.5]],
                "Goblins": [[0, -12], [-12, 0], [12, 0], [0, 12]],
                "Minions": [[0, -10], [-10, 10], [10, 10]],
                // Two neat rows of three, like the real deploy.
                "Minion Horde": [[-24, -10], [0, -10], [24, -10], [-24, 10], [0, 10], [24, 10]],
                "Skeleton Army": spiral,
                "Bats": [[-18, -8], [0, -14], [18, -8], [-10, 10], [10, 10]],
                // A pentagon ring around the drop point.
                "Barbarians": [[0, -22], [21, -7], [13, 18], [-13, 18], [-21, -7]],
                "Elite Barbarians": [[-18, 0], [18, 0]],
                // A triangle, like the skeletons.
                "Zappies": [[0, -12], [-14, 10], [14, 10]],
                "Royal Hogs": [[-30, 0], [-10, 0], [10, 0], [30, 0]],
                // Royal Recruits guard the WHOLE lane width.
                "Royal Recruits": [[-225, 0], [-135, 0], [-45, 0], [45, 0], [135, 0], [225, 0]],
                // Tight clump (no overlap) — the 1/2 lane split on centre placement is
                // pure pathfinding (laneAssign), not spawn spread.
                "Three Musketeers": [[-15, 0], [15, 0], [0, 17]],
            };
        }
        return this._formations[n] || null;
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
            let kt = this.kingOrigin(tm);
            let p = new Proj(kt.x, kt.y, x, y, null, 2.4, false, 30, 0, tm, false); // 2.5x slower
            p.asSpellArc(150, "barrel");
            p.barrelGoblins = true;
            this.projs.push(p);
            // EVO: a second, FAKE barrel mirrored across the vertical axis. Its
            // goblins look real but deal 70% less damage and attack 30% slower.
            if (c.isEvo) {
                let p2 = new Proj(kt.x, kt.y, this.W - x, y, null, 2.4, false, 30, 0, tm, false);
                p2.asSpellArc(150, "barrel");
                p2.barrelGoblins = true;
                p2.fakeGoblins = true;
                this.projs.push(p2);
            }
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
                if (e instanceof Troop && e.tm === tm && Math.hypot(e.x - x, e.y - y) < rad && !e.isClone && !e.isGhosted && !(e instanceof Building) && !(e instanceof Tower)) {
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
                let kt = this.kingOrigin(tm);
                let cfg = ARC[c.n];
                let p = new Proj(kt.x, kt.y, x, y, null, cfg.spd, false, rad, dmg, tm, false);
                p.asSpellArc(cfg.arc, cfg.kind);
                p.crownMult = crown;
                if (c.n === "Fireball") p.hasKnockback = true;
                // Giant Snowball: a lighter shove than the Fireball's, plus a 35% SLOW
                // for 2.5s on everything it catches.
                if (c.n === "Giant Snowball") { p.hasKnockback = true; p.snowSlow = true; }
                this.projs.push(p);
            } else if (c.n === "Rage") {
                // A pink bottle hops up then splashes into a 5s buff zone.
                this.projs.push(new Proj(x, y, x, y, null, 0, true, rad, dmg, tm, false).asRage(rad, 300));
            } else {
                // Placed spells fall from the sky as a symbol, then resolve.
                let p = new Proj(x, y, x, y, null, 0, true, rad, dmg, tm, false);
                p.crownMult = crown;
                if (c.n === "Zap") {
                    p.asStun();
                    p.tightArea = true; // only units INSIDE the zap circle are hit (no +edge)
                    // EVO Zap: PURPLE/pink lightning that strikes, throws out an expanding
                    // electric ring, then zaps a SECOND time at a slightly larger radius.
                    p.asSpellDrop("zap", c.isEvo ? "#d98cff" : "#7fdcff", 20);
                    if (c.isEvo) p.isEvoZap = true;
                }
                else if (c.n === "Vines") { p.isRoot = true; p.isVines = true; p.life = 12; } // root + ground fliers, no visual
                else if (c.n === "Freeze") { p.isFreeze = true; p.flashCol = "#bfe8ff"; p.life = 12; } // instant, no snowflake
                else { p.life = 26; } // any other placed spell still gets a short wind-up
                this.projs.push(p);
            }
        } else if (this.getFormation(c.n)) {
            // FORMATION cards deploy in their real shapes (shared with the card art —
            // getFormation is the single source of truth). Special pieces ride on top:
            //  - EVO Skeleton Army spawns its shielded GENERAL at the back.
            //  - EVO Minion Horde minions ghost when damaged; EVO Royal Hogs start airborne.
            //  - Three Musketeers actually deploy ELITE Musketeers.
            // Centre placement splits the group BY PATHFINDING: each unit gets a lane
            // from the side it stands on (ties alternate) and walks its own lane — the
            // formation itself is never stretched to fake the split.
            let general = null;
            if (c.n === "Skeleton Army" && c.isEvo) {
                let gy = y + (tm === 0 ? 30 : -30);
                general = new Troop(tm, x, gy, this.getCard("Skeletons"));
                general.isSkeleGeneral = true;
                general.skeleArmyGeneral = general; // self-ref keeps the kill-check uniform
                general.maxShield = 180; general.shield = 180;
                general.rad = Math.round(general.rad * 1.45); general.mass = general.rad;
                this.ents.push(general);
            }
            const unitCard =
                (c.n === "Three Musketeers") ? this.getCard("Elite Musketeer") :
                    (c.n === "Minion Horde") ? this.getCard("Minions") :
                        (c.n === "Skeleton Army") ? this.getCard("Skeletons") : c;
            const split = this.isMidSplit(x);
            this.getFormation(c.n).forEach(([dx, dy], i) => {
                let t = new Troop(tm, x + dx, y + dy, unitCard);
                if (c.n === "Minion Horde" && c.isEvo) t.evoGhostOnHit = true; // EVO: ghosts for 3s whenever damaged
                if (c.n === "Royal Hogs" && c.isEvo) { t.fly = true; t.evoFlyHog = true; } // EVO: airborne until first hit
                if (general) t.skeleArmyGeneral = general;
                if (split) t.laneAssign = dx < -0.5 ? 0 : (dx > 0.5 ? 1 : i % 2);
                this.ents.push(t);
            });
        } else if (c.n === "Electro Wizard") {
            this.ents.push(new Troop(tm, x, y, c));
            // Spawn zap (real L11): 192 damage and a 0.5s stun to everything within
            // 3 tiles, delivered as a real zap strike so it reads like the spell.
            const z = new Proj(x, y, x, y, null, 0, true, 90, 192, tm, false);
            z.asStun(30); z.tightArea = true; z.asSpellDrop("zap", "#7fdcff", 12);
            this.projs.push(z);
        } else if (c.n === "Mega Knight") {
            this.ents.push(new Troop(tm, x, y, c));
            for (let e of this.ents)
                if (e.tm !== tm && !e.fly && Math.hypot(e.x - x, e.y - y) < 100)
                    e.hp -= 340; // spawn-in area damage (real L11)
            // Spawn-slam shockwave visual.
            this.projs.push(new Proj(x, y, x, y, null, 0, false, 100, 0, tm, false).asShockwave());
        } else if (c.t === 3) {
            this.ents.push(new Building(tm, x, y, c));
            this.buildingGen = (this.buildingGen || 0) + 1; // a freshly placed building lets troops re-pick a building target
        } else {
            this.ents.push(new Troop(tm, x, y, c));
        }
    }

    // DEATH PREDICTION: an entity's hp minus every projectile already flying at it.
    // Attackers use this to stop shooting (and retarget) when the target is as good
    // as dead — no more three archers all wasting shots on one doomed skeleton.
    predictedHp(e) {
        let hp = e.hp + (e.shield || 0);
        for (const p of this.projs) {
            if (p.t === e && p.dmg > 0 && p.tm !== e.tm) hp -= p.dmg;
        }
        return hp;
    }

    // Spawn loose units at explicit points (spawner buildings, death bursts).
    // Combat-ready instantly, like other death-spawns.
    spawnLoose(tm, cardName, pts) {
        const c = this.getCard(cardName);
        if (!c) return;
        for (const [px, py] of pts) {
            let t = new Troop(tm, px, py, c);
            t.deployTime = 0;
            this.ents.push(t);
        }
    }

    getCard(n) {
        let c = this.allCards.find(c => c.n === n);
        if (c) return c;
        c = this.tokens.find(c => c.n === n);
        if (c) return c;
        return this.allCards[0];
    }

    // Origin a king-tower-thrown spell (Fireball / Goblin Barrel / …) arcs FROM.
    // Null-safe for tower-less sandbox maps: falls back to the team's back line.
    kingOrigin(tm) {
        let kt = (tm === 0) ? this.t1K : this.t2K;
        if (kt) return { x: kt.x, y: kt.y };
        return { x: this.W / 2, y: (tm === 0) ? 760 : 50 };
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
                // King down: it's already removed/gone from the field. Hold the game-over
                // popup ~0.5s so the tower visibly DISAPPEARS first, then show it.
                if (this.gameOverTimer === undefined) {
                    this.gameOverTimer = 30; // 0.5s
                    this.gameOverWinner = this.t1K.hp <= 0 ? 1 : 0;
                }
            }
            if (this.gameOverTimer !== undefined) {
                if (--this.gameOverTimer <= 0) { this.endGame(this.gameOverWinner); return; }
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
        } else {
            // Sandbox: kings sleep until HIT (or a same-side princess falls on the
            // Default map). Heist kings never wake — they have no turret at all.
            for (const k of [this.t1K, this.t2K]) {
                if (!k || k.noTurret) continue;
                let pk = k.actv;
                let pDown = (k === this.t1K)
                    ? ((this.t1L && this.t1L.hp <= 0) || (this.t1R && this.t1R.hp <= 0))
                    : ((this.t2L && this.t2L.hp <= 0) || (this.t2R && this.t2R.hp <= 0));
                if (!k.actv && (k.hp < k.mhp || pDown)) k.actv = true;
                if (k.actv && !pk) k.activateAnim = 45;
                else if (k.activateAnim > 0) k.activateAnim--;
            }
        }

        if (this.enemyAI && !this.isMultiplayer) this.enemyAI.update();

        // Collision physics (handles tower box-collision, buildings via mass, and
        // unit-vs-unit). One pass per pair — no redundant push loop.
        for (let i = 0; i < this.ents.length; i++) {
            let a = this.ents[i];
            if (a.hp <= 0) continue; // dying units are gone — they don't block
            for (let j = i + 1; j < this.ents.length; j++) {
                let b = this.ents[j];
                if (a.fly !== b.fly || b.hp <= 0) continue;
                // Exactly ONE unit mid-leap is airborne and passes over the grounded one.
                // (Two leapers that MEET are handled in the overlap block below — they cut
                // their jumps short and land where they met, instead of sailing past.)
                if (a.jp !== b.jp) continue;

                let aIsStruct = a instanceof Tower || a instanceof Building;
                let bIsStruct = b instanceof Tower || b instanceof Building;

                if (aIsStruct || bIsStruct) {
                    if (aIsStruct && bIsStruct) continue; // structures never push each other
                    let t = aIsStruct ? a : b;   // the structure
                    let u = aIsStruct ? b : a;   // the unit
                    if (t.teslaHidden) continue; // troops walk right over a buried Tesla
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
                    // Two leapers meet mid-air: cut both jumps SHORT — land them right here
                    // (a smaller jump) so neither hovers or sails past, and each still does
                    // its own jump-land next tick.
                    if (a.jp && b.jp) {
                        a.jdx = a.x; a.jdy = a.y;
                        b.jdx = b.x; b.jdy = b.y;
                        continue;
                    }
                    // Mass-weighted separation (UNCHANGED — smooth, no swarm jitter): the
                    // lighter unit moves more, the heavier barely budges. A Hopper is
                    // IMMOVABLE — nothing pushes past it.
                    let overlap = r - d;
                    let nx = dx / d, ny = dy / d;
                    let aHop = a.c && a.c.n === "Hopper", bHop = b.c && b.c.n === "Hopper";
                    let total = a.mass + b.mass;
                    let aMove = (aHop && !bHop) ? 0 : Math.min(overlap * (b.mass / total), 5);
                    let bMove = (bHop && !aHop) ? 0 : Math.min(overlap * (a.mass / total), 5);
                    if (aHop && !bHop) bMove = Math.min(overlap, 5);
                    if (bHop && !aHop) aMove = Math.min(overlap, 5);
                    // NEVER SLOW DOWN: a walking troop is never shoved BACKWARD along its
                    // own heading by a jostle — the braking component of the push is
                    // rotated into a sideways SLIDE (same magnitude), so crowds flow
                    // around each other instead of grinding to a crawl.
                    const slide = (u, px, py) => {
                        if (!(u instanceof Troop) || u.atk || !u.moveTarget) return [px, py];
                        let hx = u.moveTarget.x - u.x, hy = u.moveTarget.y - u.y;
                        let hl = Math.hypot(hx, hy);
                        if (hl < 0.05) return [px, py];
                        hx /= hl; hy /= hl;
                        const along = px * hx + py * hy;
                        if (along >= 0) return [px, py]; // not braking it
                        let sx = px - along * hx, sy = py - along * hy;
                        let sl = Math.hypot(sx, sy);
                        if (sl < 0.03) { sx = -hy; sy = hx; sl = 1; } // dead-on: pick a side
                        const mag = Math.hypot(px, py) / sl;
                        return [sx * mag, sy * mag];
                    };
                    const [axp, ayp] = slide(a, nx * aMove, ny * aMove);
                    const [bxp, byp] = slide(b, -nx * bMove, -ny * bMove);
                    a.x += axp; a.y += ayp;
                    b.x += bxp; b.y += byp;

                    // Plus a GENTLE sideways nudge in ONE narrow case: a heavier-or-equal
                    // MOVING troop works a LOCKED (attacking, planted) troop out of its lane
                    // so it can squeeze past. Small and one-sided, so it never makes swarms
                    // shake — and a mover that simply can't get through isn't shoved hard.
                    if (!aHop && !bHop) {
                        let blocker = null, mover = null;
                        if (a.atk && !b.atk && b.mass >= a.mass) { blocker = a; mover = b; }
                        else if (b.atk && !a.atk && a.mass >= b.mass) { blocker = b; mover = a; }
                        if (blocker) {
                            let hx = mover.currentTarget ? mover.currentTarget.x - mover.x : mover.x - mover.lx;
                            let hy = mover.currentTarget ? mover.currentTarget.y - mover.y : mover.y - mover.ly;
                            let hl = Math.hypot(hx, hy);
                            if (hl > 0.05) {
                                hx /= hl; hy /= hl;
                                let cross = hx * (blocker.y - mover.y) - hy * (blocker.x - mover.x);
                                let s;
                                if (Math.abs(cross) < 0.5) {
                                    if (blocker.pushSide === undefined) blocker.pushSide = this.random() < 0.5 ? 1 : -1;
                                    s = blocker.pushSide;
                                } else s = cross >= 0 ? 1 : -1;
                                let nudge = Math.min(overlap * 0.5, 1.2);
                                blocker.x += -hy * s * nudge; blocker.y += hx * s * nudge;
                            }
                        }
                    }
                }
            }
        }

        // FINAL guard: a shove from another troop can push a unit INTO a tower/building.
        // After all pushing, eject any ground unit fully back out of every structure so
        // it never clips through one.
        for (let u of this.ents) {
            if (u.hp <= 0 || u.fly || u instanceof Tower || u instanceof Building) continue;
            // Keep every ground unit inside the arena — a hard knockback at the edge can't
            // fling it off (where it would appear to "fly" away); clamp it back in.
            u.x = Math.max(6, Math.min(this.W - 6, u.x));
            u.y = Math.max(6, Math.min(this.H - 150, u.y));
            let uHb = this.getHitboxRadius(u);
            for (let t of this.ents) {
                if (t.hp <= 0 || !(t instanceof Tower || t instanceof Building)) continue;
                let half = t.rad * 0.88 + uHb;
                let dx = u.x - t.x, dy = u.y - t.y;
                if (Math.abs(dx) < half && Math.abs(dy) < half) {
                    let penX = half - Math.abs(dx), penY = half - Math.abs(dy);
                    // Eject at most a few px per tick. A unit that lands deep inside a
                    // structure (e.g. an Evo Mega Knight launches it onto a tower) then
                    // slides out SMOOTHLY over a few frames instead of teleporting out.
                    if (penX <= penY) u.x += (dx < 0 ? -1 : 1) * Math.min(penX, 3.5);
                    else u.y += (dy < 0 ? -1 : 1) * Math.min(penY, 3.5);
                }
            }
        }

        // Rebuild the pathfinding grid every few ticks (and on first use) so troop
        // waypoints route around the current towers / buildings and the river.
        if (!this.navGrid || this.aiTick % 8 === 0) this.buildNavGrid();

        // Snapshot who is alive at the START of the tick (for the mutual-kill draw).
        for (let e of this.ents) e._aliveAtTick = (e.hp > 0);

        for (let i = 0; i < this.ents.length; i++) {
            let e = this.ents[i];
            if (e.fr > 0) e.fr--;
            if (e.rt > 0) e.rt--;
            if (e.ragedTime > 0) e.ragedTime--;
            // Vines grounding: restore flight when it wears off.
            if (e.groundedTime > 0) { e.groundedTime--; if (e.groundedTime === 0 && e.wasFlying) { e.fly = true; e.wasFlying = false; } }
            if (e.vinedTime > 0) {
                e.vinedTime--;
                // Vines DoT: exactly 3 pulses, each hitting HARDER than the last
                // (60, 100, 140 = 300 total, just over The Log's 290 — so it kills
                // everything the Log kills).
                e.vineTick = (e.vineTick || 0) + 1;
                if (e.vineTick >= 12 && (e.vinePulse || 0) < 3) {
                    e.vineTick = 0;
                    e.vinePulse = (e.vinePulse || 0) + 1;
                    e.hp -= [0, 60, 100, 140][e.vinePulse];
                }
                if (e.vinedTime === 0) { e.vineTick = 0; e.vinePulse = 0; }
            }

            // A TROOP acts if it was alive at the START of the tick, or is still in its
            // brief DYING window — so a troop reduced to 0 this tick still lands its blow
            // (mutual kills become draws). Towers/buildings act only while truly alive.
            let mayAct = (e instanceof Troop) ? (e._aliveAtTick || e.dyingTime > 0) : (e.hp > 0);
            if (e.fr <= 0 && mayAct) e.act(this);

            // Clamp position AFTER acting so a unit ends each tick inside the arena
            // and at the river bank (avoids the 1-tick edge/river jitter). Off-bridge
            // units can't enter the water; crossing units slide along to the bridge.
            if (!(e instanceof Tower) && !(e instanceof Building)) {
                let visualR = e.rad;
                e.x = Math.max(visualR, Math.min(this.W - visualR, e.x));
                e.y = Math.max(visualR, Math.min(810 - visualR, e.y));
                // Only clamp a unit whose CENTRE is actually in the water (not one merely
                // skirting the bank near the river) — otherwise a troop walking laterally
                // between the two bridges gets snapped sideways onto a bridge and clips.
                if (!this.sandboxNoRiver && Math.abs(e.y - this.RIV_Y) < 16 && !e.fly) {
                    // In the water but off a bridge: slide back ONTO the nearest bridge
                    // (keeps forward progress) rather than bouncing to the bank.
                    let bx = this.bridgeXs.reduce((a, b) => Math.abs(e.x - a) <= Math.abs(e.x - b) ? a : b);
                    if (Math.abs(e.x - bx) > 30) e.x = Math.max(bx - 30, Math.min(bx + 30, e.x));
                }
            }
        }

        // DEATH pass (after every unit has acted). Handling deaths here — not inline in
        // the act loop — means two troops that bring each other to 0 on the same tick are
        // BOTH marked dying together, so their 3-tick delays stay in sync and they vanish
        // together (a clean draw). Towers/buildings die immediately.
        for (let i = 0; i < this.ents.length; i++) {
            let e = this.ents[i];
            if (e.hp <= 0) {
                // EVO Skeleton Army: a fallen army skeleton RISES again as a translucent
                // ghost instead of dying — for as long as its shielded GENERAL lives.
                let gen = e.skeleArmyGeneral;
                if (gen && gen !== e && gen.hp > 0 && this.ents.includes(gen)) {
                    e.shield = 0; e.maxShield = 0;
                    e._hp = e.mhp;          // rise (bypass the shield setter)
                    e.dyingTime = 0;
                    if (!e.isSkeleGhost) { // first fall — a subtle puff as it turns ghostly
                        e.isSkeleGhost = true;
                        this.projs.push(new Proj(e.x, e.y, e.x, e.y, null, 0, false, 16, 0, e.tm, false).asPhantom());
                    }
                    continue;
                }
                // The GENERAL fell — only the GHOSTS dissolve. The still-living skeletons
                // fight on (but, with no general, can no longer rise again when killed).
                if (e.isSkeleGeneral) {
                    for (let m of this.ents) if (m !== e && m.skeleArmyGeneral === e && m.isSkeleGhost) m._hp = 0;
                }
                // Combat deaths get the 3-tick draw delay; SUICIDE units (spirits / wall
                // breakers that exploded) and towers/buildings die instantly — they have
                // nothing left to strike back with.
                if (e instanceof Troop && !e.exploded) {
                    if (e.dyingTime > 0) {
                        if (--e.dyingTime <= 0) {
                            // Cosmetic death hook (the renderer's fall-over animation).
                            if (this.onUnitDied && !e.isGhosted && !e.isClone) this.onUnitDied(e);
                            e.die(this); this.ents.splice(i, 1); i--;
                        }
                    } else {
                        e.dyingTime = 3;
                    }
                } else {
                    e.die(this); this.ents.splice(i, 1); i--;
                }
            } else if (e.dyingTime) {
                e.dyingTime = 0;
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

        // Tick down deploy-time clock indicators. A clock also ends the instant its unit
        // stops deploying — whether it finished or was killed mid-deploy (a spirit / wall
        // breaker shot down before it could rush). That stops a clock from lingering at
        // the drop point with no unit under it (the gray/red "summon ghost" dot).
        for (let i = 0; i < this.deploys.length; i++) {
            let d = this.deploys[i];
            d.t--;
            let unitDeploying = this.ents.some(e => e.tm === d.tm && e instanceof Troop && e.deployTime > 0 &&
                Math.abs(e.x - d.x) < 60 && Math.abs(e.y - d.y) < 60);
            if (d.t <= 0 || (d.age > 4 && !unitDeploying)) { this.deploys.splice(i, 1); i--; }
            else d.age = (d.age || 0) + 1;
        }
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
