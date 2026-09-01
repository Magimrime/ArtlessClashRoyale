import Entity from './Entity.js';
import Proj from './Proj.js';
// Troop import removed to avoid circular dependency

export default class Building extends Entity {
    constructor(t, x, y, c) {
        let radius = (c.n === "Cannon") ? 15 : 20;
        if (c.n === "Crate") radius = 14;
        if (c.n === "Tesla") radius = 16;
        if (c.n === "Bomb Tower") radius = 17;
        super(0, t, x, y, c.hp, radius, 10000, false, false);
        this.c = c;
        this.cd = 0;
        this.lk = null;
        this.atk = false;
        // Tesla starts UNDERGROUND: untargetable and unhittable until a target
        // wanders into range (like the sleeping king, but fully immune).
        if (c.n === "Tesla") this.teslaHidden = true;
    }

    // Damage immunity while the Tesla is underground: every "e.hp -= dmg" in the
    // codebase routes through this setter, so a hidden Tesla shrugs it all off.
    // (Lifetime decay writes _hp directly in act(), so it still expires.)
    get hp() { return this._hp; }
    set hp(v) {
        if (this.teslaHidden && this._hp !== undefined && v < this._hp) return;
        this._hp = v;
    }

    act(g) {
        if (this.fr > 0) { this.infernoTick = 0; return; }
        if (this.st-- > 0) { this.infernoTick = 0; return; }

        // Lifetime decay (bypasses the hidden-Tesla damage immunity on purpose)
        this._hp -= this.mhp / this.c.ms;
        if (this.hp <= 0) {
            // Death Logic handled via die(g) called by GameEngine
            return;
        }

        // Tesla pops up only while it has a target; otherwise it sinks back
        // underground where nothing can hit or even see it.
        if (this.c.n === "Tesla") this.teslaHidden = !this.lk;

        // Elixir Collector Logic
        if (this.c.n === "Elixir Collector") {
            this.infernoTick++;
            if (this.infernoTick >= 780) {
                g.giveElixir(this.tm, 1.0);
                this.infernoTick = 0;
            }
            return;
        }

        // Tombstone: a spawner — a PAIR of Skeletons every rt ticks (2 every 7s,
        // the real cadence), one out each side, stepping toward the enemy.
        if (this.c.n === "Tombstone") {
            this.infernoTick++;
            if (this.infernoTick >= this.c.rt) {
                this.infernoTick = 0;
                const fy = this.y + (this.tm === 0 ? -16 : 16); // toward the enemy
                g.spawnLoose(this.tm, "Skeletons", [[this.x - 14, fy], [this.x + 14, fy]]);
            }
            return;
        }

        if (this.lk) {
            if (this.lk.hp <= 0 || !g.ents.includes(this.lk) || this.dist(this.lk) > this.c.si) {
                this.lk = null;
                this.atk = false;
                this.infernoTick = 0;
            }
        }

        // Lock onto the first target until it dies or leaves SIGHT; only then
        // re-acquire the nearest (don't switch just because it stepped out of range).
        if (!this.lk) {
            let min = 9999;
            let best = null;
            for (let e of g.ents) {
                if (e.tm !== this.tm) {
                    if (e.fly && !this.c.ar) continue;
                    let d = this.dist(e);
                    if (d < min && d < this.c.si) {
                        min = d;
                        best = e;
                    }
                }
            }
            if (best) this.lk = best;
        }

        let myHitbox = g.getHitboxRadius(this);
        let targetHitbox = (this.lk) ? g.getHitboxRadius(this.lk) : 0;
        let attackRange = this.c.rn + myHitbox + targetHitbox + 2;

        if (this.lk && this.dist(this.lk) <= attackRange) {
            this.atk = true;
            if (this.c.n === "Inferno Tower") this.infernoTick++; // ramp EVERY tick while locked on
            if (this.cd-- > 0) return;

            // Attack
            if (this.c.n === "Inferno Tower") {
                let stage = Math.floor(this.infernoTick / 90); // starts at x1, steps up only every ~1.5s
                let mult = this.getInfernoMultiplier(stage);
                let dmg = this.c.d * mult;
                this.lk.hp -= dmg;
            } else if (this.c.n === "Tesla") {
                // CHAINED lightning, Electro-Spirit style: the current leaps from the
                // coil to the target and can hop to up to two more enemies near it.
                let p = new Proj(this.x, this.y, this.lk.x, this.lk.y, null, 0, false, 0, 0, this.tm, false)
                    .asElectroChain(this.lk, this.c.d);
                p.chainMax = 3; // target + up to 2 hops
                g.projs.push(p);
            } else if (this.c.n === "Bomb Tower") {
                // Lobbed bomb: slower shot that SPLASHES where it lands.
                let p = new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 5, false, 4, this.c.d, this.tm, false);
                p.delayedSplash = true;
                p.spl = false;
                p.life = 100;
                p.splashRad = 32;
                g.projs.push(p);
            } else {
                g.projs.push(new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 8, false, 4, this.c.d, this.tm, false));
            }
            this.cd = (this.ragedTime > 0) ? Math.max(1, Math.round(this.c.rt * 0.8)) : this.c.rt; // Rage: +20% hit speed
        } else {
            this.atk = false;
            this.infernoTick = 0;
            this.cd = this.c.rt;
        }
    }

    die(g) {
        if (this.c.n === "Elixir Collector") {
            g.giveElixir(this.tm, 1.0);
        } else if (this.c.n === "Crate") {
            g.handleCrateDeath(this);
        } else if (this.c.n === "Bomb Tower") {
            // Fused death bomb (real L11: 222 area damage after ~1.5s).
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 52, this.c.d, this.tm, false).asDeathBomb());
        } else if (this.c.n === "Tombstone") {
            // The stone cracks open: 4 Skeletons burst out.
            g.spawnLoose(this.tm, "Skeletons", [[this.x - 12, this.y - 10], [this.x + 12, this.y - 10], [this.x - 12, this.y + 10], [this.x + 12, this.y + 10]]);
        }
    }
}
