# Artless Clash Royale — Update Timeline

The changelog as a timeline. Versions read **`year.major.minor.patch`**:

- **year** — `25` = 2025, `26` = 2026 (when the work happened)
- **major** — ticks up every time the whole game gets a new look (the **background color changes**). It **restarts at 1 each new year**, so `26.2` comes after `26.1`, and a fresh year begins again at `x.1`.
- **minor** — the update within that era
- **patch** — small bug-fix releases

We're currently on **26.6.6** — here's the whole road there.

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
- **26.3.13** — **Evo Skeletons** were tuned: they still cap at **8** and only multiply when they **land a hit**, but the new skeleton now **appears instantly** (no materialize delay), so the swarm keeps replenishing even when one is being focus-fired 2-v-1. A leap can no longer strand a unit off the edge — every jump now **lands inside the field** with a watchdog that forces an over-long hop down (no more troops "flying" at the edge). The **Mother Witch** got smarter conversions — cursing a **clone** makes a **1-HP** hog (as fragile as the clone was), and cursing a **ghost** summons a normal hog while **leaving the phantom alive**. Cleaned up the **Heal Spirit's** stray ground circle, and a deploy clock can no longer outlive its unit.
- **26.3.14** — Found the **real** spirit "gray dot": the **placement hover ghost** (the preview under your finger before you drop a card) was routing spirits down the *spell* path, whose little white center-marker dot read as a stray gray dot. Spirits are troops again, so they preview like one. The hover ghost is now plain **white**, tinting **red only where you can't drop** (the river, on a structure, …) — including a new sandbox rule that blocks dropping troops **in the river** (bridges excepted). The sandbox **speed control is now a pop-up slider** — tap the **SPEED** button to open a 0.5×–10× bar you can drag to any 0.1 step, with 1/2/3/5/10× preset marks. Spirits render a touch **smaller**. **Evo Skeletons** sustain better: a new one is **combat-ready instantly**, and a skeleton's **dying retaliation hit still summons** a replacement, so two armies trading kills don't fizzle out. Patches (**.1–.3**): a leaping troop now arcs **smoothly from the ground** instead of popping up and dropping 22px (the real knocked-to-a-wall "teleport"); a unit launched onto a tower **slides out** rather than being ejected in a single frame; knockback **eases into walls**; and the **Mega Knight's melee-hit splash** was tightened to match the **Dark Prince's** (its jump-slam keeps its full radius).
- **26.3.15** — **Cards now show what they are.** Every card — in your hand and in the deck builder — uses one shared face: the **name across the top** and the **unit itself drawn underneath** (the same coloured discs you see when you go to place it; a tinted ring for a spell, a square for a building). The deck-builder tiles grew to a portrait shape so they read like the cards in your hand.
- **26.3.16** — Card faces refined: the deck builder now fits **4 cards per row** (taller, more vertical tiles), the unit art **never overlaps** and **scales to the unit's real size** (a Giant fills the card, a skeleton is small), and swarms show a **representative few** instead of cramming the whole spawn (Royal Recruits draws three, not six). Selecting a card's **evo** now stamps the **purple evolution gem** on its units so you see the evo version. And the **river is a true wall**: any ground troop that can't leap it is now physically kept **out of the water** — it must walk to a **bridge** to cross (verified: zero water-touches, still crosses promptly). Fliers and the river-jumpers (Hog Rider, Royal Hogs, Prince, Dark Prince) are unaffected.

## 26.4.x — The ocean arena
A new whole-game look: the field flips from the green grass to a **deep ocean blue** (`#2e7da0`), with matching blue menus, deck builder, and loading screen. That background change is what ticks the major up to **4**.

- **26.4.0** — The blue repaint, riding in on the new **card faces** and the **river-as-a-wall** pathfinding. The look is now a **choice**: a **gear button in the top-left** opens a dedicated **Settings screen** where you pick **Ocean / Grass / Indigo** (each option tinted with its own colour; your pick is saved), so the classic green arena is one tap away. **Bats** now spawn in a fixed **3-over-2 formation** instead of scattering. Card art got a consistency pass: every **trio** reads as the same **triangle** the skeletons use, **spell** cards show the **effect itself** (a coloured blast, a rolling log, a snowflake/bolt) instead of the dashed placement ring, and the **NEW CARD unlocked** screen uses the real card face. A Mother-Witch **curse on a flying unit** now renders on its **body**, not its ground shadow.
- **26.4.8** — **The game becomes a real desktop app.** An Electron shell wraps the exact same client and `server.js` (now importable as a module), and `npm run dist` builds a one-click **Windows installer** with its own gold-crown icon and a desktop shortcut. Saves live in the per-user app-data folder, launching a second copy just focuses the first, and the **Baloo 2 font is now self-hosted** in `web/fonts/` — so the installed game runs fully **offline** and still looks right.
- **26.4.9** — **…and a phone app too.** The site is now a **PWA**: open it on a phone and *Add to Home Screen* installs it with the crown icon, running **fullscreen portrait** like a real app. A service worker **precaches the whole game**, so once installed it plays fully **offline** (saves and multiplayer still need a connection); it always picks up the newest deploy when online. The crown also became the site **favicon** and the icon Windows shows in **Installed apps**.
- **26.4.10** — Menu tidy-up. The title-screen **gear** was redrawn as a smaller **solid cog**, the **cheat/debug** entry moved off its hidden title-screen corner and into the **Settings screen** as a proper button, and cards went **back to their classic plain look** — white face, centred name, elixir badge — dropping the unit-art card faces.
- **26.4.11** — Course correction on the look. The **unit-art card faces are back** (name on top, the unit drawn underneath) — 26.4.10 removed the wrong thing. What actually goes is the **Faux-3D battlefield shading**: troops and buildings drop the raised-block extrusion, contact-shadow ellipse, bevels, and specular glints, returning to the **classic flat look** (the original soft ground shadows stay). Also fixed the **TIEBREAKER! / 2x ELIXIR** banners drawing on top of each other — when both are up they now stack.
- **26.4.12** — **New app icon**: a simpler, cleaner **flat gold crown on royal blue** (no outlines, gem, or band), in the spirit of the real thing. Applied everywhere — the Windows app and installer, the desktop shortcut, the site favicon, and the phone home-screen icons.
- **26.4.13** — **Mirror grows up, and you can leave a match.** The **Mirror** card in your hand now **wears the face of the card it will replay** (art, name, and the **+1 cost**, tinted purple with a MIRROR tag), and placing it follows **that card's rules, visualized** — mirror a troop and the enemy half tints red with the troop's ghost and green/red hover cell; mirror a spell and it ranges anywhere, exactly as the real card would. Its own art (before you've played anything) is a plain **hand mirror**. A **SAVE+QUIT** button (top-left, single-player) saves your progress and exits the battle — an abandoned match counts for nothing. And the **app icon is now a flat skull** on the same royal blue — crown retired.
- **26.4.14** — The **Balloon got simple**: a blank **team-coloured** envelope (blue = yours, red = enemy) over a plain rectangle **basket** peeking out underneath — the ropes, panel seams, skull face, and bomb decorations are gone.
- **26.4.15** — Added the **Skeleton Barrel**, with **real Level-11 stats**: 3 elixir, **625 hp**, a Fast flying building-targeter with no attack of its own — when it's destroyed (or connects with its target) it pops for **105 area death damage** and bails out **7 Skeletons** where it fell. Drawn as a wooden barrel with hoop bands. Verified in a headless sim: pops on the tower for exactly 105, seven skeletons land and keep fighting.
- **26.4.16** — Taskbar-icon fix for the desktop app: the game now declares a **stable Windows taskbar identity** (Squirrel-style AppUserModelID) instead of one derived from the exe path, which changes every update and could leave the taskbar showing a stale blank icon for a running window.
- **26.4.17** — A **texture pass with a light hand**: every unit, building, tower, and the balloon now wears a **flat two-tone finish** — a darker edge band inside the rim plus one short lighter arc, all solid tones (no gradients, shadows, or gloss; tiny swarm bodies stay plain). **Mirror looks like the spell it was** again (the plain tinted disc, hand-mirror art removed) and got stricter: with **no previous card to copy it shows no placement ghost and refuses to play** — no spell-ring preview pretending otherwise.

## 26.5.x — The gameplay era
A major on request: not a new coat of paint this time, but the deepest gameplay-and-brains update the game has had.

- **26.5.0** — The big one, in eight movements:
  - **Smarter opponents that scale with YOU.** The enemy AI now reads your **win/loss ratio**: rookies (fresh save) react slowly, misplay counters, and leak elixir early; a winning streak buys you a sharp opponent with fast reactions, proper counters, **efficient trades** (it won't dump 5 elixir on your 2-elixir bait), an **elixir reserve** it refuses to dip below, and real **kiting** — cheap bait dropped mid-field to drag your tank away from its towers.
  - **Death prediction.** Troops track every shot already in flight: a target that's **dead-on-arrival is dropped** — attackers retarget or hold fire instead of overkilling, so three archers no longer waste three shots on one doomed skeleton.
  - **Pathfinding that follows its own path.** Found the real bug: the "straight shot" check ignored **enemy** structures while the route grid didn't, so troops beelined into tower walls and ground along them. Both now agree, string-pulled paths keep **body clearance** around corners, waypoints pop cleanly, and recompute churn is halved — troops visibly walk their lines.
  - **Formations are the truth.** One shared table drives deployment, the placement ghost, AND the card face — cards show **exactly** the formation you get (Skeleton Army's real 15-spiral, the Minion Horde cluster). Centre placements **split lanes by pathfinding** (each unit takes the lane it stands on) — never by stretching the formation. **Royal Recruits now guard the whole lane width.**
  - **Three new buildings** (real L11 stats): **Tesla** (954 hp, 190 dmg, hits air, 35s), **Bomb Tower** (1059 hp, 222 splash, ground-only, fused **death bomb**), and **Tombstone** (422 hp, a Skeleton every 3.5s, **4 burst out when it cracks**). Plus the **Firecracker** (300 hp, 168 spark-burst splash from 6 tiles — and the recoil **kicks her backward**).
  - **Building looks.** The **Cannon** is a round **wooden base with an actual cannon** that turns to track its target; the **Inferno Tower** is a circle with a core that flares as it burns; Tesla, Bomb Tower, and Tombstone each got their own simple shapes. The **Barbarian Barrel finally rolls as a barrel** — hoops and staves, not a log.
  - **Deaths and effects.** Units now **fall over and fade** when they die (the real-game feel), and explosions burst with an expanding **shock-ring and sparks**. A new **Graphics setting (High/Low)** in Settings strips all of that (and the two-tone finish) for a plain fast look.
  - **Two test maps** in the sandbox: **3 Bridges** (an extra middle crossing) and **Fortress** (the river becomes a **moat** hugging the enemy base — one central bridge is the only way in).
- **26.5.1** — Polish on the big one. **Tesla** is now a smaller **blue Inferno-style circle**; the **Bomb Tower** hides its bomb (plain stone circle); the **Tombstone** is **just a rock with a cross**; the **Balloon**'s envelope is a true **circle**; **Elite Barbarians** stand apart properly; the **Royal Recruits card** shows a representative **three at full size** (the real placement is still the whole lane). And the cheat got sneakier: the Settings screen hides a **small diamond icon** in the corner — click it to be offered the cheat; the **DEBUG MENU button only exists once you've actually cheated**.
- **26.5.2** — Formation truth, round two. **Minion Horde** deploys in **two neat rows of three**, **Zappies three abreast**, **Barbarians in a pentagon ring**; **Wall Breakers and Three Musketeers spawn close together** — their centre-placement lane split is pure **pathfinding**, not spawn spread. The **Tombstone looks like any other tower** (standard square, small cross on the face) and now **spawns Skeletons in pairs** (2 every 7s, the real cadence). And **Zap looks properly cool** when placed: the strike **forks** into side-bolts with a glow at the strike point, and the impact pops an **expanding electric ring with radial crackle** (High graphics).
- **26.5.3** — **Tesla zaps with CHAINED lightning** like the Electro Spirit — the current leaps from the coil to its target and can hop to two more nearby enemies. And the **Electro Spirit's chain is visible again**: the chain now starts at its origin point, so even a single-target zap draws the current (before, one target meant zero line segments and nothing rendered).
- **26.5.4** — The realism batch. **Tesla goes UNDERGROUND** when it has no target — a closed hatch that **can't be hit, targeted, or even walked around** (troops walk right over it; it pops up when something enters range, and its lifetime still ticks down). **Troops never slow down**: a jostle from another unit can no longer brake a walker — the push is rotated into a sideways **slide**, so crowds flow instead of grinding. **Tombstone is regular building size.** **Firecracker's range** trimmed to the real 6 tiles. Formation spacing fixed so **nobody spawns touching** (Wall Breakers, Three Musketeers, Elite Barbarians).
- **26.5.5** — **The zap you can actually SEE.** Found why electric chains felt invisible: a finished chain was clamped to an **8-tick (0.13-second!)** display life, so any single-target zap — the common case — flashed and was gone. Chains now linger a half second, and the current is REAL lightning: **jagged bolts that re-jitter every few frames, a bright white core, little forks flicking off the bends, and a spark on every zapped body**. Also: troops **funnel through the CENTRE of the bridge** (the path pins two centre waypoints at the crossing — no more hugging the bridge edge and grinding on the bank), the **Tesla's card art shows the raised tower** (not the buried state), and the concealed Tesla is a proper full-size **wooden cover** over the pit.
- **26.5.6** — Rules tightened like the real game. **Tesla never chains**: one bolt, one target, full damage (the lightning look stays; the chain no longer even *draws* a hop it wouldn't deal). **Ghosts are truly untouchable**: buildings can't target them and electric chains can't arc to or stun them. **A spirit mid-hop can't be attacked** — no targeting, no damage, nothing lands until it does (its own landing explosion still fires). **Zappies deploy in a triangle**, and the **Witch summons her 4 skeletons in a clear ring around her every 7 seconds** (they used to spawn inside her body and get shoved around, reading as fewer).
- **26.5.7** — **The Firecracker fires an actual FIREWORK**: a big pink rocket that pops on its target (full damage) and splits into **five smaller sparks that fly on through the enemy, PENETRATING every troop in their path** (56 each, one hit per troop per spark) — recoil hop intact. The **Witch's card face** now shows her real summon: four skeletons in a ring around her (not three at her feet). And the **Balloon draws bigger** — a properly balloon-sized envelope (its hitbox is unchanged).
- **26.5.8** — The Tesla **sinks and rises with an animation**: instead of snapping between tower and box, it now **drops into its pit as a two-panel wooden lid slides shut** (and rises back out, lid parting, to zap).
- **26.5.9** — Fixed 26.5.8's mistakes. The health bar is **supposed to stay visible** when the Tesla is covered (like the real game) — it's back. And the sink was drawn with a bad clip that **sliced the raised tower into a half-circle**; the retract is now a clean vertical **squash into the ground** (full round tower at rest, no clipping), with the wooden lid closing over it — and the HP bar shows in every state.
- **26.5.10** — **Three new cards**, all on real Level-11 stats:
  - **Valkyrie** (4 elixir, 2224 hp, 322 dmg, 1.5s hit speed) — her swing is a true **360° spin**: every ground enemy touching her is hit, not just the one she's facing.
  - **Executioner** (5 elixir, 1289 hp, 267 area dmg, 2.4s, 4.5-tile range, hits air) — throws a **boomerang axe** that flies out and comes back, **damaging everything it passes on both legs**, so a line of troops takes it twice.
  - **Giant Snowball** (2 elixir, 159 dmg) — a big packed snowball that **slows 35% for 2.5s and knocks back**. Its arc and blast radius had been sitting unused in the engine all along; now it has a card to go with them.
- **26.5.11** — Feel pass on the new three. The Executioner's **axe looks like an actual axe** (wooden haft, curved steel head), flies **bigger and slower**, and — like the real card — **travels further than his attack range** (4.5-tile range, ~6.3 tiles of travel), so it clips things standing behind his target. The **Valkyrie's spin is now a spin you can see**: her axe whips a full turn around her with a fading arc trail. And the **Firecracker's burst is much bigger** — 9 sparks in a wide fan (was 5), longer streaks, and a bigger pop.

## 26.6.x — Pixel (2026)
The game is pixel art now — every troop, tower, building, projectile, effect, spell zone, button, card and letter.

- **26.6.0** — **Everything is pixel art.** Every unit on the field is a 16x16 sprite drawn at a whole-pixel
  scale (troops and buildings at 2x, princess towers at 5x, kings at 6x) so nothing ever smears; the canvas
  itself now upscales with hard edges. Troops keep their status tints (freeze, slow, clone, ghost, fake, the
  Skeleton Army general) as a colour wash over the sprite with the art's shading intact. The top of every tower is its own
  sprite that turns on a fixed base, aiming in 16 crisp steps. Buildings: the Cannon turns to aim, the Tesla
  cross-fades between raised and covered, the Inferno Tower's core flares while it burns. Every projectile,
  explosion, ring and placed spell zone is a sprite; **placed spells wear their textures** (poison bubbles,
  graveyard headstones, the clone swirl, rage sparks, the ice flake). **The Zap is the hand-drawn zap art.**
  All text is a **hand-drawn 5x8 bitmap font** — 95 glyphs, proportionally spaced — at **one size everywhere**
  (only display titles are bigger): buttons, HUD, card names, unit names, the timer. The **elixir bar** is built from crisp pieces with a proper cost badge on
  every card; **cards wear 9-slice frames** coloured by elixir cost (green, blue, purple, pink), purple for a
  charged evolution, grey when you can't afford them, with the unit drawn big and sharp on the face and the
  formation cards laid out as they deploy. The river and bridges are tiled. Hand-edited sprites in
  `web/images/pixel/` are never overwritten by the generator. Under the hood: the service worker's precache was
  pointing at two deleted files and failing to install (offline play was dead) — fixed; and ~450 lines of code
  that could never run were removed (the faux-3D toggle and its helpers, seven unused projectile factories, the
  old pre-spell goblin-barrel path, seven unused AI helpers, two placeholder engine methods, an orphaned
  multiplayer module and stylesheet, cards that don't exist, and a dozen fields that were written but never read).
- **26.6.1** — **Three new cards**, all on real Level-11 stats:
  - **Hunter** (4 elixir, 885 hp, 84 damage × 10 pellets, 2.2s, 4 tiles, hits air) — a **shotgun**: ten pellets fan out in a
    cone and each one stops at the first thing it hits, so point-blank all ten land (840) and at range they scatter.
  - **Electro Wizard** (4 elixir, 714 hp, 115 damage, 1.8s, 5 tiles, hits air) — lightning from **both hands**: his target
    and the nearest other enemy each take a hit and a **0.5s stun**, and he **lands with a spawn zap** (192 damage, 0.5s stun,
    3 tiles).
  - **Bandit** (3 elixir, 906 hp, 194 damage, 1.0s, melee) — a ground target 3.5–6 tiles away triggers her **dash**: she
    closes the gap in 0.8s, **can't be hit on the way**, and lands a **389 double-damage** hit.
  Also fixed: the Valkyrie's and Executioner's sprites had been drawn at the default size — they now carry their real bulk.
- **26.6.2** — Polish. **Turning sprites are crisp**: a sprite is now rotated at its own 16-pixel resolution and *then*
  scaled up, so every turned pixel stays a whole block on the grid — rotating the already-enlarged image put each edge on
  a sub-pixel diagonal and read as blur. Applies to tower tops, the Cannon, the axe, dynamite and the tumbling barrel.
  The **Bandit leaves a trail** of fading afterimages while she dashes. The **king's shooter rises out of the middle** of
  the roof (through the vent) instead of the front. The **Skeleton Barrel is only ever dropped on your own half** — no
  pocket placement on the enemy side once a tower is down.
- **26.6.3** — **Smooth movement back.** The scene was drawn into a fixed 540×960 canvas that the browser then
  stretched to the window with hard-edged scaling — at any non-integer window size that drops or doubles a column,
  and the dropped column shifts as a unit moves, which read as jitter; sprites also snapped to whole canvas pixels.
  The game now renders into a **2–3× backing store** (sprites still at whole multiples of their 16-pixel art, so
  they stay crisp), positions snap to that finer grid, and the final fit-to-window scale is smooth. Movement was
  never bound to a grid — the textures just were. Also: the **name over a troop is small again** (the font at 1×;
  same glyphs, same pixels, just not doubled).
- **26.6.4** — **Turrets turn freely.** Tower tops, the Cannon, the axe, the dynamite and the tumbling barrel rotate to
  any angle (still spun at their own 16-pixel resolution, so they stay crisp) instead of stepping between sixteen
  headings. **Placement ghosts are the unit's own sprite** — see-through, white, red when the spot is invalid — laid
  out exactly as the card deploys, instead of plain discs. **The Zap is animated again**: the hand-drawn bolt drops in
  from the top, flickers and twitches like live current, forks into two side bolts on High graphics with a glow at the
  strike point, then the impact flash and ring play as before.
- **26.6.5** — **Turrets turn as one piece.** A turning sprite is now simply rotated as a whole image about its
  centre — nothing is redrawn or resampled per angle — which the high-resolution backing store keeps clean.
  **Arrows look like arrows again**: three waves of seven individual pixel arrows, each leaning a little, falling
  onto its spot and fading as it lands with a puff of dust — instead of one blown-up fan per wave.
- **26.6.6** — **Arrows, properly.** Each wave now flies in from the caster's side of the field on one shared slant,
  ten arrows to a wave, and the arrows **stay stuck in the ground** for the rest of the second before they all fade
  out together, instead of vanishing the moment they land. Far less dust — a faint puff for a few frames — and a
  redrawn arrow (red feathers, dark shaft, steel head) that reads as an arrow instead of a stick with white ends.

---

*The very first background was a dark indigo, then the green arena from 26.3.0; everything from 26.4.0 on wears the ocean blue, and from 26.6.0 the whole game is pixel art.
The major number restarts at 1 each new year, and ticks up within a year whenever the game gets another whole new look.*
