import Entity from './Entity.js';
import Proj from './Proj.js';
import GameEngine from '../core/GameEngine.js'; // Be careful with circular dependency here. 
// Ideally GameEngine should be passed in methods, not imported if possible, or use dynamic import/dependency injection.
// But since we need GameEngine constants (W, H, RIV_Y), we might need it.
// Actually, GameEngine constants are static in Java. In JS we can export them separately or use a Constants file.
// For now, I will hardcode constants or expect them to be available.
// I'll define constants at the top of this file for now to match GameEngine.

const W = 540;
const H = 960;
const RIV_Y = 405;

export default class Troop extends Entity {
    constructor(t, x, y, c) {
        let mass = 10;
        if (["Skeletons", "Bats"].includes(c.n)) mass = 6;
        else if (c.n.includes("Spirit")) mass = 10; // spirits as big as goblins (a touch bigger)
        else if (["Goblins", "Archers", "Wall Breakers"].some(n => c.n.includes(n))) mass = 8;
        else if (["Barbarians", "Elite Barbarians"].includes(c.n)) mass = 12;
        else if (c.n === "Mega Knight" || c.n === "P.E.K.K.A") mass = 20;
        else if (c.n === "Sparky" || c.n === "Bowler") mass = 18;
        else if (c.n === "Cannon") mass = 15;
        else if (c.n === "Balloon") mass = 19;
        else if (c.n === "Skeleton Barrel") mass = 12;
        else if (c.n.includes("Dragon") || c.n === "Lava Hound") mass = 16;
        else if (["Giant", "Golem", "Elixir Golem", "Royal Giant", "Electro Giant"].includes(c.n) || c.t === 3) mass = 20;
        else if (c.n === "Elixir Golemite") mass = 10;
        else if (c.n === "Elixir Blob" || c.n === "Lava Pup") mass = 6;
        else if (c.n === "Royal Recruits") mass = 12;

        // Parent constructor calls this.hp = h, which invokes the setter.
        // We need _hp to be set there.
        super(0, t, x, y, c.hp, mass, mass, c.fl, c.ar);

        this.c = c;
        this.tags = c.tags || [];
        this.cd = c.rt; // first-attack wind-up: a troop doesn't strike the instant it's ready
        // Deploy time: ~1s after placement a troop can't move or attack, like real
        // Clash Royale. (Death-spawns / clones clear this so they act instantly.)
        this.deployTime = 55;
        this.jt = null;
        this.jd = 0;
        this.jp = false;
        this.preJump = 0;
        this.lk = null;
        this.atk = false;
        this.spT = 0;
        this.chargeT = 0;
        this.isClone = false;
        this.path = [];

        // Aggro radius: at least 150, but never less than the troop's own reach so
        // ranged units (Witch, Musketeer…) notice enemies inside their attack range.
        this.sightRange = Math.max(150.0, (c.rn || 0) + 35);
        this.currentTarget = null;
        this.moveTarget = null;
        this.currentWaypoint = null;
        this.crossedRiver = false;
        this.crossT = 0;        // ticks the target has recently been across the river
        this.crossing = false;  // sticky: committed to finishing a bridge crossing

        this.lastPos = { x: 0, y: 0 };
        this.stuckTimer = 0;
        this.isStuck = false;
        this.stuckDir = 0;
        this.seekingPathDir = 0;

        this.kbX = 0;
        this.kbY = 0;
        this.kbTime = 0;
        this.fbSlowDelay = 0; // ticks until a Fireball's delayed slow+shove lands
        this.fbSlow2 = 0;     // queued follow-up (1s/80%) slow after the first wears off

        this.curseTime = 0;
        this.aimTime = 0;
        this.lastTarget = null;

        this.distWalked = 0;
        this.isCharging = false;

        // Shield Init
        this.shield = 0;
        this.maxShield = 0;
        if (c.n === "Royal Recruits") {
            this.shield = 199;
            this.maxShield = 199;
        }
        if (c.n === "Dark Prince") {
            this.shield = 199;
            this.maxShield = 199;
        }

        if (c.n === "Princess") this.sightRange = 400;
        if (c.n === "Prince") this.rad = 12;
        // Size / collision tweak: spirits read a touch smaller.
        if (c.n.includes("Spirit")) this.rad = 8;  // down from 10
        // EVO Musketeer: 3 global-range sniper shots (never spent on towers).
        if (c.n === "Musketeer" && c.isEvo) this.sniperShots = 3;
        // EVO Wall Breakers: a bomb SHIELD (second health bar) with the same HP as
        // the breaker itself. Breaking it sets off the bomb where they stand — but
        // they survive at full health and keep charging. Connecting with it intact
        // adds the bomb to the suicide blast.
        if (c.n === "Wall Breakers" && c.isEvo) {
            this.shield = c.hp;
            this.maxShield = c.hp;
            this.bombArmed = true;
        }
    }

    get hp() {
        return this._hp;
    }

    set hp(val) {
        if (this._hp === undefined) {
            this._hp = val;
            return;
        }
        let dmg = this._hp - val;
        if (dmg > 0 && this.shield > 0) {
            // Damage to shield
            if (dmg >= this.shield) {
                this.shield = 0;
            } else {
                this.shield -= dmg;
            }
            // Health is protected (stays same)
        } else {
            this._hp = val;
        }
        // EVO Minion Horde: the FIRST time a minion takes damage (and survives) it turns
        // into a GHOST — untargetable & translucent — for 3 seconds. This is a ONE-TIME
        // escape: once spent, later hits no longer ghost it. (evoGhostOnHit stays set as
        // the permanent "evo minion" marker for the crystal.)
        if (dmg > 0 && this._hp > 0 && this.evoGhostOnHit && !this.ghostUsed) { this.ghostTime = 180; this.ghostUsed = true; }
        // EVO Royal Hogs: the first hit while AIRBORNE knocks the hog out of the sky
        // (the crash damage is dealt in act, which has the engine handle).
        if (dmg > 0 && this._hp > 0 && this.evoFlyHog && this.fly) this.fallPending = true;
    }

    act(g) {
        // Shadow the module constant with the engine's LIVE river position so the
        // sandbox world editor can move the river (normal games keep 405).
        const RIV_Y = g.RIV_Y || 405;

        if (this.ghostTime > 0) this.ghostTime--; // temporary Evo Minion Horde ghost ticking down

        // EVO Royal Hogs also fall NATURALLY once they reach a tower/building — they crash
        // down onto it instead of attacking it from the air.
        if (this.evoFlyHog && this.fly) {
            for (let e of g.ents) {
                if (e.tm !== this.tm && e.hp > 0 && (e.constructor.name === "Tower" || e.constructor.name === "Building") &&
                    this.dist(e) < g.getHitboxRadius(this) + g.getHitboxRadius(e) + 12) { this.fallPending = true; break; }
            }
        }

        // EVO Royal Hogs: they fly in, and the FIRST hit knocks them down — they crash to
        // the ground for a jumper's worth of area damage, then charge on as ground hogs.
        if (this.fallPending) {
            this.fallPending = false;
            this.evoFlyHog = false;
            this.fly = false;
            for (let e of g.ents) {
                if (e.tm !== this.tm && e.hp > 0 && this.dist(e) < 45 + g.getHitboxRadius(e)) {
                    e.hp -= 300; // a jumper's worth of landing damage
                    if (e.constructor.name === "Troop") e.applyKnockback(Math.atan2(e.y - this.y, e.x - this.x), 28);
                }
            }
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 45, 0, this.tm, false).asShockwave());
        }

        // EVO Lumberjack's rage-ghost lives until ITS OWN bottle of rage runs out — it
        // can roam OUT of that rage and still survive until the bottle expires. Standing
        // in ANY other friendly rage (e.g. a cast Rage spell) keeps it alive even longer.
        // Only when its own rage is gone AND it's in no rage at all does it dissolve.
        if (this.isRageGhost) {
            let ownRageActive = this.rageSource && this.rageSource.life > 0 && g.projs.includes(this.rageSource);
            let inAnyRage = g.projs.some(p => p.isRage && p.tm === this.tm && (p.rageWindup || 0) <= 0 &&
                Math.hypot(p.x - this.x, p.y - this.y) < p.rad + this.rad);
            if (!ownRageActive && !inAnyRage) { this.hp = 0; return; }
        }

        // Deploy time — can't move or attack for ~1s after being placed. The dash
        // charge ("dash cooldown") does NOT run during the spawn cooldown: it stays
        // at zero and only starts building once the troop actually walks.
        if (this.deployTime > 0) {
            this.deployTime--;
            this.chargeT = 0;
            this.distWalked = 0;
            this.isCharging = false;
            return;
        }

        // Spirit hop: once started, arc onto the target and explode on landing.
        if (this.sjT > 0) {
            this.sjT--;
            let prog = 1 - this.sjT / this.sjMax;
            this.x = this.sjx0 + (this.sjx1 - this.sjx0) * prog;
            this.y = this.sjy0 + (this.sjy1 - this.sjy0) * prog;
            if (this.sjT <= 0) this.explodeSpirit(g, this.sjTarget && this.sjTarget.hp > 0 ? this.sjTarget : this.currentTarget);
            return;
        }

        if (this.fr > 0) {
            this.infernoTick = 0;
            this.chargeT = 0;
            this.isCharging = false; this.distWalked = 0; // a freeze stops a Prince's charge
            this.atk = false; // a freeze breaks the lock (it can re-target after)
            return;
        }
        if (this.st-- > 0) {
            this.infernoTick = 0;
            this.chargeT = 0;
            this.isCharging = false; this.distWalked = 0; // a stun stops a Prince's charge
            this.atk = false; // a stun breaks the lock
            return;
        }

        // EVO Wall Breakers: the bomb shield popped — detonate on the spot. The
        // breaker itself survives (the shield ate the hit) and keeps charging.
        if (this.bombArmed && this.maxShield > 0 && this.shield <= 0) {
            this.bombArmed = false;
            for (let e of g.ents)
                if (e.tm !== this.tm && e.hp > 0 && this.dist(e) < 60) e.hp -= 288;
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 60, 0, this.tm, false).asShockwave());
        }

        if (this.kbTime > 0 && (this.kbVX || this.kbVY)) {
            // FRICTION slide: a knocked-back unit keeps its velocity but the ground saps
            // it (×0.88) every tick, so it skids and eases to a smooth stop. A lower
            // cut-off lets the last of the glide bleed off instead of snapping to a halt.
            this.x += this.kbVX;
            this.y += this.kbVY;
            this.kbVX *= 0.88;
            this.kbVY *= 0.88;
            // If the skid reaches an arena WALL, pin it exactly at the edge and bleed the
            // INTO-the-wall velocity off hard, so it decelerates smoothly against the wall
            // instead of overshooting past it and being snapped back in (a teleport).
            const minX = 6, maxX = W - 6, minY = 6, maxY = H - 150;
            if (this.x < minX) { this.x = minX; if (this.kbVX < 0) this.kbVX *= -0.15; }
            else if (this.x > maxX) { this.x = maxX; if (this.kbVX > 0) this.kbVX *= -0.15; }
            if (this.y < minY) { this.y = minY; if (this.kbVY < 0) this.kbVY *= -0.15; }
            else if (this.y > maxY) { this.y = maxY; if (this.kbVY > 0) this.kbVY *= -0.15; }
            this.kbTime--;
            if (Math.hypot(this.kbVX, this.kbVY) < 0.12) { this.kbVX = 0; this.kbVY = 0; this.kbTime = 0; }
            this.isCharging = false; this.distWalked = 0; // a knockback stops a Prince's charge
        }

        if (this.curseTime > 0) this.curseTime--;
        // Fireball aftershock: 0.3s after the hit (the single impact shove has just
        // faded), the unit is slowed 50% for 0.6s, which then chains into another 1s of
        // a harder 80% slow.
        if (this.fbSlowDelay > 0) {
            this.fbSlowDelay--;
            if (this.fbSlowDelay === 0) {
                this.sl = 36; this.slowMul = 0.5; this.fbSlow2 = 60; // queue 1s/80% follow-up
            }
        }
        if (this.sl > 0) {
            this.sl--;
            if (this.sl <= 0) {
                if (this.fbSlow2 > 0) { this.sl = this.fbSlow2; this.fbSlow2 = 0; this.slowMul = 0.2; } // chained 80% slow, 1s
                else this.slowMul = 0;
            }
        }

        // Most slows knock movement to 0.65x; a Fireball hit slows harder (0.5x) via slowMul.
        let speedMult = (this.sl > 0) ? (this.slowMul || 0.65) : 1.0;
        if (this.ragedTime > 0) speedMult *= 1.15; // Rage: +15% movement speed
        // Rage: +20% hit speed (attacks land 20% faster — applied to the reload below).
        const rageRt = (rt) => (this.ragedTime > 0 ? Math.max(1, Math.round(rt * 0.8)) : rt);

        if (["Zappies", "Sparky"].includes(this.c.n)) {
            let threshold = this.c.n === "Zappies" ? 72 : 180;
            if (this.chargeT < threshold) this.chargeT++;
        }

        // Reduced to 0 this tick? Don't bail here — fall through so we can land one final
        // RETALIATING strike (the attack below is cd-gated, so at most once). The engine
        // runs death effects and removes us after the short dying delay. We skip MOVEMENT
        // (a dying troop holds its ground) — see the movement gate below.

        // Electro Giant: shocks on every attack (see the attack branch). When it is
        // NOT attacking, it still pulses a shock every 3 seconds.
        if (this.c.n === "Electro Giant" && !this.atk && g.aiTick % 180 === 0) this.electroShock(g);

        // Witch Spawn — 4 skeletons that act immediately (no deploy cooldown).
        if (this.c.n === "Witch") {
            if (this.spT-- <= 0) {
                this.spT = 640; // spawns less often (~10.7s between batches)
                for (const [ox, oy] of [[10, 0], [-10, 0], [0, 10], [0, -10]]) {
                    let t = new Troop(this.tm, this.x + ox, this.y + oy, g.getCard("Skeletons"));
                    t.deployTime = 0;
                    // EVO Witch: tag each summoned skelly so it feeds her HP when it dies.
                    if (this.c.isEvo) t.healWitch = this;
                    g.ents.push(t);
                }
            }
        }

        // Jump — arc to a FIXED landing point (snapped when the leap began) so it
        // reaches where it jumped smoothly instead of chasing a moving target.
        if (this.jp) {
            this.fly = true;
            {
                let gx = (this.jdx !== undefined) ? this.jdx : (this.jt ? this.jt.x : this.x);
                let gy = (this.jdy !== undefined) ? this.jdy : (this.jt ? this.jt.y : this.y);
                // A leap must always END on the playable field. A landing point off the
                // edge is what made edge-hit troops look like they "flew away" and never
                // came back down — clamp it in.
                gx = Math.max(6, Math.min(W - 6, gx));
                gy = Math.max(6, Math.min(H - 150, gy));
                let dx = gx - this.x;
                let dy = gy - this.y;
                let d = Math.hypot(dx, dy);
                let jumpSpeed = 2.0;

                // Watchdog: a leap can never hover forever. If it runs well past the time it
                // should take to cover its arc, force it to touch down right now.
                this.jpAge = (this.jpAge || 0) + 1;
                if (d < jumpSpeed + 1 || this.jpAge > (this.jd / jumpSpeed) + 50) {
                    this.x = gx; this.y = gy; // land exactly at the fixed point
                    this.jp = false;
                    this.fly = false;
                    this.jpAge = 0;
                    this.jdx = undefined; this.jdy = undefined;

                    if (this.knockJump) {
                        // Was launched by an Evo Mega Knight — just a landing dust puff,
                        // never any landing damage (even if this is itself an MK/Hopper).
                        this.knockJump = false;
                        g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 16, 0, this.tm, false).asShockwave());
                    } else if (this.c.n === "Mega Knight") {
                        for (let e of g.ents)
                            if (e.tm !== this.tm && !e.fly && this.dist(e) < 60) {
                                e.hp -= 340; // jump-land area damage (real L11)
                                // The slam knocks ground troops back — even a Hopper (hopperToo).
                                if (e.constructor.name === "Troop") e.applyKnockback(Math.atan2(e.y - this.y, e.x - this.x), 38, false, true);
                            }
                        // Landing shockwave visual.
                        g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 60, 0, this.tm, false).asShockwave());
                    } else if (this.c.n === "Hopper") {
                        // Mega-Knight-style landing: 65% smaller radius, 20% less damage,
                        // and a hard 1.6-tile friction knockback that shoves EVERY card —
                        // air, ground, even heavies (force = true).
                        for (let e of g.ents) {
                            if (e.tm !== this.tm && e.hp > 0 && this.dist(e) < 21 + g.getHitboxRadius(e)) {
                                if (!e.fly) e.hp -= 272; // GROUND only ( like a MK slam) — no damage to air
                                // Still SHOVES every card (force), air included: 1.7 tiles for
                                // normal troops, 1.5 for another Hopper (so they leapfrog).
                                if (e.constructor.name === "Troop") e.applyKnockback(Math.atan2(e.y - this.y, e.x - this.x), (e.c.n === "Hopper") ? 45 : 51, true, true);
                            }
                        }
                        g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 21, 0, this.tm, false).asShockwave());
                    }
                } else {
                    this.x += (dx / d) * jumpSpeed;
                    this.y += (dy / d) * jumpSpeed;
                }
            }
            return;
        }

        if (this.preJump > 0) {
            this.preJump--;
            if (this.preJump === 0 && this.jt && this.jt.hp > 0) {
                this.jp = true;
                this.jpAge = 0;
                this.kbTime = 0; this.kbVX = 0; this.kbVY = 0;
                // Land in FRONT of the target — on the side we're leaping FROM — so we
                // touch down just short of it and never sail OVER/behind it. Travel the
                // gap minus both hitboxes (clamped to 0 if we're already on top of it).
                let dx = this.jt.x - this.x, dy = this.jt.y - this.y;
                let dd = Math.hypot(dx, dy) || 1;
                let standoff = g.getHitboxRadius(this) + g.getHitboxRadius(this.jt);
                let travel = Math.max(0, dd - standoff);
                this.jdx = this.x + (dx / dd) * travel;
                this.jdy = this.y + (dy / dd) * travel;
                this.jd = travel || 1;
            }
            return;
        }

        // HOPPER: can't walk and never melees. While not already mid-leap, it LEAPS onto
        // the nearest enemy GROUND troop within 1.5 tiles (45px straight-line — so it can
        // even leap across the river to a troop right on the far bank), reloading between
        // leaps. The leap's landing damage + knockback are dealt in the jump-land code.
        if (this.c.n === "Hopper") {
            if (this.cd > 0) this.cd--;
            if (this.cd <= 0) {
                let best = null, bd = 45;
                for (let e of g.ents) {
                    if (e.tm === this.tm || e.hp <= 0 || e.constructor.name !== "Troop") continue;
                    if (e.fly) continue; // the Hopper is GROUND-only — it never leaps at air troops
                    let d = this.dist(e);
                    if (d < bd) { bd = d; best = e; }
                }
                if (best) { this.jt = best; this.preJump = 45; this.cd = this.c.rt; } // Mega-Knight-style wind-up
            }
            return; // no walking, no melee
        }

        // (Spirits / Wall Breakers rush their target and explode on contact — handled
        // in the attack section below so they path via bridges and never shoot.)

        // GOBLIN DEMOLISHER last stand: once its HP drops below the half-way line it
        // STOPS lobbing dynamite and CHARGES the nearest enemy building/tower, blowing up
        // on contact (the big death blast is dealt in die()).
        if (this.c.n === "Goblin Demolisher") {
            if (this.hp < this.mhp * 0.5) this.lastStand = true;
            if (this.lastStand) {
                let best = null, bd = Infinity;
                for (let e of g.ents) {
                    if (e.tm === this.tm || e.hp <= 0) continue;
                    if (e.constructor.name !== "Tower" && e.constructor.name !== "Building") continue;
                    let d = this.dist(e); if (d < bd) { bd = d; best = e; }
                }
                if (best) {
                    this.currentTarget = best;
                    if (this.dist(best) < g.getHitboxRadius(this) + g.getHitboxRadius(best) + 8) {
                        this.exploded = true; this.hp = 0; return; // detonate on the structure
                    }
                    let a = Math.atan2(best.y - this.y, best.x - this.x);
                    this.x += Math.cos(a) * this.c.s * 2.4; // a desperate, FAST charge
                    this.y += Math.sin(a) * this.c.s * 2.4;
                    return;
                }
            }
        }

        // Find the attack target every tick. findTarget keeps the current target
        // unless it dies or a clearly closer one appears (hysteresis), so this is
        // both responsive and jitter-free. The river crossing is handled purely in
        // movement below, so currentTarget stays the real tower/unit.
        this.findTarget(g);

        // Jumpers (Hog, Prince, ...) leap the river instead of using a bridge.
        if (!this.fly && !this.jp && this.currentTarget && !g.sandboxNoRiver &&
            ["Hog Rider", "Royal Hogs", "Prince", "Dark Prince"].includes(this.c.n)) {
            if (((this.y < RIV_Y) !== (this.currentTarget.y < RIV_Y)) && Math.abs(this.y - RIV_Y) < 34) {
                let bxs = g.bridgeXs || [W / 4, W * 3 / 4];
                let onBridge = bxs.some(bx => this.x >= bx - 30 && this.x <= bx + 30);
                if (!onBridge) {
                    this.jp = true;
                    this.jpAge = 0;
                    this.kbTime = 0;
                    this.fly = true;
                    this.preJump = 0; // NO wind-up delay — it hops the instant it reaches the river
                    if (this.c.n === "Prince" || this.c.n === "Dark Prince") {
                        this.isCharging = false;
                        this.distWalked = 0;
                    }
                    // A short ~1.5-tile hop STRAIGHT across to the near edge of the far bank
                    // (the shortest crossing) with a small horizontal nudge toward the target.
                    // Arced like a Hopper jump — jdx/jdy drive the render arc.
                    let far = (this.y < RIV_Y) ? RIV_Y + 25 : RIV_Y - 25; // land a bit deeper on the far bank
                    let hx = Math.sign(this.currentTarget.x - this.x) * 8;
                    this.jdx = this.x + hx;
                    this.jdy = far;
                    this.jd = Math.hypot(this.jdx - this.x, this.jdy - this.y);
                    this.jt = { x: this.jdx, y: this.jdy, hp: 1 };
                }
            }
        }

        // EVO Musketeer sniper: while she has shots left, ANY enemy troop or building
        // anywhere on the map (never a tower) gets sniped — she stands and fires a
        // very fast purple bolt on her normal reload.
        if (this.c.n === "Musketeer" && this.c.isEvo && this.sniperShots > 0) {
            let tgt = null, bd = Infinity;
            for (let e of g.ents) {
                if (e.tm === this.tm || e.hp <= 0) continue;
                if (e.constructor.name === "Tower") continue;
                let d = this.dist(e);
                if (d < bd) { bd = d; tgt = e; }
            }
            if (tgt) {
                this.atk = true; // aiming — stands still
                if (this.cd-- <= 0) {
                    // 280 dmg: kills everything The Log (290) kills, slightly weaker.
                    let p = new Proj(this.x, this.y, tgt.x, tgt.y, tgt, 22, false, 5, 280, this.tm, false);
                    p.flashCol = "#c45cff"; // purple sniper bolt
                    g.projs.push(p);
                    this.sniperShots--;
                    this.cd = rageRt(this.c.rt);
                }
                return;
            }
        }

        // 3. Attack Logic
        this.lk = (this.currentTarget && this.currentTarget.hp > 0 && this.currentTarget.rad !== 0) ? this.currentTarget : null;

        if (this.lk !== this.lastTarget) {
            if (this.c.n === "Sparky") this.aimTime = 0;
            if (this.c.n === "Inferno Dragon") this.infernoTick = 0;
            this.lastTarget = this.lk;
        }

        if (!this.jp && this.preJump === 0 && this.c.n === "Mega Knight" && this.lk && this.lk.hp > 0) {
            let d = this.dist(this.lk);
            // Jumps from 20% further out, with a crouched wind-up (~0.75s) first.
            if (d > 90 && d < 102) {
                this.preJump = 45;
                this.jt = this.lk;
                this.jd = d;
                return;
            }
        }

        let myHitbox = g.getHitboxRadius(this);
        let targetHitbox = (this.lk) ? g.getHitboxRadius(this.lk) : 0;

        // Spirits & Wall Breakers jump onto the target and explode on contact —
        // they never fire a projectile.
        if (this.c.n.includes("Spirit") || this.c.n === "Wall Breakers") {
            const isSpirit = this.c.n.includes("Spirit");
            if (this.lk && this.lk.hp > 0) {
                let d = this.dist(this.lk);
                if (isSpirit && d <= myHitbox + targetHitbox + 30) {
                    // Within 1 tile: hop into the air and onto the enemy, then burst.
                    this.atk = true;
                    this.sjT = 14; this.sjMax = 14;
                    this.sjx0 = this.x; this.sjy0 = this.y;
                    this.sjx1 = this.lk.x; this.sjy1 = this.lk.y;
                    this.sjTarget = this.lk;
                    return;
                }
                if (!isSpirit && d <= myHitbox + targetHitbox + 8) {
                    this.atk = true; this.explodeSpirit(g, this.lk); return;
                }
            }
            this.atk = false;
        } else if (this.lk && this.lk.hp > 0 &&
            this.effReach(g, this.lk) <= this.attackReach(g, myHitbox, targetHitbox) + (this.atk ? 12 : 0) &&
            !this.blockedByRiver(g, this.lk)) {
            this.atk = true;
            if (this.c.n === "Inferno Dragon") this.infernoTick++; // ramp EVERY tick while locked on
            if (this.rt > 0 && !this.fly) return;

            let isChargedSpecial = ["Zappies", "Sparky"].includes(this.c.n) && this.chargeT >= (this.c.n === "Zappies" ? 72 : 180);
            // A primed dash (Prince / Dark Prince / Evo Royal Recruits) strikes the
            // INSTANT it connects — no first-hit reload after the charge.
            let dashHit = this.isCharging && ["Prince", "Dark Prince", "Royal Recruits"].includes(this.c.n);
            if (this.cd-- > 0 && !isChargedSpecial && !dashHit) return;

            // DEATH PREDICTION: if shots already in flight will finish this target,
            // HOLD the attack (cd stays spent-ready) — the target pass will move us to
            // a live enemy instead of overkilling a doomed one. Towers are exempt.
            if (this.lk && this.lk.constructor.name !== "Tower" && g.predictedHp(this.lk) <= 0) {
                this.cd = 0;
                return;
            }

            // Flying units (Baby Dragon, Minions, …) shoot from their VISUAL body,
            // which floats 22px above the ground shadow — not from the shadow.
            let srcY = this.y - (this.fly ? 22 : 0);

            if (["Zappies", "Sparky"].includes(this.c.n)) {
                let threshold = this.c.n === "Zappies" ? 72 : 180;
                if (this.chargeT < threshold) return;

                if (this.c.n === "Zappies") {
                    this.chargeT = 0;
                    g.projs.push(new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 12, false, 4, this.c.d, this.tm, false).asStun(6).asLightBlue());
                } else {
                    if (this.aimTime < 45) {
                        this.aimTime++;
                        return;
                    }
                    this.aimTime = 0;
                    this.chargeT = 0;
                    let p = new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 14, false, 16, this.c.d, this.tm, false).asLightBlue();
                    p.delayedSplash = true;
                    p.life = 100;
                    g.projs.push(p);

                    this.applyKnockback(Math.atan2(this.y - this.lk.y, this.x - this.lk.x), 16); // recoil
                }
            } else if (this.c.n === "Inferno Dragon") {
                let stage = Math.floor(this.infernoTick / (this.c.isEvo ? 49 : 58)); // evo charges 15% faster
                let mult = this.getInfernoMultiplier(stage);
                this.lk.hp -= this.c.d * mult;
            } else if (this.c.n === "Royal Giant") {
                let p = new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 9, false, 8, this.c.d, this.tm, false);
                p.isCannonball = true; // big dark cannonball
                g.projs.push(p);
                // EVO: every shot also SLAMS the ground around the giant — Hopper-landing-
                // style area damage + knockback to nearby enemies, with a shockwave.
                if (this.c.isEvo) {
                    for (let e of g.ents) {
                        if (e.tm !== this.tm && e.hp > 0 && this.dist(e) < 60 + g.getHitboxRadius(e)) {
                            e.hp -= this.c.d;
                            if (e.constructor.name === "Troop") e.applyKnockback(Math.atan2(e.y - this.y, e.x - this.x), 30);
                        }
                    }
                    g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 60, 0, this.tm, false).asShockwave());
                }
            } else if (this.c.n === "Bowler") {
                let angle = Math.atan2(this.lk.y - this.y, this.lk.x - this.x);
                let dist = 140;
                let tx = this.x + Math.cos(angle) * dist;
                let ty = this.y + Math.sin(angle) * dist;
                g.projs.push(new Proj(this.x, this.y, tx, ty, null, 2.33, false, 18, this.c.d, this.tm, false).asRolling());
            } else if (this.c.n === "Mother Witch") {
                g.projs.push(new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 12, false, 4, this.c.d, this.tm, false).asCurse());
            } else if (this.c.n === "Mega Minion") {
                // Mega Minion hurls a heavier dark dart from range (fired from its
                // floating body, not the shadow).
                g.projs.push(new Proj(this.x, srcY, this.lk.x, this.lk.y, this.lk, 6, false, 6, this.c.d, this.tm, false));
            } else if (["Minions", "Minion Horde"].includes(this.c.n)) {
                // Minions lob a short-range dart (a dark projectile, not too fast)
                // fired from the floating body, not the shadow.
                g.projs.push(new Proj(this.x, srcY, this.lk.x, this.lk.y, this.lk, 6, false, 4, this.c.d, this.tm, false));
            } else if (this.c.n === "Electro Giant") {
                this.lk.hp -= this.c.d;   // melee hit
                this.electroShock(g);     // + electric shock to everything in the aura
            } else if (this.c.n === "Elite Musketeer" && !this.lk.fly &&
                this.dist(this.lk) <= 48 + myHitbox + targetHitbox) {
                // Bayonet: a ground target inside 1.6 tiles (48px) takes a 314-damage
                // melee jab instead of a shot (Season-77 Three Musketeers rework).
                this.lk.hp -= 314;
            } else if (this.c.n === "Firecracker") {
                // A rocket that BURSTS into sparks where it lands — and the recoil
                // kicks her backward (her signature hop).
                let p = new Proj(this.x, srcY, this.lk.x, this.lk.y, this.lk, 7, false, 5, this.c.d, this.tm, false);
                p.delayedSplash = true;
                p.spl = false;
                p.life = 100;
                p.splashRad = 28;
                p.flashCol = "#ffb0c8";
                g.projs.push(p);
                this.applyKnockback(Math.atan2(this.y - this.lk.y, this.x - this.lk.x), 22);
            } else if (this.c.n === "Goblin Demolisher") {
                // Throws a stick of DYNAMITE — it arcs to the target (with a shadow) and
                // bursts into an area fire blast on landing.
                g.projs.push(new Proj(this.x, srcY, this.lk.x, this.lk.y, this.lk, 0, false, 42, this.c.d, this.tm, false).asDynamite(this.c.d));
            } else if (this.c.rn > 30) {
                let p = new Proj(this.x, srcY, this.lk.x, this.lk.y, this.lk, 8, false, 4, this.c.d, this.tm, false);
                if (["Wizard", "Witch", "Baby Dragon"].includes(this.c.n)) {
                    p.delayedSplash = true;
                    p.spl = false;
                    p.life = 100;
                    p.splashRad = (this.c.n === "Wizard") ? 30 : 24; // Wizard splash is a touch bigger
                }
                g.projs.push(p);
            } else {
                if (this.c.n === "Mega Knight") {
                    for (let e of g.ents)
                        if (e.tm !== this.tm && !e.fly && e.dist(this.lk) < 26 + g.getHitboxRadius(e)) { // melee splash now matches the Dark Prince's tight radius (was 60)
                            e.hp -= this.c.d;
                            // EVO: the slam LAUNCHES each struck troop into a backward leap
                            // (it arcs away and lands with a puff — no extra landing damage).
                            if (this.c.isEvo && e.constructor.name === "Troop" && e.hp > 0 &&
                                !e.jp && e.c.n !== "Hopper")
                                this.launchKnockJump(g, e);
                        }
                } else if (this.c.n === "Skeleton Barrel") {
                    // Doesn't attack: connecting with its target pops the barrel — the
                    // death effects deal the area death damage and drop the crew.
                    this.hp = 0;
                } else if (this.c.n === "Balloon") {
                    // Instant hit — it's a building-targeter, so its target is always a
                    // tower/building. No bomb projectile, no troop splash.
                    this.lk.hp -= this.c.d;
                } else {
                    let dmg = this.c.d;
                    if (this.c.n === "Prince") dmg = Math.floor(dmg * 0.3);
                    if (this.isCharging) {
                        if (this.c.n === "Knight") dmg = Math.floor(dmg * 1.5);
                        else if (this.c.n === "Royal Recruits") dmg = Math.floor(dmg * 1.2); // evo dash: +20% first hit
                        else dmg *= 2;
                        this.isCharging = false;
                        this.distWalked = 0;
                    }
                    if (this.c.n === "Dark Prince") {
                        // Dark Prince deals SPLASH — its (L11 ~249, charge ~498) hit lands on
                        // every enemy in a small area around the target.
                        for (let e of g.ents)
                            if (e.tm !== this.tm && e.hp > 0 && e.dist(this.lk) < 26 + g.getHitboxRadius(e))
                                e.hp -= dmg;
                    } else {
                        this.lk.hp -= dmg;
                    }
                    // EVO Bats: every hit makes the bat tougher — it gains HP, capped at
                    // +50% of its original max (so it tops out around 1.5x its base HP).
                    if (this.c.n === "Bats" && this.c.isEvo && this.hp > 0) {
                        this.hp = Math.min(this.mhp * 1.5, this.hp + 14);
                    }
                    // EVO Skeletons: every hit RAISES another skeleton (a brief shimmer-in),
                    // up to 8 on the field at once. (Manual sandbox summons can exceed it —
                    // the cap only gates this auto-multiply.) The hit summons even if THIS
                    // skeleton is landing its dying retaliation blow — so when two armies
                    // trade kills, each fatal hit still leaves a replacement behind.
                    if (this.c.n === "Skeletons" && this.c.isEvo) {
                        let n = 0;
                        for (let e of g.ents) if (e.c && e.c.n === "Skeletons" && e.c.isEvo && e.tm === this.tm && e.hp > 0) n++;
                        if (n < 8) {
                            let s = new Troop(this.tm, this.x + (this.tm === 0 ? -7 : 7), this.y + (this.tm === 0 ? 9 : -9), this.c);
                            s.deployTime = 0; // appears instantly...
                            s.cd = 0;         // ...and can strike right away, so the swarm keeps
                            // itself going even when it's being focus-fired or trading kills
                            g.ents.push(s);
                            g.projs.push(new Proj(s.x, s.y, s.x, s.y, null, 0, false, 11, 0, this.tm, false).asPhantom());
                        }
                    }
                }
            }
            this.cd = ["Zappies", "Sparky"].includes(this.c.n) ? 0 : rageRt(this.c.rt);
            return;
        } else {
            this.atk = false;
            this.infernoTick = 0;
            // Keep the reload PROGRESSING while out of range instead of resetting it to
            // full every tick. This lets a troop arrive ready to strike — and crucially
            // land a hit on a target that's only briefly reachable (a unit mid-LEAP) or
            // one that keeps getting shoved away (so it can RETALIATE after a push). The
            // deploy timer — not this reload — is the anti-instant-attack gate.
            // Balloon keeps cd at 0 so it drops its first bomb the instant it arrives.
            if (this.c.n === "Balloon") this.cd = 0;
            else if (this.cd > 0) this.cd--;
        }

        // 4. Movement
        if (this.hp <= 0) return; // dying troops hold their ground (no chasing)
        if (this.c.s === 0) return;
        if (this.rt > 0) return;

        if (this.currentTarget) {
            // GOAL point. For a tower/building, aim at its FRONT face (toward our home)
            // so troops gather under it rather than off to the side.
            let gx = this.currentTarget.x;
            let gy = this.currentTarget.y;
            const cn = this.currentTarget.constructor.name;
            if (cn === "Tower" || cn === "Building") {
                gy = this.currentTarget.y + ((this.tm === 0) ? 1 : -1) * this.currentTarget.rad * 0.7;
            }

            let tx = gx, ty = gy;
            if (this.fly) {
                // Fliers ignore the river and all obstacles — straight line.
                this.path = [{ x: gx, y: gy }];
            } else {
                // PROCEDURAL WAYPOINTS (A* on the nav grid): the route bends around the
                // river — crossing at whichever bridge is on the shortest path — and
                // around tower/building footprints. The bridge is NOT a special waypoint;
                // it just falls out of the grid. Recompute periodically, when the path is
                // used up, or when the goal has moved a lot, so it stays short & current.
                this.pathTick = (this.pathTick || 0) - 1;
                let goalMoved = !this._lastGoal || Math.hypot(this._lastGoal.x - gx, this._lastGoal.y - gy) > 45;
                if (this.pathTick <= 0 || !this.path || this.path.length === 0 || goalMoved) {
                    // STRAIGHT SHOT FIRST: if nothing interferes (no river still to cross, no
                    // friendly structure in the way), head straight to the goal with a single
                    // waypoint — never weave. Only when there's real interference do we run A*
                    // to route around a tower/building or over to a bridge.
                    if (!this.checkPathBlocked(g, this.x, this.y, gx, gy)) {
                        this.path = [{ x: gx, y: gy }];
                    } else {
                        this.path = g.computePath(this.x, this.y, gx, gy, false);
                    }
                    this._lastGoal = { x: gx, y: gy };
                    // Longer, staggered recompute window: constant re-pulls made the
                    // first waypoint jump around and troops visibly wobbled off their
                    // line. The goalMoved check above still reacts instantly.
                    this.pathTick = 18 + Math.floor(g.random() * 10);
                }
                // Drop waypoints we've essentially reached (a touch generous so a fast
                // troop can't orbit a waypoint it keeps overshooting).
                while (this.path.length > 1 && Math.hypot(this.path[0].x - this.x, this.path[0].y - this.y) < 20) {
                    this.path.shift();
                }
                let wp = this.path[0] || { x: gx, y: gy };
                tx = wp.x; ty = wp.y;
            }

            this.moveTarget = { x: tx, y: ty };
            let dx = tx - this.x, dy = ty - this.y;
            let dist = Math.hypot(dx, dy);
            if (dist > 0) { dx /= dist; dy /= dist; }

            if (!this.atk) {
                let preY = this.y;
                // Dash speed: 2x for the Princes and Evo Royal Recruits alike.
                let chargeSpd = this.isCharging ? 2.0 : 1.0;
                this.x += dx * this.c.s * chargeSpd * speedMult;
                this.y += dy * this.c.s * chargeSpd * speedMult;

                // The river is a WALL. A ground troop that can't leap it never sets foot in
                // the water off a bridge — if a step would, it's held at the near bank (its
                // whole body kept clear of the water) so it must walk to a bridge to cross.
                // The nav grid already routes it there; this is the hard guarantee.
                const riverJumper = ["Hog Rider", "Royal Hogs", "Prince", "Dark Prince"].includes(this.c.n);
                if (!this.fly && !this.jp && !riverJumper && !g.sandboxNoRiver) {
                    const RY = g.RIV_Y || RIV_Y;
                    const band = 17 + g.getHitboxRadius(this); // half-band: keeps the body fully out of the water
                    const bxs = g.bridgeXs || [W / 4, W * 3 / 4];
                    if (Math.abs(this.y - RY) < band) {
                        // Same bridge width the pathfinder uses (checkPathBlocked / nav grid),
                        // so a troop is never told to cross at an x the clamp then blocks.
                        let onBridge = bxs.some(bx => Math.abs(this.x - bx) <= 30);
                        if (!onBridge) this.y = (preY <= RY) ? Math.min(this.y, RY - band) : Math.max(this.y, RY + band);
                    }
                }
            }

            // Princes charge/dash — and so do EVO Royal Recruits. A unit being knocked
            // back can't build up its charge, and the dash needs a real RUN-UP
            // (60px of walking) before it kicks in.
            if ((this.c.n === "Prince" || this.c.n === "Dark Prince" ||
                (this.c.n === "Royal Recruits" && this.c.isEvo)) && this.kbTime <= 0) {
                this.distWalked += Math.hypot(dx * this.c.s, dy * this.c.s);
                if (this.distWalked > 60) this.isCharging = true;
            }
        }
    }

    die(g) {
        // GOBLIN DEMOLISHER death blast — a big Wall-Breaker-style explosion: heavy on
        // the structure it dies on, half as much to nearby troops.
        if (this.c.n === "Goblin Demolisher") {
            for (let e of g.ents) {
                if (e.tm !== this.tm && e.hp > 0 && this.dist(e) < 55 + g.getHitboxRadius(e)) {
                    let isStruct = e.constructor.name === "Tower" || e.constructor.name === "Building";
                    e.hp -= isStruct ? 470 : 235;
                }
            }
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 55, 0, this.tm, false).asFireArea());
        }

        // The rage-ghost dissolves with the same spectral burst it formed from.
        if (this.isRageGhost) {
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 40, 0, this.tm, false).asPhantom());
        }

        // EVO Witch: each of HER summoned skeletons feeds her a chunk of HP when it
        // dies. At full HP it OVERHEALS — pushing her bar past max (rendered gold) — but
        // it's CAPPED at +50% of her original max, like the Evo Bats' HP gain.
        if (this.healWitch && this.healWitch.hp > 0 && this.healWitch.tm === this.tm) {
            this.healWitch.hp = Math.min(this.healWitch.mhp * 1.5, this.healWitch.hp + 70);
        }

        // Spirits do NOT burst on death — their splash only happens when they
        // actually jump onto a target (the hop landing). A spirit shot down on
        // the way just dies. (Wall Breakers likewise only explode on contact.)
        if (this.c.n === "Balloon") {
            // Shot down: drops a bomb that falls onto the balloon's shadow and
            // detonates after a 1.5s fuse for area DEATH damage to ground enemies
            // & structures (no instant blast).
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 52, 242, this.tm, false).asDeathBomb());
        }
        if (this.c.n === "Lumberjack" && !this.isRageGhost) {
            // Drops a bottle of Rage where it falls — smaller / shorter than the
            // spell (it lands instantly, no wind-up). (The ghost below drops NOTHING.)
            let p = new Proj(this.x, this.y, this.x, this.y, null, 0, false, 72, 140, this.tm, false).asRage(72, 240);
            p.rageWindup = 1; p.rageMax = 1; // drop activates almost immediately
            g.projs.push(p);

            // EVO: a translucent "ghost" lumberjack rises in the MIDDLE of that rage —
            // invisible & undetectable (enemies can't target it), 10% faster hit speed,
            // and alive only as long as the rage lasts. It can't drop rage or be cloned.
            if (this.c.isEvo) {
                let gc = Object.assign(Object.create(Object.getPrototypeOf(this.c)), this.c);
                gc.rt = Math.max(1, Math.round(this.c.rt * 0.9)); // +10% hit speed
                let ghost = new Troop(this.tm, this.x, this.y, gc);
                ghost.deployTime = 0;
                ghost.isRageGhost = true;
                ghost.rageSource = p;
                g.ents.push(ghost);
                // Spectral burst as the phantom forms.
                g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 40, 0, this.tm, false).asPhantom());
            }
        }
        if (this.c.n === "Golem") {
            this.spawnDeathTroops(g, g.getCard("Golemite") || { n: "Golemite", hp: 1039, ms: 25, fl: false, ar: false }, 2, 10);
            let p = new Proj(this.x, this.y, this.x, this.y, null, 0, false, 60, 320, this.tm, false);
            p.fireArea = true; p.isGray = true; p.life = 6;
            g.projs.push(p);
        } else if (this.c.n === "Golemite") {
            let p = new Proj(this.x, this.y, this.x, this.y, null, 0, false, 40, 79, this.tm, false);
            p.fireArea = true; p.isGray = true; p.life = 6;
            g.projs.push(p);
        } else if (this.c.n === "Lava Hound") {
            this.spawnDeathTroops(g, g.getCard("Lava Pup") || { n: "Lava Pup", hp: 134, ms: 50, fl: true, ar: false }, 6, 20);
        } else if (this.c.n === "Elixir Golem") {
            if (!this.isClone) g.giveElixir(1 - this.tm, 1.0);
            this.spawnDeathTroops(g, g.getCard("Elixir Golemite") || { n: "Elixir Golemite", hp: 762, ms: 25, fl: false, ar: false }, 2, 10);
        } else if (this.c.n === "Elixir Golemite") {
            if (!this.isClone) g.giveElixir(1 - this.tm, 0.5);
            this.spawnDeathTroops(g, g.getCard("Elixir Blob") || { n: "Elixir Blob", hp: 360, ms: 15, fl: false, ar: false }, 2, 8);
        } else if (this.c.n === "Elixir Blob") {
            if (!this.isClone) g.giveElixir(1 - this.tm, 0.5);
        } else if (this.c.n === "Skeleton Barrel") {
            // Real L11: 105 area death damage where it pops (the card's d), then the
            // crew bails out — 7 Skeletons hit the ground and carry on.
            let p = new Proj(this.x, this.y, this.x, this.y, null, 0, false, 55, this.c.d, this.tm, false);
            p.fireArea = true; p.isGray = true; p.life = 6;
            g.projs.push(p);
            this.spawnDeathTroops(g, g.getCard("Skeletons"), 7, 16);
        }

        if (this.curseTime > 0) {
            let hogCard = g.getCard("Cursed Hog") || { n: "Cursed Hog", hp: 520, ms: 20, fl: false, ar: false };
            let hog = new Troop(1 - this.tm, this.x, this.y, hogCard);
            // A CLONE is a 1-hp phantom — the hog it curses into is just as fragile.
            if (this.isClone) { hog._hp = 1; hog.mhp = 1; }
            g.ents.push(hog);
        }

        if (this.c.n === "Ice Golem") {
            // Slow Effect + Damage
            // Visual Indicator (Ice Nova)
            // Visual Indicator (Ice Nova) - Instant flash (Lifetime 3 ticks)
            // User requested "instant, delete the whole animation" - so we just show a quick flash.
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 80, 0, this.tm, false).asIceNova());

            // Projectile life will be handled in Proj.js or we set it here if Proj accepts it.
            // Proj.js sets life in asIceNova(). I should update Proj.js to set it effectively to 1 or 2.
            // Or I can modify Proj.js as planned.

            for (let e of g.ents) {
                if (e.tm !== this.tm && this.dist(e) < 80 + e.rad) {
                    e.hp -= 84; // Ice Golem death damage (real L11)
                    e.sl = 156; // 2.6 seconds slow (1.3x)
                }
            }
        }
    }

    // Spirit / Wall Breaker: die and deal the card's splash effect at this spot.
    // Called on contact and again on death (the flag prevents a double burst).
    explodeSpirit(g, t) {
        if (this.exploded) return;
        this.exploded = true;
        // Self-destruct bypasses any shield (an evo Wall Breaker's bomb shield must
        // not absorb its own suicide blast and leave it standing).
        this.shield = 0;
        this.hp = 0;

        if (this.c.n === "Fire Spirit") {
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 60, this.c.d, this.tm, false).asFireArea());
            return;
        }
        if (this.c.n === "Heal Spirit") {
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, true, 60, 30, this.tm, false).asHealEffect());
            return;
        }
        if (this.c.n === "Wall Breakers") {
            g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 60, 0, this.tm, false).asFireArea());
            // EVO with the bomb shield still intact: the bomb goes off WITH the
            // suicide blast — 392 + 288 = 680 to the structure it connects with.
            let bomb = this.bombArmed ? 288 : 0;
            this.bombArmed = false;
            for (let e of g.ents) {
                // Blast reaches the EDGE of big targets (a king's hitbox is wider
                // than the old flat 60, which made wall breakers whiff on kings).
                if (e.tm !== this.tm && this.dist(e) < 60 + g.getHitboxRadius(e)) {
                    if (e.constructor.name === "Tower" || e.constructor.name === "Building") e.hp -= this.c.d + bomb;
                    else e.hp -= Math.floor(this.c.d / 2) + bomb;
                }
            }
            return;
        }
        if (this.c.n === "Electro Spirit") {
            // find a chain start if none given
            if (!t || t.hp <= 0) {
                let min = 120; t = null;
                for (let e of g.ents) { if (e.tm !== this.tm && e.hp > 0) { let d = this.dist(e); if (d < min) { min = d; t = e; } } }
            }
            // Propagates target-to-target over time (visible in real time).
            if (t) g.projs.push(new Proj(this.x, this.y, t.x, t.y, null, 0, false, 0, 0, this.tm, false).asElectroChain(t, this.c.d));
            return;
        }
        // Ice Spirit (and any other): radial splash at this position. The Ice
        // Spirit's own freeze (~1s) is shorter than the Freeze spell (4s).
        for (let e of g.ents)
            if (this.dist(e) < 50 && e.tm !== this.tm) {
                e.hp -= this.c.d;
                if (this.c.n === "Ice Spirit") e.fr = 60;
            }
        // EVO Ice Spirit: plant a blue ice crystal on the troop it jumped onto; after a
        // ~1.1s delay it crashes back down for a second damage + area re-freeze pulse.
        if (this.c.n === "Ice Spirit" && this.c.isEvo) {
            let tgt = (t && t.hp > 0 && t.constructor.name === "Troop") ? t : null;
            let cx = tgt ? tgt.x : this.x, cy = tgt ? tgt.y : this.y;
            g.projs.push(new Proj(cx, cy, cx, cy, null, 0, false, 14, this.c.d, this.tm, false).asIceCrystal(tgt, this.c.d, 66));
        }
    }

    spawnDeathTroops(g, c, count, offset) {
        for (let i = 0; i < count; i++) {
            let angle = (count > 2) ? i * (Math.PI * 2 / count) : (i === 0 ? Math.PI : 0);
            let px = this.x + (count === 2 ? (i === 0 ? -offset : offset) : Math.cos(angle) * offset);
            let py = this.y + (count > 2 ? Math.sin(angle) * offset : 0);
            let t = new Troop(this.tm, px, py, c);
            t.deployTime = 0; // death-spawns appear instantly
            if (this.isClone) {
                t.hp = 1;
                t.mhp = 1;
                t.isClone = true;
            }
            g.ents.push(t);
        }
    }

    checkPathBlocked(g, x1, y1, x2, y2) {
        if (this.fly) return false; // flying units fly over the river and all buildings
        const RIV_Y = g.RIV_Y || 405; // live river position (sandbox world edit)
        if (!this.fly && !g.sandboxNoRiver) {
            if ((y1 < RIV_Y && y2 > RIV_Y) || (y1 > RIV_Y && y2 < RIV_Y)) {
                let t = (RIV_Y - y1) / (y2 - y1);
                let crossX = x1 + t * (x2 - x1);
                let bxs = g.bridgeXs || [W / 4, W * 3 / 4];
                let onBridge = bxs.some(bx => crossX >= bx - 30 && crossX <= bx + 30);
                if (!onBridge) return true;
            }
        }

        for (let e of g.ents) {
            if (e === this) continue;
            if (e.constructor.name === "Tower" || e.constructor.name === "Building") {
                // ALL structures are solid — including ENEMY towers/buildings (the nav
                // grid already routes around them; this check must agree, or the
                // "straight shot" would happily aim THROUGH an enemy tower and leave
                // the troop grinding against its wall instead of walking the path).
                if (e === this.currentTarget) continue; // walking INTO our target is the point
                // An obstacle sitting AT the target (e.g. an enemy attacking our own
                // tower) isn't really blocking — we CAN reach a unit next to it.
                if (Math.hypot(e.x - x2, e.y - y2) < e.rad + 25) continue;
                let hR = e.rad;
                let myR = g.getHitboxRadius(this);
                let safeDist = hR + myR + 5;
                if (this.ptSegDist(x1, y1, x2, y2, e.x, e.y) < safeDist) return true;
            }
        }
        return false;
    }

    getBlockingObstacle(g, x1, y1, x2, y2) {
        if (this.fly) return null; // flying units never need to path around buildings
        let obstacle = null;
        let minDist = Number.MAX_VALUE;
        let myHitbox = g.getHitboxRadius(this);

        for (let e of g.ents) {
            if (e === this) continue;
            if (e.constructor.name === "Tower" || e.constructor.name === "Building") {
                if (e === this.currentTarget) continue; // never route around our own target
                let hR = e.rad;
                let safeDist = hR + myHitbox + 5;
                let d = this.ptSegDist(x1, y1, x2, y2, e.x, e.y);
                if (d < safeDist) {
                    let distToObj = this.dist(e);
                    if (distToObj < minDist) {
                        minDist = distToObj;
                        obstacle = e;
                    }
                }
            }
        }
        return obstacle;
    }

    // Electro Giant: shock every enemy in the aura (damage + brief stun) and spawn a
    // short-lived beam flash from the giant to each.
    electroShock(g) {
        let auraR = (this.rad + 12) * 2.0, shocked = [];
        for (let e of g.ents) {
            if (e.tm !== this.tm && e.hp > 0 && e.constructor.name !== "Tower" && this.dist(e) < auraR + g.getHitboxRadius(e)) {
                e.hp -= 60; shocked.push(e);
                // Stun, but never CHAIN-stun the same unit into a permanent lock: a
                // given unit can be aura-stunned at most once per ~75 ticks, so it
                // always gets a window to move/attack between stuns (no "stuck").
                if (g.aiTick >= (e._egStunReady || 0)) { e.st = Math.max(e.st, 30); e._egStunReady = g.aiTick + 75; }
            }
        }
        if (shocked.length) {
            let beam = new Proj(this.x, this.y, this.x, this.y, null, 0, false, 0, 0, this.tm, false);
            beam.shockSrc = { x: this.x, y: this.y, fly: this.fly };
            beam.shockBeams = shocked.map(e => ({ x: e.x, y: e.y, fly: e.fly }));
            beam.life = 6; // appears and vanishes quickly
            g.projs.push(beam);
        }
    }

    // Launch `e` into a backward LEAP, away from this unit (Evo Mega Knight slam).
    // It arcs to a fixed landing point and touches down with a puff, no damage —
    // reusing the jump machinery (jp / jdx / jdy / jd) with a knockJump flag so the
    // landing code knows to skip the usual jump-land damage.
    launchKnockJump(g, e) {
        // Always launch the victim FORWARD — toward the Mega Knight's opponent tower
        // (up-field for team 0, down-field for team 1) — never off to the side.
        let dist = 55;
        let fwd = (this.tm === 0) ? -1 : 1;
        e.jdx = e.x;
        e.jdy = Math.max(12, Math.min(H - 12, e.y + fwd * dist));
        e.jd = Math.hypot(e.jdx - e.x, e.jdy - e.y) || 1;
        e.jp = true; e.fly = true;
        e.jpAge = 0;
        e.knockJump = true;
        e.preJump = 0;
        e.kbTime = 0; e.kbVX = 0; e.kbVY = 0;
        e.isCharging = false; e.distWalked = 0;
    }

    // Effective distance to the target for the in-reach test. Towers/buildings are
    // SQUARE: for melee, use Chebyshev distance (max axis), which equals the box
    // half-width anywhere on its perimeter — so a troop pressed against a CORNER
    // counts as touching and attacks instead of ramming the box forever.
    effReach(g, lk) {
        const cn = lk.constructor.name;
        if ((cn === "Tower" || cn === "Building") && this.c.rn <= 30) {
            return Math.max(Math.abs(lk.x - this.x), Math.abs(lk.y - this.y));
        }
        return this.dist(lk);
    }

    // Distance at which this troop can attack its current target. Melee units (short
    // range) must travel right ONTO a tower/building's square before they attack;
    // ranged units keep their full reach.
    attackReach(g, myHitbox, targetHitbox) {
        const lk = this.lk;
        const cn = lk.constructor.name;
        if ((cn === "Tower" || cn === "Building") && this.c.rn <= 30) {
            return myHitbox + lk.rad * 0.88 + 1; // attack only when right on the square — small area
        }
        let archer = (this.c.n.includes("Archer") && lk.fly) ? 60 : 0;
        return this.c.rn + myHitbox + targetHitbox + 2 + archer;
    }

    // A non-flying MELEE troop can't strike a target on the FAR side of the river —
    // straight-line range would otherwise let it stand on the bank "attacking" across
    // the water and never path across. It must reach the same bank (via a bridge)
    // first. Ranged units (rn > 30) may fire across.
    blockedByRiver(g, lk) {
        if (this.fly || g.sandboxNoRiver) return false;
        if (this.jp || this.preJump > 0) return false; // jumping troops ignore the river
        if (this.c.rn > 30) return false;
        const RIV_Y = g.RIV_Y || 405;
        if ((this.y < RIV_Y) === (lk.y < RIV_Y)) return false; // same bank — fight
        // Opposite banks: only blocked while the RIVER is between us (then we cross).
        // Once we've met at the bridge we FIGHT — troops don't have to cross; they can
        // duke it out on the bridge.
        let reach = g.getHitboxRadius(this) + g.getHitboxRadius(lk) + 8;
        return this.dist(lk) > reach;
    }

    findTarget(g) {
        const towers = [g.t1L, g.t1R, g.t1K, g.t2L, g.t2R, g.t2K];
        const isTower = e => towers.includes(e);

        // Lock on: once ATTACKING a living target (tower, unit, or building) the troop
        // stays committed and never peels off. The lock only breaks when it's no
        // longer attacking — i.e. stunned/frozen, pushed out of range, or the target
        // dies (all of which clear atk or fail the hp check below).
        if (this.atk && this.currentTarget && this.currentTarget.hp > 0 &&
            this.currentTarget.tm !== this.tm && this.currentTarget.rad !== 0 &&
            !this.currentTarget.isGhosted) {
            return;
        }

        // With NO enemy tower left (sandbox, or every lane objective destroyed)
        // troops see 5x further, so they hunt down the next troop instead of idling.
        const anyEnemyTower = g.ents.some(e => e.constructor.name === "Tower" && e.tm !== this.tm && e.hp > 0);
        const sight = anyEnemyTower ? this.sightRange : this.sightRange * 5;
        // Building-targeters (Giant, Hog, Balloon…) normally ignore troops. But once
        // there are NO enemy towers OR buildings left to attack, the "towers are no
        // longer an aspect" — they hunt the nearest enemy TROOP instead of stalling at
        // the bridge with nothing to path to.
        const anyEnemyStruct = g.ents.some(e => e.tm !== this.tm && e.hp > 0 &&
            (e.constructor.name === "Tower" || e.constructor.name === "Building"));

        // 1. Nearest valid enemy non-tower (unit or building) in sight.
        let distraction = null;
        let minDist = sight;
        for (let e of g.ents) {
            if (e.tm === this.tm || e.hp <= 0 || isTower(e)) continue;
            if (e.isGhosted) continue; // ghosts are invisible — never targeted
            if (g.predictedHp(e) <= 0) continue; // already dead-on-arrival — don't pile on
            let isBldg = e.constructor.name === "Building";
            if (this.c.t === 1 && !isBldg && anyEnemyStruct) continue; // building-targeters ignore units WHILE a structure stands
            if (e.fly && !this.air && !e.jp) continue; // a unit mid-LEAP can still be hit by ground troops
            let d = this.dist(e);
            if (d < minDist) { minDist = d; distraction = e; }
        }

        // 2. Lane tower (default objective). Null-safe: sandbox maps may have only
        // king towers (and a destroyed sandbox king is gone for good). A lane-assigned
        // troop (centre-placed split) heads for ITS lane's tower, not the nearest.
        const leftLane = (this.laneAssign !== undefined) ? this.laneAssign === 0 : this.x < W / 2;
        let primary;
        if (this.tm === 0) primary = (g.t2L && g.t2L.hp > 0 && leftLane) ? g.t2L : (g.t2R && g.t2R.hp > 0 && !leftLane) ? g.t2R : g.t2K;
        else primary = (g.t1L && g.t1L.hp > 0 && leftLane) ? g.t1L : (g.t1R && g.t1R.hp > 0 && !leftLane) ? g.t1R : g.t1K;
        if (primary && primary.hp <= 0) primary = null;
        // King gone (lane objective dead-ends): pathfind to the NEAREST living enemy
        // tower instead — a cross-lane princess or an extra sandbox tower — so combined
        // with the distraction scan the troop always heads for the nearest enemy
        // troop, tower, or building.
        if (!primary) {
            let bd = Infinity;
            for (let e of g.ents) {
                if (e.constructor.name !== "Tower" || e.tm === this.tm || e.hp <= 0) continue;
                let d = this.dist(e);
                if (d < bd) { bd = d; primary = e; }
            }
        }

        // COMMIT to the TOWER we're already going for — once a troop targets a tower it
        // never switches to a DIFFERENT tower (e.g. after drifting across the lane line);
        // it only changes objective if that tower dies (handled above, primary = null).
        if (this.currentTarget && isTower(this.currentTarget) &&
            this.currentTarget.hp > 0 && this.currentTarget.tm !== this.tm) {
            primary = this.currentTarget;
        }

        // 3. Decide with hysteresis: keep the current distraction unless it dies /
        // leaves sight, or a notably closer one appears (avoids flip-flopping).
        const cur = this.currentTarget;
        const curOK = cur && cur.hp > 0 && cur.rad !== 0 && cur.tm !== this.tm &&
            !cur.isGhosted && g.predictedHp(cur) > 0 &&
            !isTower(cur) && !(cur.fly && !this.air && !cur.jp) && this.dist(cur) <= sight;

        // Compare against the tower's EDGE, not its (far) centre — towers are large,
        // so a troop right next to one should attack it, not get pulled to a unit
        // that's closer to the tower's middle.
        const towerReach = primary ? Math.max(0, this.dist(primary) - primary.rad) : Infinity;

        let target;
        if (curOK) {
            // Same rule for BUILDINGS — never abandon the building we're going for for a
            // DIFFERENT building, UNLESS a new building was just placed (buildingGen bump).
            let curBldg = cur.constructor.name === "Building";
            let distBldg = distraction && distraction.constructor.name === "Building";
            if (curBldg && distBldg && distraction !== cur && (g.buildingGen || 0) === this.targetGen) {
                target = cur;
            } else {
                target = (distraction && distraction !== cur && this.dist(distraction) < this.dist(cur) * 0.6) ? distraction : cur;
            }
        } else if (distraction && this.dist(distraction) < towerReach &&
            (!primary || !this.checkPathBlocked(g, this.x, this.y, distraction.x, distraction.y))) {
            // When choosing (not yet attacking): a unit/building CLOSER than the lane-tower
            // edge is engaged — a troop never ignores a closer enemy on the way (only a
            // friendly structure blocking the path makes it route to the tower instead).
            target = distraction;
        } else {
            // No tower, building, or enemy troop anywhere to chase: nothing to do.
            // (With NO enemy on the board at all, the troop simply idles — it doesn't
            // wander off across the bridge. Any enemy that exists is found above via
            // the 5x sight scan and chased, towers or not.)
            target = primary;
        }

        // Remember the building "generation" we committed to, so a later new-building
        // placement (which bumps buildingGen) is what re-opens building re-targeting.
        if (target && target.constructor && target.constructor.name === "Building") this.targetGen = (g.buildingGen || 0);

        if (target !== this.currentTarget) {
            this.currentTarget = target;
            this.currentWaypoint = null;
        }
    }

    ptSegDist(x1, y1, x2, y2, px, py) {
        let x21 = x2 - x1;
        let y21 = y2 - y1;
        let xP1 = px - x1;
        let yP1 = py - y1;
        let t = (xP1 * x21 + yP1 * y21) / (x21 * x21 + y21 * y21);
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        let dx = px - (x1 + t * x21);
        let dy = py - (y1 + t * y21);
        return Math.hypot(dx, dy);
    }
}
