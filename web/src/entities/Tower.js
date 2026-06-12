import Entity from './Entity.js';
import Proj from './Proj.js';

export default class Tower extends Entity {
    constructor(t, x, y, k) {
        // Real Level 11 crown-tower hitpoints (King 4824, Princess 3052). Towers are
        // large (King 50, Princess 36) so their squares fill the tiles around them,
        // leaving exactly one placeable tile (no stray half-tiles).
        super(0, t, x, y, k ? 4824 : 3052, k ? 50 : 36, 10000, false, true);
        this.kg = k; // King Tower?
        this.actv = !k; // Active?
        this.cd = 0; // Cooldown
        // Turret facing (radians); default points toward the enemy half so an idle
        // turret isn't aimed sideways. The renderer rotates the barrel to this.
        this.aimAngle = (t === 0) ? -Math.PI / 2 : Math.PI / 2;
        // King only: ticks remaining in the "shooter rising from its box" animation
        // that plays the moment the king activates (set by the engine on the flip).
        this.activateAnim = 0;
        // Edge-to-edge reach (slightly more than a Musketeer's rn 158).
        this.range = 175;
        this.lk = null; // locked target — kept until it dies or leaves range
    }

    act(g) {
        if (this.noTurret) return; // sandbox Heist: bare tower, can't shoot
        if (this.fr > 0) return;
        if (this.st-- > 0) return;
        if (!this.actv) return; // King tower stays asleep until hit or a princess falls
        if (this.kg && this.activateAnim > 0) return; // shooter still rising — hold fire

        const W = 540, RIV_Y = 405;

        // Range works like a troop's — edge-to-edge — and is slightly longer than a
        // Musketeer (rn 158), so a tower out-ranges one approaching it. The tower
        // LOCKS onto its first target and keeps shooting it until it dies or leaves
        // range; only then does it re-acquire the nearest enemy.
        const RANGE = this.range;
        let myHb = g.getHitboxRadius(this);
        // A tower defends its own half and shoots ANY enemy within range — no hard
        // lane lock (its range naturally keeps it to nearby threats), so a princess
        // will help against a unit that's crossed into the other lane but is in reach.
        const valid = e => e && e.hp > 0 && e.tm !== this.tm && g.ents.includes(e) &&
            !(this.tm === 0 && e.y < RIV_Y) && !(this.tm === 1 && e.y > RIV_Y) &&
            this.dist(e) <= RANGE + myHb + g.getHitboxRadius(e);
        if (!valid(this.lk)) {
            let best = null, bestD = Infinity;
            for (let e of g.ents) {
                if (!valid(e)) continue;
                let d = this.dist(e);
                if (d < bestD) { bestD = d; best = e; }
            }
            this.lk = best;
        }
        let best = this.lk;
        if (best) this.aimAngle = Math.atan2(best.y - this.y, best.x - this.x); // turn toward the target

        if (this.cd-- > 0) return; // still reloading
        if (best) {
            // Real Level 11 crown-tower hit: 109 damage. Princess hits every 0.8s
            // (48 ticks), King every 1.0s (60 ticks).
            g.projs.push(new Proj(this.x, this.y, best.x, best.y, best, 10, false, 4, 109, this.tm, false));
            this.cd = this.kg ? 60 : 48;
        }
    }
}
