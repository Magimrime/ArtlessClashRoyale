import Card from '../models/Card.js';
import Entity from '../entities/Entity.js';
import Troop from '../entities/Troop.js';

export default class EnemyAI {
    constructor(g) {
        this.g = g;
        this.p = g.p2;
        this.aiTick = 0;
        this.actCd = 0; // ticks until the AI may act again
        this.reactTimer = 0; // human-like reaction delay before each decision
    }

    generateDeck() {
        let pool = [...this.g.allCards];
        let deck = [];
        // Seed with any manually-built enemy cards (deduped), THEN always fill out to a
        // full 8-card, role-balanced deck so the AI never ends up with a 1-card deck it
        // just spams. 1 building, 2 spells, and troops covering a tank, damage dealer,
        // swarm, 2 flying and a win condition (roles may overlap); rest filled.
        if (this.g.enemyDeckSelection && this.g.enemyDeckSelection.length > 0) {
            for (let c of this.g.enemyDeckSelection) if (deck.length < 8 && !deck.includes(c)) deck.push(c);
        }
        const tag = (c, t) => c.tags && c.tags.includes(t);
        const count = pred => deck.filter(pred).length;
        const pick = (pred, pref) => {
            let cand = pool.filter(x => !deck.includes(x) && pred(x));
            if (pref) { let pf = cand.filter(pref); if (pf.length) cand = pf; }
            if (cand.length && deck.length < 8) this.addCard(deck, cand[Math.floor(Math.random() * cand.length)]);
        };
        if (count(c => c.t === 3) < 1) pick(c => c.t === 3);                            // 1 building
        while (count(c => c.t === 2) < 2 && deck.length < 8) { let b = deck.length; pick(c => c.t === 2); if (deck.length === b) break; } // 2 spells
        if (!count(c => c.t === 1 || tag(c, "WinCon"))) pick(c => c.t === 1 || tag(c, "WinCon")); // win condition
        if (!count(c => tag(c, "Tank"))) pick(c => c.t === 0 && tag(c, "Tank"));        // 1 tank
        if (!count(c => tag(c, "DamageDealer"))) pick(c => c.t === 0 && tag(c, "DamageDealer"), c => c.fl); // dps (prefer flying)
        if (!count(c => tag(c, "Swarm"))) pick(c => c.t === 0 && tag(c, "Swarm"), c => c.fl); // swarm (prefer flying)
        while (count(c => c.fl) < 2 && deck.length < 8) { let b = deck.length; pick(c => c.fl); if (deck.length === b) break; } // 2 flying
        while (deck.length < 8) { let b = deck.length; pick(() => true); if (deck.length === b) break; } // fill

        this.p.pile = [...deck.slice(0, 8)];
        this.p.h = [];
        for (let i = this.p.pile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p.pile[i], this.p.pile[j]] = [this.p.pile[j], this.p.pile[i]];
        }
        for (let i = 0; i < 4 && this.p.pile.length > 0; i++) this.p.h.push(this.p.pile.shift());
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
        // Human-like reaction time (~0.1-0.3s): don't instantly counter a card the
        // moment it's played — re-evaluate at most every 6-18 ticks.
        if (this.reactTimer > 0) { this.reactTimer--; return; }
        this.reactTimer = 6 + Math.floor(this.g.random() * 13);

        const mode = this.computeMode();
        const threats = this.getThreats();

        // 1) Defend only GENUINE threats (a real push), so we don't blow elixir on a
        //    lone weak card the tower can handle by itself.
        if (threats.length > 0 && this.significantThreat(threats) && this.p.elx >= 2 && this.defend(threats, mode)) { this.actCd = 24; return; }
        // 2) Spend spells on value (clusters) or chip the weak tower when ahead.
        if (this.castValueSpell(mode)) { this.actCd = 30; return; }
        // 3) Offense, gated by mode/elixir.
        if (this.p.elx >= (mode === 'pressure' ? 6 : 9) && this.buildPush(mode === 'pressure')) { this.actCd = 40; return; }
        // 4) Only dump a card to avoid LEAKING near-full elixir (otherwise save it).
        if (this.p.elx >= 9.3 && this.forcePlay()) { this.actCd = 18; return; }
    }

    // A push worth spending elixir on: several troops, or a tank / win condition.
    // A single weak troop is left to the towers (saves elixir).
    significantThreat(threats) {
        if (threats.length >= 3) return true;
        return threats.some(t => t.hp > 800 || (t.tags && (t.tags.includes("WinCon") || t.tags.includes("Tank"))));
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

    // True if (x,y) is close enough to the player's STILL-ASLEEP king tower that a
    // spell there would wake it. The AI avoids that (an early king is bad for it).
    nearAsleepKing(x, y, dist) {
        const k = this.g.t1K;
        return k && k.hp > 0 && !k.actv && Math.hypot(k.x - x, k.y - y) < dist;
    }

    defend(threats, mode) {
        const threat = threats[0];
        let counter = this.pickCounter(threat);
        if (!counter) return false;

        // The Log / Barbarian Barrel are only worth it against a GROUND SWARM (several
        // ground troops) — never against air or a single unit. Otherwise swap for a
        // non-spell counter, or skip.
        if (["The Log", "Barbarian Barrel"].includes(counter.n)) {
            let groundSwarm = threats.filter(t => !t.fly && Math.abs(t.x - threat.x) < 130).length;
            if (threat.fly || groundSwarm < 3) {
                let alt = this.affordable().find(c => c.t !== 2 && (
                    (threat.fly && c.ar) || c.tags.includes("Swarm") || c.tags.includes("DamageDealer")));
                if (!alt) return false;
                counter = alt;
            }
        }

        let playX = Math.max(40, Math.min(500, threat.x));
        let playY = Math.max(70, threat.y - 110);
        if (counter.tags.includes("Building")) {
            // Place the building FORWARD (in the attacker's path, a few tiles ahead
            // of our towers) and pulled toward centre, so the incoming win-con
            // targets the building instead of a tower — never tucked back by the king.
            playX = 270 + (threat.x < 270 ? -75 : 75);
            playY = this.g.RIV_Y - 105;
        }
        else if (counter.t === 2) { playX = threat.x; playY = threat.y; }
        else if (counter.tags.includes("Swarm")) { playY = threat.y - 45; }
        else if (counter.tags.includes("DamageDealer")) { playY = threat.y - 70; }

        // Kite a win-condition: drop a cheap swarm toward our centre so the
        // win-con chases the bait across, away from the tower.
        if (threat.tags.includes("WinCon") && counter.t !== 2 && counter.tags.includes("Swarm")) {
            playX = 270 + (threat.x < 270 ? 40 : -40);
            playY = 210;
        }

        // Keep non-spell placements on our own side of the river.
        if (counter.t !== 2) playY = Math.max(20, Math.min(this.g.RIV_Y - 20, playY));
        return this.playAI(counter, playX, playY);
    }

    // Densest knot of player troops, with the cluster's average per-tick velocity
    // (used to decide if a spell is worth it AND to lead a slow, arcing spell).
    cluster(rad) {
        const troops = this.g.ents.filter(e => e.tm === 0 && e instanceof Troop);
        let best = null;
        for (const a of troops) {
            const near = troops.filter(b => Math.hypot(a.x - b.x, a.y - b.y) < rad);
            if (!best || near.length > best.count) {
                let vx = 0, vy = 0;
                for (const b of near) { vx += (b.x - (b.lx ?? b.x)); vy += (b.y - (b.ly ?? b.y)); }
                best = { x: a.x, y: a.y, count: near.length, vx: vx / near.length, vy: vy / near.length };
            }
        }
        return best;
    }

    castValueSpell(mode) {
        // Damage spell on a tight cluster of player troops — but never if it would
        // splash the player's still-asleep king tower (waking it helps the player).
        const dmg = this.affordable().find(c => ["Fireball", "Arrows", "Poison"].includes(c.n));
        if (dmg) {
            const cl = this.cluster(dmg.n === "Poison" ? 95 : 70);
            if (cl && cl.count >= 3) {
                // Lead the cast: predict where the cluster will be when the spell
                // actually lands (slow arcs like Fireball/Rocket take time to fly).
                const kt = this.g.t2K;
                let delay = 8; // instant-drop spells (Arrows/Poison) have a short wind-up
                if (dmg.n === "Fireball") delay = Math.hypot(kt.x - cl.x, kt.y - cl.y) / 6 + 6;
                let px = cl.x + cl.vx * delay, py = cl.y + cl.vy * delay;
                if (!this.nearAsleepKing(px, py, 95)) return this.playAI(dmg, px, py);
            }
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
                if (t && t.hp > 0) return this.playAI(ts, t.x, t.y);
            }
        }
        return false;
    }

    buildPush(aggressive) {
        const g = this.g;
        const lane = (g.t1L.hp <= 0) ? 0 : (g.t1R.hp <= 0) ? 1 : (Math.random() > 0.5 ? 0 : 1);
        const laneX = lane === 0 ? 130 : 410;
        const tank = this.p.h.find(c => c.tags.includes("Tank") && c.c <= this.p.elx);
        if (tank) return this.playAI(tank, laneX, 30);
        const win = this.p.h.find(c => c.tags.includes("WinCon") && c.t !== 2 && c.c <= this.p.elx);
        if (win) return this.playAI(win, laneX, this.g.RIV_Y - 70);
        const support = this.p.h.find(c => c.t === 0 && (c.rn > 60 || c.tags.includes("AOE")) && c.c <= this.p.elx);
        if (aggressive && support) return this.playAI(support, laneX, 60);
        return false;
    }

    // Guaranteed action: play any affordable card somewhere valid.
    forcePlay() {
        for (const c of this.p.h) {
            if (c.c > this.p.elx || c.t === 2) continue;
            const x = Math.random() > 0.5 ? 130 : 410;
            const y = (c.t === 1 || c.tags.includes("Tank")) ? 30 : 90;
            if (this.playAI(c, x, y)) return true;
        }
        for (const c of this.p.h) {
            if (c.c > this.p.elx || c.t !== 2) continue;
            const g = this.g;
            const t = g.t1L.hp > 0 ? g.t1L : (g.t1R.hp > 0 ? g.t1R : g.t1K);
            if (this.playAI(c, t.x, t.y)) return true;
        }
        return false;
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
        if (c.c > this.p.elx) return false;
        // Building placement policy: an Elixir Collector goes safely BEHIND our towers;
        // every other building belongs in FRONT (defensive), never tucked at the back.
        if (c.t === 3) {
            if (c.n === "Elixir Collector") {
                x = 270 + (this.g.random() < 0.5 ? -70 : 70); y = 30;
            } else if (y < this.g.RIV_Y - 150) {
                y = this.g.RIV_Y - 110;
            }
        }
        // Snap to the same 30px tile grid the player uses.
        x = Math.floor(x / 30) * 30 + 15;
        y = Math.floor(y / 30) * 30 + 15;
        // Same placement limits as the player. Troops/buildings and the rolling
        // spells (Log / Barb Barrel) must pass isValid; other spells go anywhere.
        const needsValid = c.t !== 2 || ["The Log", "Barbarian Barrel", "Royale Delivery"].includes(c.n);
        if (needsValid && c.n !== "Goblin Barrel" && !this.g.isValid(y, x, c, 1)) return false;
        this.p.elx -= c.c;
        this.g.addU(1, c, x, y);

        let idx = this.p.h.indexOf(c);
        if (idx > -1) {
            this.p.h.splice(idx, 1);
            this.p.pile.push(c);
            this.p.h.push(this.p.pile.shift());
        }
        return true;
    }
}

