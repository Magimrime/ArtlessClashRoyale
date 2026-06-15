# Artless Clash Royale — Update Timeline

The changelog as a timeline. Versions read **`year.major.minor.patch`**:

- **year** — `25` = 2025, `26` = 2026 (when the work happened)
- **major** — ticks up every time the whole game gets a new look (the **background color changes**). It **restarts at 1 each new year**, so `26.2` comes after `26.1`, and a fresh year begins again at `x.1`.
- **minor** — the update within that era
- **patch** — small bug-fix releases

We're currently on **26.3.13** — here's the whole road there.

---

## 25.1.x — Genesis (2025)
The earliest builds. Bare bones, but playable.

- **25.1.0** — First commit: the engine, two towers per side, elixir, and a starter set of troops.
- **25.1.1** — Added the **Royal Recruits**, then cleaned up their charge/shield logic.
- **25.1.2** — Added the **Barbarian Barrel**, then swapped it out for the **Royale Delivery**. Fixed Bat pathfinding, nerfed the Log's speed, and dialed in the Electro Giant (slower cooldown, bigger radius).
- **25.1.3** — Tore out all the leftover Java-era code and added a `.gitignore`. A quiet but important cleanup that left the project pure JavaScript.

## 26.1.x — The first facelift (2026)
A new year, so the major number restarts at **1**. The game gets its first real coat of paint and a wave of new content.

- **26.1.0** — First proper UI / style pass: menus, cards, and the early look. Also introduced the ghost rendering feature.
- **26.1.1** — Added the **Dark Prince** and a **hover preview** so you can see a card before placing it.
- **26.1.2** — Added the **Crate** building and buffed the Fire Spirit.
- **26.1.3** — A long balancing pull: nerfed overall troop speed and health, then re-adjusted health several times to get the feel right. Tidied the elixir-cost visuals and added unit names above cards (later removing the duplicate elixir number from the preview).

## 26.2.x — Going online (and the desync war)
The game moves into `web/` and learns to talk to a second player.

- **26.2.0** — **Multiplayer** arrives: host-authoritative "rooms" served by `server.js`.
- **26.2.1** — Smarter early-game enemy AI, and the first round of infinite-elixir fixes. Matches were shortened to 3 minutes.
- **26.2.2** — Added the **Ice Golem**, buffed the Giant and tower health, extended the Log's range, and squashed a pile of visual bugs (spell previews and sizes, the Sparky aura, flying-troop health, shield-health visibility).
- **26.2.3** — The desync saga. Sync was rough enough to earn commit messages like *"ts is ragebait."* It ended with a full rewrite to **snapshot interpolation**, a sync checker on every tick, a configurable multiplayer backend, and a fix for the blank loading screen.

## 26.3.x — The green revamp & the age of Evolutions
The big one. The background flips from **dark indigo (`#4B0082`) to the green field and menu** you see today, the core is rebuilt, and Evolutions take over the game. This whole era is major **3**, and it runs all the way to where we are now (**26.3.12**).

- **26.3.0** — *"Overly revamped the game."* Core game logic, entity management, and engine architecture rebuilt from the ground up; the new green look; deck building reworked; the enemy AI made meaningfully smarter. Fixed cards getting stuck at the bridge, troops clipping into towers, and shots firing from a unit's shadow.
- **26.3.1** — **Evolutions** introduced. The opponent also learned to assemble real pushes (and Arrows were buffed to answer them).
- **26.3.2** — **Sandbox mode** added — a free-play arena to test anything.
- **26.3.3** — **Evo Goblin Barrel, Musketeer, and Wall Breakers**; Mega Knight buffed; fighting interactions and sandbox bugs cleaned up.
- **26.3.4** — Added the **Three Musketeers** and **lane splitting** for centre-placed troops. Tower fire-rate and Spirits nerfed; split lanes fixed.
- **26.3.5** — Added the **Balloon, Lumberjack, Rage,** and the **Hopper**, plus **phone compatibility**.
- **26.3.6** — Evolutions for **Witch, Lumberjack, Skeleton Army, Ice Spirit, Zap,** and **Mega Knight**.
- **26.3.7** — Evolutions for **Royal Giant, Bats, Royal Hogs,** and **Minion Horde**, and the brand-new **Goblin Demolisher**.
- **26.3.8** — The knockback and jump engine. Knockback became a **friction slide** (shoved units skid to a smooth stop), and jumping was rebuilt: jumpers arc to a fixed landing point, leap **in front of** their target instead of over it, can be hit mid-air, and two leapers that collide just land short. The **Hopper** was finalized around this system — leap onto the nearest ground troop, push everything (air included), with a wind-up telegraph and ground-only damage.
- **26.3.9** — Card depth. The **Dark Prince** gained a **shield** and **splash** damage. The **Goblin Demolisher** became fully itself: it lobs an arcing red **dynamite** projectile, shows a **half-HP line** on its bar, and below that line it **charges the nearest building fast** and **detonates** with a Wall-Breaker-style death blast.
- **26.3.10** — Global balance, baked straight into the card stats: **+10% troop speed** (tanks and air units excluded; Knight and Royal Recruits included), **+20%** for spirits, Wall Breakers, Royal Hogs, and the Hog Rider, **tower hit-speed +16%**, and re-tuned **evo cycle costs**.
- **26.3.11** — Targeting and pathfinding overhaul. Troops now **commit to their objective** (never abandoning one tower for another, or one building for another unless a fresh one is placed), take a **straight line** when nothing's in the way (only weaving around towers or over to a bridge when they must), and **never ignore a closer enemy** on the path.
- **26.3.12** — The current polish-and-fix patch. Ghosts (the rage-ghost, fallen Skeleton-Army skeletons, evo-Minion phantoms) now render **see-through like clones** and are genuinely **untargetable**. Hunted down the stray gray **"render-ghost" dot** at its root — the ground-projectile pass was dropping a default lightgray circle under things it didn't recognize, which haunted the dynamite, the ice-spirit crystal, and the Electro Spirit's chain. Thrown projectiles got proper oval ground shadows. A troop knocked back at the arena edge no longer flies off — it's clamped back in. Also fixed the red team's Log/Barrel preview arrow, made a broken shield reveal the HP bar, kept your selected card through eraser and map switches (and stopped the eraser from showing a placement ghost while you drag to delete), and weakened the Skeleton-Army general's shield. Bug-fix patches from here bump the last number (**26.3.12.1**, **26.3.12.2**, …).
- **26.3.13** — Evo Skeletons go nuclear: they now multiply on a **fast timer** (not just when they swing) and the swarm cap is up from 8 to **12**, so a single evo skeleton balloons into a full pack in about a second and can trade with an enormous army. Also: a leap can no longer strand a unit off the edge — every jump now **lands inside the field** with a watchdog that forces an over-long hop down (no more troops "flying" at the edge). The **Mother Witch** got smarter conversions — cursing a **clone** makes a **1-HP** hog (as fragile as the clone was), and cursing a **ghost** summons a normal hog while **leaving the phantom alive**. Cleaned up the **Heal Spirit's** stray ground circle. Finally killed the **"summon ghost"** — a deploy-timer clock could outlive the fast suicide unit it belonged to, leaving a stray **gray dot** (player spirit) or **red dot** (enemy wall breaker) sitting at the drop point; the clock now vanishes the instant its unit does.

---

*The very first background was a dark indigo; everything from 26.3.0 on wears the green arena.
The major number restarts at 1 each new year, and ticks up within a year whenever the game gets another whole new look.*
