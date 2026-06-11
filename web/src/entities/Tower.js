import Entity from './Entity.js';
import Proj from './Proj.js';

export default class Tower extends Entity {
    constructor(t, x, y, k) {
        // Real Level 11 crown-tower hitpoints (King 4824, Princess 3052).
        // Larger footprint so towers read as solid structures.
        super(0, t, x, y, k ? 4824 : 3052, k ? 33 : 28, 10000, false, true);
        this.kg = k; // King Tower?
        this.actv = !k; // Active?
        this.cd = 0; // Cooldown
    }

    act(g) {
        if (this.fr > 0) return;
        if (this.st-- > 0) return;
        if (!this.actv) return; // King tower stays asleep until hit or a princess falls
        if (this.cd-- > 0) return;

        const W = 540, RIV_Y = 400;

        // Target the NEAREST valid enemy in range (not the first found).
        let best = null, bestD = 250;
        for (let e of g.ents) {
            if (e.tm === this.tm || e.hp <= 0) continue;
            if (this.tm === 0 && e.y < RIV_Y) continue;       // only defend our half
            if (this.tm === 1 && e.y > RIV_Y) continue;
            if (!this.kg && ((this.x < W / 2 && e.x > W / 2) || (this.x > W / 2 && e.x < W / 2))) continue; // princess favours its lane
            let d = this.dist(e);
            if (d < bestD) { bestD = d; best = e; }
        }
        if (best) {
            // Real Level 11 crown-tower hit: 109 damage. Princess hits every 0.8s
            // (48 ticks), King every 1.0s (60 ticks).
            g.projs.push(new Proj(this.x, this.y, best.x, best.y, best, 10, false, 4, 109, this.tm, false));
            this.cd = this.kg ? 60 : 48;
        }
    }
}
