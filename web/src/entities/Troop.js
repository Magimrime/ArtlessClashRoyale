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
        this.cd = 0;
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

        this.lastPos = { x: 0, y: 0 };
        this.stuckTimer = 0;
        this.isStuck = false;
        this.stuckDir = 0;
        this.seekingPathDir = 0;

        this.kbX = 0;
        this.kbY = 0;
        this.kbTime = 0;

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
    }

    act(g) {
        // Shadow the module constant with the engine's LIVE river position so the
        // sandbox world editor can move the river (normal games keep 405).
        const RIV_Y = g.RIV_Y || 405;

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

        if (this.kbTime > 0) {
            // Knockback eases out: full speed at the start, slowing to a stop as the
            // timer runs down. (kbMax captures the peak duration on the first tick.)
            if (!this.kbMax || this.kbMax < this.kbTime) this.kbMax = this.kbTime;
            let f = this.kbTime / this.kbMax;
            this.x += this.kbX * f;
            this.y += this.kbY * f;
            this.kbTime--;
            this.isCharging = false; this.distWalked = 0; // a knockback stops a Prince's charge
        }

        if (this.curseTime > 0) this.curseTime--;
        if (this.sl > 0) this.sl--;

        let speedMult = (this.sl > 0) ? 0.65 : 1.0;

        if (["Zappies", "Sparky"].includes(this.c.n)) {
            let threshold = this.c.n === "Zappies" ? 72 : 180;
            if (this.chargeT < threshold) this.chargeT++;
        }

        if (this.hp <= 0) {
            this.die(g);
            return;
        }

        // Electro Giant: shocks on every attack (see the attack branch). When it is
        // NOT attacking, it still pulses a shock every 3 seconds.
        if (this.c.n === "Electro Giant" && !this.atk && g.aiTick % 180 === 0) this.electroShock(g);

        // Witch Spawn — 4 skeletons that act immediately (no deploy cooldown).
        if (this.c.n === "Witch") {
            if (this.spT-- <= 0) {
                this.spT = 400;
                for (const [ox, oy] of [[10, 0], [-10, 0], [0, 10], [0, -10]]) {
                    let t = new Troop(this.tm, this.x + ox, this.y + oy, g.getCard("Skeletons"));
                    t.deployTime = 0;
                    g.ents.push(t);
                }
            }
        }

        // Jump
        if (this.jp) {
            this.fly = true;
            if (this.jt) {
                let dx = this.jt.x - this.x;
                let dy = this.jt.y - this.y;
                let d = Math.hypot(dx, dy);
                let jumpSpeed = 2.0;

                // Jumping AT an entity (Mega Knight's attack jump): land on CONTACT —
                // collision keeps two bodies ~a hitbox apart, so requiring a near-zero
                // distance would leave the jumper airborne forever (the "flying Mega
                // Knights" pile-up). Static river-jump points still land exactly.
                let isEntity = !!this.jt.rad;
                let landReach = jumpSpeed + 1;
                if (isEntity) landReach = Math.max(landReach, g.getHitboxRadius(this) + g.getHitboxRadius(this.jt) + 2);
                let targetGone = isEntity && (this.jt.hp <= 0 || !g.ents.includes(this.jt));

                if (d < landReach || targetGone) {
                    if (!isEntity) { this.x = this.jt.x; this.y = this.jt.y; } // snap only to static points
                    this.jp = false;
                    this.fly = false;

                    if (this.c.n === "Mega Knight") {
                        for (let e of g.ents)
                            if (e.tm !== this.tm && !e.fly && this.dist(e) < 60)
                                e.hp -= 340; // jump-land area damage (real L11)
                    }
                } else {
                    this.x += (dx / d) * jumpSpeed;
                    this.y += (dy / d) * jumpSpeed;
                }
            } else {
                this.jp = false;
                this.fly = false;
            }
            return;
        }

        if (this.preJump > 0) {
            this.preJump--;
            if (this.preJump === 0 && this.jt && this.jt.hp > 0) {
                this.jp = true;
                this.kbTime = 0;
                this.jd = this.dist(this.jt);
            }
            return;
        }

        // (Spirits / Wall Breakers rush their target and explode on contact — handled
        // in the attack section below so they path via bridges and never shoot.)

        // Find the attack target every tick. findTarget keeps the current target
        // unless it dies or a clearly closer one appears (hysteresis), so this is
        // both responsive and jitter-free. The river crossing is handled purely in
        // movement below, so currentTarget stays the real tower/unit.
        this.findTarget(g);

        // Jumpers (Hog, Prince, ...) leap the river instead of using a bridge.
        if (!this.fly && !this.jp && this.currentTarget && !g.sandboxNoRiver &&
            ["Hog Rider", "Royal Hogs", "Prince", "Dark Prince"].includes(this.c.n)) {
            if (((this.y < RIV_Y) !== (this.currentTarget.y < RIV_Y)) && Math.abs(this.y - RIV_Y) < 40) {
                let bxs = g.bridgeXs || [W / 4, W * 3 / 4];
                let onBridge = bxs.some(bx => this.x >= bx - 30 && this.x <= bx + 30);
                if (!onBridge) {
                    this.jp = true;
                    this.kbTime = 0;
                    this.fly = true;
                    this.preJump = 0;
                    if (this.c.n === "Prince" || this.c.n === "Dark Prince") {
                        this.isCharging = false;
                        this.distWalked = 0;
                    }
                    let landingY = (this.y < RIV_Y) ? RIV_Y + 42 : RIV_Y - 42;
                    let angle = Math.atan2(this.currentTarget.y - this.y, this.currentTarget.x - this.x);
                    let dy = landingY - this.y;
                    let dx = 0;
                    if (Math.abs(Math.tan(angle)) > 0.1) dx = dy / Math.tan(angle);
                    if (dx > 45) dx = 45;
                    if (dx < -45) dx = -45;
                    this.jt = { x: this.x + dx, y: landingY, hp: 1 };
                    this.jd = this.dist(this.jt);
                }
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
            if (d > 75 && d < 85) {
                this.preJump = 30;
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
            this.dist(this.lk) <= this.attackReach(g, myHitbox, targetHitbox)) {
            this.atk = true;
            if (this.c.n === "Inferno Dragon") this.infernoTick++; // ramp EVERY tick while locked on
            if (this.rt > 0 && !this.fly) return;

            let isChargedSpecial = ["Zappies", "Sparky"].includes(this.c.n) && this.chargeT >= (this.c.n === "Zappies" ? 72 : 180);
            // A primed dash (Prince / Dark Prince / Evo Royal Recruits) strikes the
            // INSTANT it connects — no first-hit reload after the charge.
            let dashHit = this.isCharging && ["Prince", "Dark Prince", "Royal Recruits"].includes(this.c.n);
            if (this.cd-- > 0 && !isChargedSpecial && !dashHit) return;

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
                    let p = new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 14, false, 40, this.c.d, this.tm, false).asLightBlue();
                    p.delayedSplash = true;
                    p.life = 100;
                    g.projs.push(p);

                    let angle = Math.atan2(this.y - this.lk.y, this.x - this.lk.x);
                    this.kbTime = 12;
                    let speed = 30.0 / 12.0;
                    this.kbX = Math.cos(angle) * speed;
                    this.kbY = Math.sin(angle) * speed;
                }
            } else if (this.c.n === "Inferno Dragon") {
                let stage = Math.floor(this.infernoTick / (this.c.isEvo ? 49 : 58)); // evo charges 15% faster
                let mult = this.getInfernoMultiplier(stage);
                this.lk.hp -= this.c.d * mult;
            } else if (this.c.n === "Royal Giant") {
                let p = new Proj(this.x, this.y, this.lk.x, this.lk.y, this.lk, 9, false, 8, this.c.d, this.tm, false);
                p.isCannonball = true; // big dark cannonball
                g.projs.push(p);
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
            } else if (this.c.rn > 30) {
                let p = new Proj(this.x, srcY, this.lk.x, this.lk.y, this.lk, 8, false, 4, this.c.d, this.tm, false);
                if (["Wizard", "Witch", "Baby Dragon"].includes(this.c.n)) {
                    p.delayedSplash = true;
                    p.spl = false;
                    p.life = 100;
                }
                g.projs.push(p);
            } else {
                if (this.c.n === "Mega Knight") {
                    for (let e of g.ents)
                        if (e.tm !== this.tm && !e.fly && e.dist(this.lk) < 60)
                            e.hp -= this.c.d;
                } else {
                    let dmg = this.c.d;
                    if (this.c.n === "Prince" || this.c.n === "Dark Prince") dmg = Math.floor(dmg * 0.3);
                    if (this.isCharging) {
                        if (this.c.n === "Knight") dmg = Math.floor(dmg * 1.5);
                        else if (this.c.n === "Royal Recruits") dmg = Math.floor(dmg * 1.2); // evo dash: +20% first hit
                        else dmg *= 2;
                        this.isCharging = false;
                        this.distWalked = 0;
                    }
                    this.lk.hp -= dmg;
                }
            }
            this.cd = ["Zappies", "Sparky"].includes(this.c.n) ? 0 : this.c.rt;
            return;
        } else {
            this.atk = false;
            this.infernoTick = 0;
            this.cd = this.c.rt;
        }

        // 4. Movement
        if (this.c.s === 0) return;
        if (this.rt > 0) return;

        if (this.currentTarget) {
            let tx = this.currentTarget.x;
            let ty = this.currentTarget.y;

            // Staged lane movement: a ground troop only ever knows the NEXT step of
            // its lane, never the whole route. If it must cross the river it heads
            // (in order) to its own princess-tower lane, then the bridge entrance,
            // then the far bank — and only AFTER crossing does it path to the enemy
            // tower (which it approaches from the front, since it stays on the lane x).
            if (!this.fly && !g.sandboxNoRiver && (this.y < RIV_Y) !== (this.currentTarget.y < RIV_Y)) {
                let bxs = g.bridgeXs || [W / 4, W * 3 / 4];
                let laneX = bxs.reduce((a, b) => Math.abs(this.x - a) <= Math.abs(this.x - b) ? a : b);
                let pY = (this.tm === 0) ? 645 : 165;                 // own princess-tower y
                let side = (this.x >= laneX) ? 1 : -1;                // approach side
                // Clear of the princess's (rounded) friendly hitbox so the loop point is
                // reachable — the troop curves AROUND the side, never into the tower.
                let off = 41 + g.getHitboxRadius(this);
                let bx = Math.max(laneX - 22, Math.min(laneX + 22, this.x)); // CLOSEST point on the bridge
                let dyToP = (this.tm === 0) ? (this.y - pY) : (pY - this.y); // +behind/below, -in front
                let past = dyToP <= -10;
                // The princess loop only applies when an own princess actually STANDS
                // in this lane AND sits between the troop's side and the river. On
                // sandbox maps without princesses — or with a world-edited river moved
                // past y645/165 — skip straight to the bridge stages (otherwise the
                // loop waypoint can land inside the river and the troop never crosses).
                let ownP = (this.tm === 0) ? (laneX < W / 2 ? g.t1L : g.t1R) : (laneX < W / 2 ? g.t2L : g.t2R);
                let canLoop = ownP && ownP.hp > 0 && g.ents.includes(ownP) &&
                    ((this.tm === 0) ? pY > RIV_Y + 40 : pY < RIV_Y - 40);
                if (canLoop && dyToP > 10) {
                    // BEHIND/BELOW the princess: come up its near face on our approach
                    // side, staying outside the hitbox (loop step 1 → 2).
                    tx = laneX + side * off; ty = pY + ((this.tm === 0) ? 1 : -1) * (dyToP > off ? off * 0.5 : 6);
                } else if (canLoop && !past) {
                    // BESIDE the princess: slide forward to its FRONT (toward the bridge).
                    tx = laneX + side * off; ty = pY + ((this.tm === 0) ? -1 : 1) * off * 0.7;
                } else if ((this.tm === 0 && this.y > RIV_Y + 14) || (this.tm === 1 && this.y < RIV_Y - 14)) {
                    tx = bx; ty = (this.tm === 0) ? RIV_Y + 14 : RIV_Y - 14; // → closest bridge point
                } else {
                    tx = bx; ty = (this.tm === 0) ? RIV_Y - 45 : RIV_Y + 45; // cross
                }
            } else {
                // Same side as the target: attack a tower/building from its FRONT (the
                // face toward our home) so troops gather UNDER it, not off to the side.
                let cn = this.currentTarget.constructor.name;
                if (cn === "Tower" || cn === "Building") {
                    tx = this.currentTarget.x;
                    ty = this.currentTarget.y + ((this.tm === 0) ? 1 : -1) * this.currentTarget.rad * 0.7;
                }
                // A FRIENDLY building/tower (not our target) across the path: steer
                // around its side (handled by the collision otherwise).
                if (!this.fly) {
                    let obs = this.getBlockingObstacle(g, this.x, this.y, tx, ty);
                    if (obs && obs !== this.currentTarget) {
                        let off = obs.rad * 0.92 + g.getHitboxRadius(this) + 8;
                        let s = (this.x >= obs.x) ? 1 : -1;
                        tx = obs.x + s * off; ty = obs.y;
                    }
                }
            }

            // A troop right behind our own (wide) KING can't push through it — guide it
            // out to the nearer flank until it clears the king's width, then the normal
            // lane logic takes back over.
            if (!this.fly && !this.atk && !g.sandboxNoRiver && (this.y < RIV_Y) !== (this.currentTarget.y < RIV_Y)) {
                let kx = W / 2, ky = (this.tm === 0) ? 735 : 75;
                let kHalf = 50 * 0.92 + g.getHitboxRadius(this);
                let behind = (this.tm === 0) ? (this.y > ky - 10) : (this.y < ky + 10);
                if (behind && Math.abs(this.x - kx) < kHalf) {
                    let kside = (this.x >= kx) ? 1 : -1;
                    tx = kx + kside * (kHalf + 12);
                    ty = this.y + ((this.tm === 0) ? -1 : 1) * 18; // ease up the flank
                }
            }
            this.path = [{ x: tx, y: ty }]; // debug path shows only the next step

            this.moveTarget = { x: tx, y: ty };
            let dx = this.moveTarget.x - this.x;
            let dy = this.moveTarget.y - this.y;
            let dist = Math.hypot(dx, dy);

            if (!this.atk && dist > 1) {
                let movedDist = Math.hypot(this.x - this.lastPos.x, this.y - this.lastPos.y);
                if (movedDist < 0.5 * this.c.s) this.stuckTimer++;
                else {
                    this.stuckTimer = 0;
                    this.isStuck = false;
                }
                this.lastPos = { x: this.x, y: this.y };

                if (this.stuckTimer > 40) {
                    this.isStuck = true;
                    if (this.stuckDir === 0) this.stuckDir = (g.random() < 0.5) ? 1 : -1;
                }
            } else {
                this.stuckTimer = 0;
                this.isStuck = false;
                this.stuckDir = 0;
            }

            if (this.isStuck) {
                // On the bridge, never sidestep (that pushes units off into the
                // river and gets them stuck) — steer to the bridge centre and
                // keep pressing forward so the queue files across.
                if (Math.abs(this.y - RIV_Y) < 50) {
                    let bridgeX = (this.x < W / 2) ? W / 4 : W * 3 / 4;
                    let fwd = (this.tm === 0 ? -1 : 1);
                    dx = (bridgeX - this.x) * 0.15;
                    dy = fwd;
                    let m = Math.hypot(dx, dy) || 1;
                    dx /= m; dy /= m;
                } else {
                    dx = this.stuckDir;
                    dy = 0;
                    if (this.stuckTimer > 80) {
                        this.stuckDir *= -1;
                        this.stuckTimer = 41;
                    }
                }
            } else {
                if (dist > 0) {
                    dx /= dist;
                    dy /= dist;
                }
            }

            if (!this.atk) {
                // Dash speed: 2x for the Princes and Evo Royal Recruits alike.
                let chargeSpd = this.isCharging ? 2.0 : 1.0;
                this.x += dx * this.c.s * chargeSpd * speedMult;
                this.y += dy * this.c.s * chargeSpd * speedMult;
            }

            // Princes charge/dash — and so do EVO Royal Recruits. A unit being knocked
            // back can't build up its charge.
            if ((this.c.n === "Prince" || this.c.n === "Dark Prince" ||
                (this.c.n === "Royal Recruits" && this.c.isEvo)) && this.kbTime <= 0) {
                this.distWalked += Math.hypot(dx * this.c.s, dy * this.c.s);
                if (this.distWalked > 20) this.isCharging = true;
            }
        }
    }

    die(g) {
        // Spirits burst on death too (a spirit killed just before contact still
        // does its splash). Wall Breakers do NOT — they only explode on contact.
        if (this.c.n.includes("Spirit") && !this.exploded) {
            this.explodeSpirit(g, this.currentTarget);
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
        }

        if (this.curseTime > 0) {
            let hogCard = g.getCard("Cursed Hog") || { n: "Cursed Hog", hp: 520, ms: 20, fl: false, ar: false };
            g.ents.push(new Troop(1 - this.tm, this.x, this.y, hogCard));
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
            for (let e of g.ents) {
                if (e.tm !== this.tm && this.dist(e) < 60) {
                    if (e.constructor.name === "Tower" || e.constructor.name === "Building") e.hp -= this.c.d;
                    else e.hp -= Math.floor(this.c.d / 2);
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
                if (e.tm !== this.tm) continue;
                // An obstacle sitting AT the target (e.g. an enemy attacking our own
                // tower) isn't really blocking — we CAN reach a unit next to our tower.
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
                if (e.tm !== this.tm) continue;
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

    findTarget(g) {
        const towers = [g.t1L, g.t1R, g.t1K, g.t2L, g.t2R, g.t2K];
        const isTower = e => towers.includes(e);

        // Lock on: once ATTACKING a living target (tower, unit, or building) the troop
        // stays committed and never peels off. The lock only breaks when it's no
        // longer attacking — i.e. stunned/frozen, pushed out of range, or the target
        // dies (all of which clear atk or fail the hp check below).
        if (this.atk && this.currentTarget && this.currentTarget.hp > 0 &&
            this.currentTarget.tm !== this.tm && this.currentTarget.rad !== 0) {
            return;
        }

        // With NO enemy tower left (sandbox, or every lane objective destroyed)
        // troops see 5x further, so they hunt down the next troop instead of idling.
        const anyEnemyTower = g.ents.some(e => e.constructor.name === "Tower" && e.tm !== this.tm && e.hp > 0);
        const sight = anyEnemyTower ? this.sightRange : this.sightRange * 5;

        // 1. Nearest valid enemy non-tower (unit or building) in sight.
        let distraction = null;
        let minDist = sight;
        for (let e of g.ents) {
            if (e.tm === this.tm || e.hp <= 0 || isTower(e)) continue;
            let isBldg = e.constructor.name === "Building";
            if (this.c.t === 1 && !isBldg) continue; // building-targeters ignore units
            if (e.fly && !this.air) continue;
            let d = this.dist(e);
            if (d < minDist) { minDist = d; distraction = e; }
        }

        // 2. Lane tower (default objective). Null-safe: sandbox maps may have only
        // king towers (and a destroyed sandbox king is gone for good).
        let primary;
        if (this.tm === 0) primary = (g.t2L && g.t2L.hp > 0 && this.x < W / 2) ? g.t2L : (g.t2R && g.t2R.hp > 0 && this.x >= W / 2) ? g.t2R : g.t2K;
        else primary = (g.t1L && g.t1L.hp > 0 && this.x < W / 2) ? g.t1L : (g.t1R && g.t1R.hp > 0 && this.x >= W / 2) ? g.t1R : g.t1K;
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

        // 3. Decide with hysteresis: keep the current distraction unless it dies /
        // leaves sight, or a notably closer one appears (avoids flip-flopping).
        const cur = this.currentTarget;
        const curOK = cur && cur.hp > 0 && cur.rad !== 0 && cur.tm !== this.tm &&
            !isTower(cur) && !(cur.fly && !this.air) && this.dist(cur) <= sight;

        // Compare against the tower's EDGE, not its (far) centre — towers are large,
        // so a troop right next to one should attack it, not get pulled to a unit
        // that's closer to the tower's middle.
        const towerReach = primary ? Math.max(0, this.dist(primary) - primary.rad) : Infinity;

        let target;
        if (curOK) {
            target = (distraction && distraction !== cur && this.dist(distraction) < this.dist(cur) * 0.6) ? distraction : cur;
        } else if (distraction && this.dist(distraction) < towerReach &&
            (!primary || !this.checkPathBlocked(g, this.x, this.y, distraction.x, distraction.y))) {
            // When choosing (not yet attacking): a unit closer than the lane-tower edge
            // is preferred; otherwise head for the tower. With NO tower objective left
            // the path veto is skipped — the staged movement routes over a bridge.
            target = distraction;
        } else {
            target = primary;
        }

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
