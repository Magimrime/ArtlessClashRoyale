import Troop from './Troop.js';
import Card from '../models/Card.js';
import Tower from './Tower.js';
import Building from './Building.js';

export default class Proj {
    constructor(x, y, tx, ty, t, s, sp, r, d, tm, bar) {
        this.x = x;
        this.y = y;
        // Previous-tick position, used for render interpolation.
        this.lx = x;
        this.ly = y;
        this.tx = tx;
        this.ty = ty;
        this.t = t; // Target entity
        this.spd = s;
        this.spl = sp; // Splash?
        this.rad = r;
        this.dmg = d;
        this.tm = tm;
        this.barrel = bar;
        this.life = sp ? 10 : 1000;

        // Flags
        this.isRoot = false;
        this.isFreeze = false;
        this.barbBarrel = false;
        this.miniFireball = false;
        this.isHeal = false;
        this.barbBreak = false;
        this.fireArea = false;
        this.redArea = false;
        this.brownArea = false;
        this.poison = false;
        this.graveyard = false;
        this.delayedSplash = false;
        this.shouldStun = false;
        this.isLightBlue = false;
        this.isClone = false;
        this.isCurse = false;
        this.isGray = false;
        this.hasKnockback = false;
        this.isRolling = false;
        this.isArrows = false;

        // Spell-arc (launched from the king tower, arcs to a target then bursts)
        this.isSpellArc = false;
        this.arcMax = 0;
        this.totalDist = 0;
        this.arrowBurst = false;
        this.spellKind = null;
        this.barrelGoblins = false;
        this.flashCol = null;
        this.isSpellDrop = false;
        this.dropKind = null;
        this.dropMax = 0;
        this.crownMult = 1.0; // spells deal reduced damage to crown towers

        this.stunDuration = 30;
        this.chainTargets = null;
        this.hitEntities = [];
    }

    asChain(a, b) {
        this.chainTargets = [a, b];
        this.life = 10;
        return this;
    }

    // Electro chain that propagates target-to-target over time (visible in real
    // time) instead of resolving instantly.
    asElectroChain(first, dmg) {
        this.electroChain = true;
        this.chainHit = [];
        this.chainCurrent = first;
        this.chainDmg = dmg;
        this.chainStep = 0;
        this.chainMax = 9;
        // The chain STARTS at its origin (the spirit's burst / the Tesla coil) so the
        // current is visible even against a single target — one node draws nothing.
        this.chainTargets = first ? [{ x: this.x, y: this.y, fly: false, isChainOrigin: true }, first] : [];
        this.life = 80;
        return this;
    }

    // Firecracker: the big rocket (bursts on its target into sparks)…
    asFirework() { this.firework = true; return this; }
    // …and one of the five SPARKS: an unlocked bullet flying a fixed heading that
    // PENETRATES — it damages every enemy it passes through (once each) and keeps going.
    asSpark(ang) {
        this.spark = true;
        this.sparkAng = ang;
        this.sparkHit = [];
        this.life = 15;
        return this;
    }

    asBarbBarrel() { this.barbBarrel = true; return this; }
    asMiniFireball() { this.miniFireball = true; return this; }
    asHealEffect() { this.isHeal = true; return this; }
    asLightBlue() { this.isLightBlue = true; return this; }
    asBarbBreak() { this.barbBreak = true; this.life = 6; return this; }
    asFireArea() { this.fireArea = true; this.life = 6; return this; }
    asRedArea() { this.redArea = true; this.life = 12; return this; }
    asBrownArea() { this.brownArea = true; this.life = 12; return this; }
    // Royale Delivery: a growing shadow as the crate falls (~1.5s) then it lands.
    asDelivery() { this.isDelivery = true; this.life = 95; this.deliveryMax = 95; return this; }
    asPoison() { this.poison = true; this.life = 480; return this; }       // ~8s, real Poison
    asGraveyard() { this.graveyard = true; this.life = 570; return this; }  // ~9.5s, real Graveyard
    asStun(duration = 30) { this.shouldStun = true; this.stunDuration = duration; return this; }
    asCurse() { this.isCurse = true; return this; }
    asRolling() { this.isRolling = true; this.life = 60; return this; }
    asArrows() { this.isArrows = true; this.life = 28; return this; } // 3 quick staggered waves
    // Placed spell that falls from the sky as a symbol, then resolves on impact.
    asSpellDrop(kind, col, life = 30) { this.isSpellDrop = true; this.dropKind = kind; this.flashCol = col; this.life = life; this.dropMax = life; return this; }
    asIceNova() { this.isIceNova = true; this.life = 5; return this; }
    // Rage: a bottle hops up (~0.45s wind-up) then splashes into a buff zone that
    // lasts `dur` ticks. d carries the small activation splash damage.
    asRage(rad, dur = 300) {
        this.isRage = true; this.rad = rad; this.rageDur = dur;
        this.rageWindup = 28; this.rageMax = 28; this.life = 28 + dur;
        return this;
    }
    // Balloon bomb: dropped on a target, sparks for ~0.5s, then explodes for area
    // damage (dmg/rad set on the Proj). Ground-only blast.
    asBomb() { this.isBomb = true; this.bombFuse = 48; this.bombMax = 48; this.life = 48; return this; }
    // Balloon DEATH bomb: when the balloon is shot down it drops a plain black
    // bomb that falls onto its shadow (dropFall ticks) and detonates after a
    // 1.5s (90-tick) fuse. Reuses the isBomb explosion path.
    asDeathBomb() { this.isBomb = true; this.isDeathBomb = true; this.bombFuse = 90; this.bombMax = 90; this.life = 90; this.dropFall = 16; this.dropMax = 16; return this; }
    // Ground-slam shockwave (Mega Knight spawn / jump landing): pure visual —
    // an expanding dust ring; rad is the blast radius it grows to.
    asShockwave() { this.isShockwave = true; this.life = 18; this.shockMax = 18; return this; }

    // A thrown stick of DYNAMITE (Goblin Demolisher) — arcs from thrower to (tx,ty) with
    // a ground shadow, then bursts into an area fire blast on landing.
    asDynamite(dmg) {
        this.isDynamite = true; this.dmg = dmg; this.spd = 2.5; // 2x slower travel
        this.dynTotal = Math.max(1, Math.hypot(this.tx - this.x, this.ty - this.y));
        this.life = 2000;
        return this;
    }

    // Spectral burst — a green phantom ring + rising wisps, for the Evo Lumberjack
    // rage-ghost appearing and dissolving.
    asPhantom() { this.isPhantom = true; this.life = 22; this.phantomMax = 22; return this; }

    // Expanding electric ring (Evo Zap) in the given colour — expands slowly (same max
    // radius, but reached over 3x the time).
    asElectricRing(col) { this.isElectricRing = true; this.flashCol = col || "#d98cff"; this.life = 90; this.ringMax = 90; return this; }

    // A blue ice crystal that LINGERS on the troop an Evo Ice Spirit jumped on, then
    // SPLASHES down again after `delay` ticks for extra damage + an area re-freeze.
    asIceCrystal(target, dmg, delay) {
        this.isIceCrystal = true; this.iceTarget = target; this.dmg = dmg;
        this.iceDelay = delay; this.iceMax = delay; this.life = delay + 6;
        return this;
    }

    asLog() { this.isLog = true; this.asRolling(); this.life = 110; return this; }
    asBarbBarrelLog() { this.isLog = true; this.barbBarrelLog = true; this.asRolling(); return this; }

    // Spell thrown from the king tower that arcs to (tx,ty) then bursts. The
    // arc height (arcMax) drives the flying shadow gap in rendering.
    asSpellArc(h, kind) {
        this.isSpellArc = true;
        this.spl = false;
        this.arcMax = h;
        this.spellKind = kind || "fireball";
        this.totalDist = Math.max(1, Math.hypot(this.tx - this.x, this.ty - this.y));
        this.life = 2000;
        return this;
    }

    // Damage to apply to one entity — reduced against crown towers (spells only;
    // crownMult is 1.0 for normal projectiles).
    hitDmg(e) {
        return (e instanceof Tower) ? this.dmg * this.crownMult : this.dmg;
    }

    // AoE damage + effects applied when an arcing spell lands.
    burstSpell(g) {
        if (this.barrelGoblins) {
            let gob = g.getCard("Goblins");
            // Evo Goblin Barrel decoy: the fake barrel pops FAKE goblins — they look
            // identical but deal 70% less damage and attack 30% slower.
            if (this.fakeGoblins) {
                let f = Object.assign(Object.create(Object.getPrototypeOf(gob)), gob);
                f.d = Math.max(1, Math.round(gob.d * 0.3));
                f.rt = Math.round(gob.rt / 0.7);
                f.s = gob.s * 0.7;       // 30% slower movement too
                f.isFake = true;          // rendered lighter / washed-out
                gob = f;
            }
            // Spread them out a bit so they don't spawn on top of each other, and
            // give them no deploy cooldown (they act immediately).
            for (const [ox, oy] of [[0, -14], [-16, 9], [16, 9]]) {
                let t = new Troop(this.tm, this.tx + ox, this.ty + oy, gob);
                t.deployTime = 0;
                g.ents.push(t);
            }
            return;
        }
        for (let e of g.ents) {
            // `tightArea` (Zap): a unit is hit only if its CENTRE is inside the circle — the
            // effect matches the drawn circle exactly. Others hit anything overlapping it.
            if (e.tm !== this.tm && Math.hypot(this.tx - e.x, this.ty - e.y) < this.rad + (this.tightArea ? 0 : e.rad)) {
                e.hp -= this.hitDmg(e);
                if (this.shouldStun) e.st = this.stunDuration;
                if (this.isRoot) e.rt = 84;
                if (this.isFreeze) e.fr = 240;
                // Fireball: the slow chain (50% 0.6s -> 80% 1s) begins 0.3s after the
                // hit. The knockback is a SINGLE, larger shove at impact (below).
                if (this.spellKind === "fireball" && e instanceof Troop && !(e instanceof Tower) && !(e instanceof Building)) {
                    e.fbSlowDelay = 18;
                }
                if (this.hasKnockback && e instanceof Troop && !(e instanceof Tower) && !(e instanceof Building)) {
                    // A Fireball shoves EVERY troop it hits — ground OR air — into a
                    // friction slide (heavies resist, handled in applyKnockback). Other
                    // knockback spells push a little less.
                    let ang = Math.atan2(e.y - this.ty, e.x - this.tx);
                    // A Fireball shoves even the Hopper back (hopperToo); lesser knockback
                    // spells leave the Hopper planted.
                    e.applyKnockback(ang, (this.spellKind === "fireball") ? 42 : 28, false, this.spellKind === "fireball");
                }
            }
        }
        if (this.arrowBurst) {
            g.projs.push(new Proj(this.tx, this.ty, this.tx, this.ty, null, 0, true, this.rad, 0, this.tm, false).asArrows());
        } else {
            let f = new Proj(this.tx, this.ty, this.tx, this.ty, null, 0, false, this.rad, 0, this.tm, false);
            f.fireArea = true; f.life = 10; // brief, harmless explosion flash
            f.flashCol = (this.spellKind === "snowball") ? "#cfeeff" : "#ff7a1e";
            g.projs.push(f);
        }
    }

    upd(g) {
        if (this.electroChain) {
            this.life--;
            if (--this.chainStep <= 0 && this.chainHit.length < this.chainMax && this.chainCurrent && this.chainCurrent.hp > 0) {
                this.chainStep = 4; // jump to the next target every 4 ticks
                let c = this.chainCurrent;
                if (!this.chainHit.includes(c)) { c.hp -= this.chainDmg; c.st = Math.max(c.st, 16); this.chainHit.push(c); } // slightly longer stun
                let next = null, nMin = 85; // shorter chain reach
                // Only hunt a next link if the cap allows another hit — otherwise the
                // VISUAL would hop to a unit the chain never actually damages. Ghosts
                // are untouchable: the current never arcs to (or stuns) a phantom.
                if (this.chainHit.length < this.chainMax) {
                    for (let e of g.ents) {
                        if (e.tm !== this.tm && e.hp > 0 && !e.teslaHidden && !e.isGhosted && !(e.sjT > 0) && !this.chainHit.includes(e) && c.dist(e) < nMin) { nMin = c.dist(e); next = e; }
                    }
                }
                this.chainCurrent = next;
                // Keep the finished current on screen for a good half second — the old
                // 8-tick (0.13s) clamp made single-target zaps practically invisible.
                if (next) this.chainTargets.push(next); else this.life = Math.min(this.life, 30);
            }
            if (this.chainHit.length >= this.chainMax) this.life = Math.min(this.life, 30);
            return;
        }
        if (this.spark) {
            this.life--;
            this.x += Math.cos(this.sparkAng) * this.spd;
            this.y += Math.sin(this.sparkAng) * this.spd;
            // PENETRATING: hit everything it passes through, once each, and fly on.
            for (let e of g.ents) {
                if (e.tm === this.tm || e.hp <= 0) continue;
                if (e.isGhosted || e.teslaHidden || e.sjT > 0) continue;
                if (this.sparkHit.includes(e)) continue;
                if (Math.hypot(this.x - e.x, this.y - (e.y - (e.fly ? 22 : 0))) < 6 + g.getHitboxRadius(e)) {
                    e.hp -= this.dmg;
                    this.sparkHit.push(e);
                }
            }
            return;
        }

        if (this.chainTargets || this.barbBreak || this.isIceNova || this.shockBeams || this.isShockwave || this.isPhantom || this.isElectricRing) {
            this.life--; // brief visual-only flashes count down and vanish
            return;
        }

        if (this.isDynamite) {
            // Arc toward the landing spot; burst into an area fire blast on arrival.
            let a = Math.atan2(this.ty - this.y, this.tx - this.x);
            let d = Math.hypot(this.tx - this.x, this.ty - this.y);
            if (d <= this.spd) {
                const hb = e => (g.getHitboxRadius ? g.getHitboxRadius(e) : e.rad);
                for (let e of g.ents)
                    if (e.tm !== this.tm && e.hp > 0 && Math.hypot(this.tx - e.x, this.ty - e.y) < 29 + hb(e))
                        e.hp -= this.dmg * 2; // 2x stronger blast
                g.projs.push(new Proj(this.tx, this.ty, this.tx, this.ty, null, 0, false, 29, 0, this.tm, false).asFireArea());
                this.life = 0;
                return;
            }
            this.x += Math.cos(a) * this.spd;
            this.y += Math.sin(a) * this.spd;
            return;
        }

        if (this.isIceCrystal) {
            // Ride the target it was planted on (if still alive), then re-splash.
            if (this.iceTarget && this.iceTarget.hp > 0) { this.x = this.iceTarget.x; this.y = this.iceTarget.y; }
            this.life--;
            if (this.iceDelay-- <= 0) {
                for (let e of g.ents)
                    if (e.tm !== this.tm && e.hp > 0 && Math.hypot(this.x - e.x, this.y - e.y) < 55 + (g.getHitboxRadius ? g.getHitboxRadius(e) : e.rad)) {
                        e.hp -= this.dmg;
                        e.fr = 72; // a longer area re-freeze
                    }
                g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, 60, 0, this.tm, false).asIceNova());
                this.life = 0;
            }
            return;
        }

        if (this.isSpellArc) {
            let d = Math.hypot(this.tx - this.x, this.ty - this.y);
            if (d <= this.spd) {
                this.x = this.tx; this.y = this.ty;
                this.life = 0;
                this.burstSpell(g);
            } else {
                let a = Math.atan2(this.ty - this.y, this.tx - this.x);
                this.x += Math.cos(a) * this.spd;
                this.y += Math.sin(a) * this.spd;
            }
            return;
        }

        if (this.isBomb) {
            this.life--;
            if (this.dropFall > 0) this.dropFall--; // death bomb falls onto the shadow first
            if (this.bombFuse > 0) {
                this.bombFuse--;
                if (this.bombFuse === 0) {
                    // Explode: ground-only area damage + a visible blast (shockwave +
                    // fire flash) that renders ABOVE the tower.
                    for (let e of g.ents) {
                        if (e.tm !== this.tm && e.hp > 0 && !e.fly &&
                            Math.hypot(this.x - e.x, this.y - e.y) < this.rad + (g.getHitboxRadius ? g.getHitboxRadius(e) : e.rad))
                            e.hp -= this.dmg;
                    }
                    g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, this.rad, 0, this.tm, false).asShockwave());
                }
            }
            return;
        }

        if (this.isRage) {
            this.life--;
            if (this.rageWindup > 0) {
                this.rageWindup--;
                if (this.rageWindup === 0) {
                    // Bottle landed: small activation splash to enemies, splash visual.
                    for (let e of g.ents) {
                        if (e.tm !== this.tm && e.hp > 0 && Math.hypot(this.x - e.x, this.y - e.y) < this.rad + (g.getHitboxRadius ? g.getHitboxRadius(e) : e.rad))
                            e.hp -= this.dmg;
                    }
                    g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, this.rad, 0, this.tm, false).asShockwave());
                }
                return;
            }
            // Active buff zone: rage every friendly TROOP currently in range (NOT
            // towers or buildings). Set to 2 (not a long timer) so the buff drops the
            // moment a unit leaves the pool or the pool expires — no lingering rage.
            for (let e of g.ents) {
                if (e.tm === this.tm && e.hp > 0 && e.constructor.name === "Troop" &&
                    Math.hypot(this.x - e.x, this.y - e.y) < this.rad + (g.getHitboxRadius ? g.getHitboxRadius(e) : e.rad))
                    e.ragedTime = 2;
            }
            return;
        }

        if (this.poison) {
            this.life--;
            if (this.life % 48 === 0) { // damage tick ~0.8s, ~10 ticks over 8s
                for (let e of g.ents) {
                    if (e.tm !== this.tm && Math.hypot(this.x - e.x, this.y - e.y) < this.rad) {
                        e.hp -= this.hitDmg(e);
                    }
                }
            }
            return;
        }

        if (this.graveyard) {
            this.life--;
            if (this.life % 30 === 0) { // spawn a skeleton every ~0.5s
                let angle = Math.random() * Math.PI * 2;
                let dist = Math.sqrt(Math.random()) * (this.rad);
                let sk = new Troop(this.tm, this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, g.getCard("Skeletons"));
                sk.deployTime = 0; // graveyard skeletons move immediately
                g.ents.push(sk);
            }
            return;
        }

        // Royale Delivery: the crate's shadow grows for ~1.5s, then it lands —
        // dealing its impact damage and dropping a Royal Recruit.
        if (this.isDelivery) {
            this.life--;
            if (this.life === 5) {
                for (let e of g.ents) {
                    if (e.tm !== this.tm && Math.hypot(this.x - e.x, this.y - e.y) < this.rad + e.rad) e.hp -= this.hitDmg(e);
                }
                g.ents.push(new Troop(this.tm, this.x, this.y, g.getCard("Royal Recruits")));
                if (g.addDeploy) g.addDeploy(this.x, this.y, this.tm);
                let f = new Proj(this.x, this.y, this.x, this.y, null, 0, false, this.rad, 0, this.tm, false);
                f.brownArea = true; f.life = 11; f.impactCol = "#c79a5e"; // match the cardboard package
                g.projs.push(f);
            }
            return;
        }

        // Arrows: 3 discrete waves, each dealing damage on impact (life 22/12/2,
        // matching the wave windows in drawArrowsVolley). One wave kills a skeleton.
        if (this.isArrows) {
            this.life--;
            if (this.life === 22 || this.life === 12 || this.life === 2) {
                for (let e of g.ents) {
                    if (e.tm !== this.tm && Math.hypot(this.x - e.x, this.y - e.y) < this.rad + e.rad) {
                        e.hp -= this.hitDmg(e);
                    }
                }
            }
            return;
        }

        if (this.spl || this.fireArea || this.redArea || this.brownArea) {
            if (this.isHeal) {
                this.life--;
                if (this.life === 5) {
                    for (let e of g.ents) {
                        if (Math.hypot(this.x - e.x, this.y - e.y) < this.rad + e.rad) {
                            if (e.tm === this.tm) {
                                if (!(e instanceof Tower) && !(e instanceof Building))
                                    e.hp = Math.min(e.mhp, e.hp + 300);
                            } else {
                                e.hp -= this.dmg;
                            }
                        }
                    }
                }
                return;
            }

            if (this.fireArea || this.redArea || this.brownArea) {
                this.life--;
                if (this.life === ((this.redArea || this.brownArea) ? 11 : 5)) {
                    for (let e of g.ents) {
                        if (e.tm !== this.tm && Math.hypot(this.x - e.x, this.y - e.y) < this.rad + e.rad) {
                            e.hp -= this.dmg;
                            if (this.hasKnockback && e instanceof Troop && !(e instanceof Tower) && !(e instanceof Building)) {
                                e.applyKnockback(Math.atan2(e.y - this.y, e.x - this.x), 26);
                            }
                        }
                    }
                }
                return;
            }

            this.life--;
            if (this.life === 5) {
                if (this.isVines) {
                    // Vines entangle only the 3 CLOSEST enemy units in the area: root +
                    // ground them and start the 3-pulse escalating DoT (the engine deals
                    // it per-tick). No instant hit — all the damage is in the pulses.
                    const hb = e => (g.getHitboxRadius ? g.getHitboxRadius(e) : e.rad);
                    let inRange = g.ents.filter(e => e.tm !== this.tm && e.hp > 0 &&
                        Math.hypot(this.x - e.x, this.y - e.y) < this.rad + hb(e));
                    inRange.sort((a, b) => Math.hypot(this.x - a.x, this.y - a.y) - Math.hypot(this.x - b.x, this.y - b.y));
                    for (let e of inRange.slice(0, 3)) {
                        e.rt = 84;                                  // rooted
                        e.vinedTime = 42; e.vineTick = 0; e.vinePulse = 0; // 3 escalating damage pulses
                        if (e.fly && e.constructor.name === "Troop") { e.fly = false; e.wasFlying = true; e.groundedTime = 42; }
                    }
                } else {
                    for (let e of g.ents) {
                        if (e.tm !== this.tm && Math.hypot(this.x - e.x, this.y - e.y) < this.rad + e.rad) {
                            e.hp -= this.hitDmg(e);
                            if (this.shouldStun) e.st = this.stunDuration;
                            if (this.isRoot) e.rt = 84;
                            if (this.isFreeze) e.fr = 240;
                        }
                    }
                }
                // EVO Zap: after the first strike, throw an expanding electric ring and a
                // delayed SECOND zap at a slightly larger radius.
                if (this.isEvoZap) {
                    g.projs.push(new Proj(this.x, this.y, this.x, this.y, null, 0, false, this.rad * 1.5, 0, this.tm, false).asElectricRing("#d98cff"));
                    let z2 = new Proj(this.x, this.y, this.x, this.y, null, 0, true, this.rad * 1.3, this.dmg, this.tm, false);
                    z2.crownMult = this.crownMult;
                    z2.asStun(this.stunDuration);
                    z2.asSpellDrop("zap", "#d98cff", 65); // 4x slower than the first strike
                    g.projs.push(z2);
                }
            }
            return;
        }

        if (this.barbBarrel) return;

        if (this.barrel) {
            let a = Math.atan2(this.ty - this.y, this.tx - this.x);
            let d = Math.hypot(this.tx - this.x, this.ty - this.y);
            this.x += Math.cos(a) * this.spd;
            this.y += Math.sin(a) * this.spd;
            if (d < this.spd) {
                this.life = 0;
                let gob = g.getCard("Goblins") || new Card("Goblins", 0, 90, 100, 1.7, 12, 0, 2, 60, 200, false, false);
                g.ents.push(new Troop(this.tm, this.x, this.y, gob));
                g.ents.push(new Troop(this.tm, this.x - 10, this.y + 10, gob));
                g.ents.push(new Troop(this.tm, this.x + 10, this.y + 10, gob));
            }
            return;
        }

        if (this.isRolling) {
            let a = Math.atan2(this.ty - this.y, this.tx - this.x);
            this.x += Math.cos(a) * this.spd;
            this.y += Math.sin(a) * this.spd;
            this.life--;

            for (let e of g.ents) {
                if (e.tm !== this.tm && !e.fly && !this.hitEntities.includes(e)) {
                    let hit = false;
                    if (this.isLog) {
                        // Rectangular collision
                        // Log width ~60 (was 120), Depth ~20 (was 40)
                        let w = this.barbBarrelLog ? 44 : 70;
                        let h = 20;
                        // Simple AABB check since log moves vertically mostly
                        if (Math.abs(this.x - e.x) < w / 2 + e.rad && Math.abs(this.y - e.y) < h / 2 + e.rad) {
                            hit = true;
                        }
                    } else {
                        let dist = Math.hypot(this.x - e.x, this.y - e.y);
                        if (dist < this.rad + e.rad) hit = true;
                    }

                    if (hit) {
                        e.hp -= this.hitDmg(e);
                        this.hitEntities.push(e);
                        if (!this.barbBarrelLog && e.mass <= 300 && e instanceof Troop) {
                            // Lighter units skid farther (mass-scaled), with friction. The
                            // Log rolls even the Hopper back (hopperToo).
                            e.applyKnockback(a, 34 * (1.0 - e.mass / 350.0), false, true);
                        }
                    }
                }
            }

            if (Math.hypot(this.tx - this.x, this.ty - this.y) < this.spd || this.life <= 0) {
                this.life = 0;
                if (this.barbBarrelLog) {
                    let barb = g.getCard("Barbarians");
                    let t = new Troop(this.tm, this.x, this.y, barb);
                    t.deployTime = 0; // no deploy cooldown
                    g.ents.push(t);
                }
            }
            return;
        }

        if (this.t) {
            // Home to the target's VISUAL body — an air troop's real position is its
            // raised sprite (22px up), not its ground shadow.
            this.tx = this.t.x;
            this.ty = this.t.y - (this.t.fly ? 22 : 0);
        }
        let a = Math.atan2(this.ty - this.y, this.tx - this.x);
        let d = Math.hypot(this.tx - this.x, this.ty - this.y);
        this.x += Math.cos(a) * this.spd;
        this.y += Math.sin(a) * this.spd;

        if (d < this.spd) {
            this.life = 0;
            if (this.firework) {
                // FIREWORK BURST: the rocket pops on its target (full damage), then
                // FIVE sparks fly ON THROUGH in a cone, penetrating troops behind it.
                if (this.t) this.t.hp -= this.dmg;
                for (let i = -2; i <= 2; i++) {
                    let sp = new Proj(this.x, this.y, this.x, this.y, null, 5, false, 4, Math.round(this.dmg / 3), this.tm, false).asSpark(a + i * 0.3);
                    if (this.t) sp.sparkHit.push(this.t); // the target already took the rocket
                    g.projs.push(sp);
                }
                let flash = new Proj(this.x, this.y, this.x, this.y, null, 0, false, 24, 0, this.tm, false).asFireArea();
                flash.flashCol = "#ff9ecb";
                g.projs.push(flash);
                return;
            }
            if (this.delayedSplash) {
                let splash = new Proj(this.x, this.y, this.x, this.y, null, 0, true, this.splashRad || 24, this.dmg, this.tm, false);
                if (this.isLightBlue) splash.asLightBlue();
                splash.life = 6;
                g.projs.push(splash);
                return;
            }
            if (this.t && !this.miniFireball) {
                if (this.isCurse && this.t instanceof Troop && this.t.isGhosted) {
                    // A ghost is a temporary phantom — the curse can't turn the ghost
                    // ITSELF into a hog. It just summons a regular hog for the witch's
                    // side, and the ghost is left untouched (alive, uncursed).
                    let hogCard = g.getCard("Cursed Hog") || { n: "Cursed Hog", hp: 520, ms: 20, fl: false, ar: false };
                    g.ents.push(new Troop(this.tm, this.t.x, this.t.y, hogCard));
                } else {
                    if (this.isCurse && this.t instanceof Troop) {
                        this.t.curseTime = 300;
                    }
                    this.t.hp -= this.dmg;
                    if (this.shouldStun) this.t.st = this.stunDuration;
                }
            }
            if (this.spl || this.miniFireball) {
                for (let e of g.ents) {
                    if (e.tm !== this.tm && Math.hypot(this.x - e.x, this.y - e.y) < this.rad + e.rad) {
                        e.hp -= this.dmg;
                        if (this.shouldStun) e.st = this.stunDuration;
                    }
                }
            }
        }
    }
}
