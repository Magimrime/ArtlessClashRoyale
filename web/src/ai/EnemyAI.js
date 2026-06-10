import Card from '../models/Card.js';
import Entity from '../entities/Entity.js';
import Troop from '../entities/Troop.js';

export default class EnemyAI {
    constructor(g) {
        this.g = g;
        this.p = g.p2;
        this.aiTick = 0;
        this.actCd = 0; // ticks until the AI may act again
    }

    generateDeck() {
        let deck = [];
        let pool = [...this.g.allCards];

        if (this.g.enemyDeckSelection.length > 0) {
            deck.push(...this.g.enemyDeckSelection);
        }

        if (!this.hasWinCondition(deck)) {
            let winCon = this.findCard(pool, c => c.t === 1 && c.n !== "Miner" && c.n !== "Goblin Barrel");
            if (winCon) this.addCard(deck, winCon);
        }

        while (this.countType(deck, 2) < 2) {
            let spell = this.findCard(pool, c => c.t === 2);
            if (spell) this.addCard(deck, spell);
            else break;
        }

        if (!this.hasCheapOrMiniTank(deck)) {
            let cheap = this.findCard(pool, c => c.c <= 2 || (c.hp > 800 && c.c <= 4));
            if (cheap) this.addCard(deck, cheap);
        }

        if (!this.hasRanged(deck)) {
            let ranged = this.findCard(pool, c => c.rn > 2 && c.t === 0);
            if (ranged) this.addCard(deck, ranged);
        }

        if (!this.hasBuilding(deck)) {
            let building = this.findCard(pool, c => c.t === 3);
            if (building) this.addCard(deck, building);
        }

        if (!this.hasAreaDamage(deck)) {
            let splash = this.findCard(pool, c => c.ar);
            if (splash) this.addCard(deck, splash);
        }

        while (deck.length < 8) {
            if (pool.length === 0) break;
            let random = pool[Math.floor(Math.random() * pool.length)];
            this.addCard(deck, random);
        }

        this.p.pile = [...deck];
        this.p.h = [];
        // Shuffle pile
        for (let i = this.p.pile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p.pile[i], this.p.pile[j]] = [this.p.pile[j], this.p.pile[i]];
        }

        for (let i = 0; i < 4 && this.p.pile.length > 0; i++) {
            this.p.h.push(this.p.pile.shift());
        }
    }

    hasWinCondition(deck) { return deck.some(c => c.t === 1); }
    countType(deck, type) { return deck.filter(c => c.t === type).length; }
    hasCheapOrMiniTank(deck) { return deck.some(c => c.c <= 2 || (c.hp > 800 && c.c <= 4)); }
    hasRanged(deck) { return deck.some(c => c.rn > 2 && c.t === 0); }
    hasBuilding(deck) { return deck.some(c => c.t === 3); }
    hasAreaDamage(deck) { return deck.some(c => c.ar); }

    findCard(pool, condition) {
        let candidates = pool.filter(condition);
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    addCard(deck, c) {
        if (!deck.includes(c)) deck.push(c);
    }

    update() {
        if (this.g.over) return;
        this.aiTick++;
        if (this.aiTick < 120) return;            // brief opening pause
        if (this.actCd > 0) { this.actCd--; return; }

        const mode = this.computeMode();
        const threats = this.getThreats();

        // 1) Defend genuine threats first.
        if (threats.length > 0 && this.p.elx >= 2) {
            if (this.defend(threats, mode)) { this.actCd = 22; return; }
        }
        // 2) Spend spells on value (clusters) or chip the weak tower when ahead.
        if (this.castValueSpell(mode)) { this.actCd = 28; return; }
        // 3) Offense, gated by mode/elixir.
        if (this.p.elx >= (mode === 'pressure' ? 6 : 9)) {
            if (this.buildPush(mode === 'pressure')) { this.actCd = 38; return; }
        }
        // 4) Avoid leaking at max elixir.
        if (this.p.elx >= 9.7) { this.cycle(); this.actCd = 18; }
    }

    // Strategy mode from the tower score: ahead -> pressure, behind -> defend.
    // This is how the AI decides to go for crowns vs. protect once a tower falls.
    computeMode() {
        const g = this.g;
        const myDown = (g.t2L.hp <= 0 ? 1 : 0) + (g.t2R.hp <= 0 ? 1 : 0);
        const plDown = (g.t1L.hp <= 0 ? 1 : 0) + (g.t1R.hp <= 0 ? 1 : 0);
        if (plDown > myDown) return 'pressure';   // push for the 2nd / 3rd crown
        if (myDown > plDown) return 'defend';      // protect the king tower
        return 'balanced';
    }

    // Player troops on our half / crossing, most dangerous (closest) first.
    getThreats() {
        return this.g.ents
            .filter(e => e.tm === 0 && e instanceof Troop && e.hp > 0 && e.y < 520)
            .sort((a, b) => a.y - b.y);
    }

    affordable() { return this.p.h.filter(c => c.c <= this.p.elx); }

    defend(threats, mode) {
        const threat = threats[0];
        const counter = this.pickCounter(threat);
        if (!counter) return false;

        let playX = Math.max(40, Math.min(500, threat.x));
        let playY = Math.max(70, threat.y - 110);
        if (counter.tags.includes("Building")) { playX = 270; playY = 150; }
        else if (counter.t === 2) { playX = threat.x; playY = threat.y; }
        else if (counter.tags.includes("Swarm")) { playY = threat.y - 45; }
        else if (counter.tags.includes("DamageDealer")) { playY = threat.y - 70; }

        // Kite a win-condition: drop a cheap swarm toward our centre so the
        // win-con chases the bait across, away from the tower.
        if (threat.tags.includes("WinCon") && counter.t !== 2 && counter.tags.includes("Swarm")) {
            playX = 270 + (threat.x < 270 ? 40 : -40);
            playY = 210;
        }

        if (this.g.isValid(playY, playX, counter, 1)) { this.playAI(counter, playX, playY); return true; }
        return false;
    }

    // Densest knot of player troops (used to decide if a spell is worth it).
    cluster(rad) {
        const troops = this.g.ents.filter(e => e.tm === 0 && e instanceof Troop);
        let best = null;
        for (const a of troops) {
            const count = troops.filter(b => Math.hypot(a.x - b.x, a.y - b.y) < rad).length;
            if (!best || count > best.count) best = { x: a.x, y: a.y, count };
        }
        return best;
    }

    castValueSpell(mode) {
        // Damage spell on a tight cluster of player troops.
        const dmg = this.affordable().find(c => ["Fireball", "Arrows", "Poison"].includes(c.n));
        if (dmg) {
            const cl = this.cluster(dmg.n === "Poison" ? 95 : 70);
            if (cl && cl.count >= 3) { this.playAI(dmg, cl.x, cl.y); return true; }
        }
        // When ahead, chip the weaker standing player tower with a spell win-con
        // (Graveyard / Goblin Barrel onto a princess tower).
        if (mode === 'pressure') {
            const ts = this.affordable().find(c => ["Graveyard", "Goblin Barrel"].includes(c.n));
            if (ts && this.p.elx >= ts.c + 1) {
                const g = this.g;
                let t;
                if (g.t1L.hp > 0 && g.t1R.hp > 0) t = g.t1L.hp < g.t1R.hp ? g.t1L : g.t1R;
                else t = g.t1L.hp > 0 ? g.t1L : (g.t1R.hp > 0 ? g.t1R : g.t1K);
                if (t && t.hp > 0) { this.playAI(ts, t.x, t.y); return true; }
            }
        }
        return false;
    }

    buildPush(aggressive) {
        const g = this.g;
        const lane = (g.t1L.hp <= 0) ? 0 : (g.t1R.hp <= 0) ? 1 : (Math.random() > 0.5 ? 0 : 1);
        const laneX = lane === 0 ? 130 : 410;
        const tank = this.p.h.find(c => c.tags.includes("Tank") && c.c <= this.p.elx);
        if (tank) { this.playAI(tank, laneX, 30); return true; }
        const win = this.p.h.find(c => c.tags.includes("WinCon") && c.t !== 2 && c.c <= this.p.elx);
        if (win) { this.playAI(win, laneX, this.g.RIV_Y - 70); return true; }
        const support = this.p.h.find(c => c.t === 0 && (c.rn > 60 || c.tags.includes("AOE")) && c.c <= this.p.elx);
        if (aggressive && support) { this.playAI(support, laneX, 60); return true; }
        return false;
    }

    cycle() {
        const c = this.p.h.find(c => c.t !== 2 && c.t !== 3 && c.c <= this.p.elx);
        if (c) this.playAI(c, Math.random() > 0.5 ? 130 : 410, 40);
    }

    pickCounter(threat) {
        // analyze threat tags
        let isWinCon = threat.tags && threat.tags.includes("WinCon");
        let isTank = threat.tags && threat.tags.includes("Tank");
        let isSwarm = threat.tags && threat.tags.includes("Swarm");
        let isAir = threat.fl;

        // Available cards
        let available = this.p.h.filter(c => c.c <= this.p.elx);

        // 1. Air Threat
        if (isAir) {
            return available.find(c => c.fl || c.rn > 20 || (c.tags && c.tags.includes("Building"))); // Ranged or Building or Flying
        }

        // 2. Swarm Threat
        if (isSwarm) {
            let aoe = available.find(c => c.tags && (c.tags.includes("AOE") || c.tags.includes("Spell")));
            if (aoe) return aoe;
            // Fallback
        }

        // 3. Win Condition (Building Targeter)
        if (isWinCon) {
            // Building > Swarm > High DPS
            let bldg = available.find(c => c.tags && c.tags.includes("Building"));
            if (bldg) return bldg;

            let swarm = available.find(c => c.tags && c.tags.includes("Swarm"));
            if (swarm) return swarm;

            let dps = available.find(c => c.tags && c.tags.includes("DamageDealer"));
            if (dps) return dps;
        }

        // 4. Tank
        if (isTank) {
            let dps = available.find(c => c.tags && (c.tags.includes("DamageDealer") || c.tags.includes("Swarm")));
            if (dps) return dps;
        }

        // 5. Generic Counters
        // Tank distracts DMG Dealer
        if (threat.tags && threat.tags.includes("DamageDealer")) {
            let tank = available.find(c => c.tags && (c.tags.includes("Tank") || c.tags.includes("Swarm")));
            if (tank) return tank;
        }

        // Default: Cheapest effective card
        return available.sort((a, b) => a.c - b.c)[0];
    }

    playAI(c, x, y) {
        if (c.t !== 2 && c.n !== "Goblin Barrel" && y > 400 - 40) return;
        this.p.elx -= c.c;
        this.g.addU(1, c, x, y);

        let idx = this.p.h.indexOf(c);
        if (idx > -1) {
            this.p.h.splice(idx, 1);
            this.p.pile.push(c);
            this.p.h.push(this.p.pile.shift());
        }
    }
}

