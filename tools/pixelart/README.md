# Pixel sprites

146 sprites, all **16×16**, in `web/images/pixel/`. **Not wired into the game** —
nothing in `web/src/` reads them. Ordinary 8-bit RGBA PNGs, editable anywhere.

Browse them: open `web/images/pixel/index.html`, or with the game server running,
<http://localhost:8000/images/pixel/>.

## Regenerating

```bash
node tools/pixelart/gen.js         # redraws every sprite you have not edited
node tools/pixelart/make-viewer.js
node tools/pixelart/test-guard.js  # proves your edits survive
```

## Your edits win

Replace or repaint any sprite in `web/images/pixel/` and the generator will not
overwrite it again — not on the next run, not even if the drawing code for that
sprite changes. It hashes everything it writes into `.generated.json`; a sprite
that no longer matches its hash is yours and is left alone. Files it has no
record of are treated as yours too, so a lost manifest makes it more cautious,
not less. Each run prints what it kept.

To hand a sprite back, delete it (or its `.generated.json` line) and re-run.
`--force` overwrites everything including your art — that is the only way to
lose it, and it says so when it runs.

- `tools/pixelart/lib.js` — a small PNG encoder/decoder plus the rasteriser
- `tools/pixelart/gen.js` — the artwork itself, one block per sprite

## Hand-drawn art

Not everything is generated. `adopt()` pulls a hand-drawn PNG in from `web/images/`
and copies it through untouched, so rebuilding never paints over it:

| Sprite | Source |
|---|---|
| `spells/zap.png`, `effects/zap-strike.png` | `web/images/zap.png` |
| `effects/zap-strike-evo.png` | `web/images/evo_zap.png` |

To hand-draw another sprite, save a 16×16 PNG in `web/images/` and add one
`adopt()` line. The build checks its palette alongside the generated ones.

## How they're drawn

Every sprite is plotted **pixel by pixel** — no anti-aliasing, no downscaling from a
bigger image. That's what keeps circles perfectly round and palettes tiny:

- `disc()` fills every pixel whose centre falls inside the radius, from a centre on the
  pixel grid, so the result is symmetric on both axes. (Verified in the build.)
- `rrect()` rounds corners with a quarter-disc test — the shape buildings and towers use.
- `speckle()` scatters a texture colour deterministically inside the current shape.

**Every sprite uses 6 colours or fewer**, and `gen.js` prints the worst offender per
category so it stays that way.

Unit colours and sizes are the game's own, copied from `main.js` `getUnitColor()` and
`Troop.js` masses. Troops share one scale, so relative size reads at a glance: the
smallest units are 6px across, giants 14px.

## Tower layers

Towers come apart so the cannon can aim:

| File | What it is |
|---|---|
| `princess-blue.png` | the assembled tower |
| `princess-blue-base.png` | the rounded block |
| `princess-blue-turret.png` | the cannon — **barrel points right, pivot dead-centre** |
| `king-blue-vent.png` | the king's spell vent |

Draw the base, then the turret rotated about its centre to the aim angle. All layers
share the same 16×16 frame, so they stack with no offset.

## Spells

The spell sprites are the **placed** footprint — a circle with a texture, so each zone
has its own surface: bubbles for poison, sparks for rage, a swirl for clone and mirror,
a plus for heal, a flake for freeze, headstones for graveyard, strands for vines.
