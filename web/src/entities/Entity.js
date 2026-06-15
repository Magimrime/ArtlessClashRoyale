export default class Entity {
    constructor(id, t, x, y, h, r, m, fly, air) {
        this.id = id;
        this.tm = t;
        this.x = x;
        this.y = y;
        this.hp = h;
        this.mhp = h;
        this.rad = r;
        this.mass = m;
        this.fly = fly;
        this.air = air;
        this.lx = x;
        this.ly = y;

        // Status effects
        this.st = 0; // stun
        this.fr = 0; // freeze
        this.rt = 0; // root
        this.infernoTick = 0;
        this.stuckFrames = 0;
        this.sl = 0; // slow timer
        this.ragedTime = 0; // Rage buff timer (faster attack + movement while > 0)
        this.kbVX = 0; this.kbVY = 0; // knockback velocity (friction slide)
    }

    // Launch this unit into a FRICTION slide of ~`dist` px in direction `ang`. Instead
    // of a smooth eased shove, it gets a velocity that decays by the ground friction
    // each tick (applied in Troop.act) so it slides and skids to a stop. Heavy units
    // resist most of it.
    applyKnockback(ang, dist, force = false, hopperToo = false) {
        // The Hopper is the strongest unit on the field — normal pushes and collisions
        // never budge it. Only heavy DISPLACERS (the Log, a Fireball, a Mega Knight's
        // jump, and another Hopper's leap) pass hopperToo = true to shove it back.
        if (!hopperToo && this.c && this.c.n === "Hopper") return;
        // Heavies resist most pushes — unless `force` (the Hopper shoves EVERYTHING).
        if (!force && this.c && ["Mega Knight", "P.E.K.K.A", "Golem", "Elixir Golem", "Lava Hound"].includes(this.c.n)) dist *= 0.25;
        const FRICTION = 0.88; // gentler decay → a longer, smoother glide to a stop
        let v = dist * (1 - FRICTION); // geometric sum v/(1-FRICTION) ≈ dist
        this.kbVX = Math.cos(ang) * v;
        this.kbVY = Math.sin(ang) * v;
        this.kbTime = 30; // "currently sliding" flag (friction stops it sooner)
    }

    act(g) {
        // Abstract method
    }

    die(g) {
        // Abstract method
    }

    dist(e) {
        return Math.hypot(this.x - e.x, this.y - e.y);
    }

    getInfernoMultiplier(stage) {
        if (stage <= 0) return 1;
        if (stage > 6) stage = 6; // cap the damage ramp (x64) so it doesn't run away
        return 2 * this.getInfernoMultiplier(stage - 1);
    }
}
