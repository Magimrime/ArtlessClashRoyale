# Pixel sprites

146 sprites, all **16×16**, in `web/images/pixel/`. **Not wired into the game** —
nothing in `web/src/` reads them. Ordinary 8-bit RGBA PNGs, editable anywhere.

Browse them: open `web/images/pixel/index.html`, or with the game server running,
<http://localhost:8000/images/pixel/>.

## Regenerating

```bash
node tools/pixelart/gen.js       # redraws every sprite
node tools/pixelart/make-viewer.js
```

- `tools/pixelart/lib.js` — a small PNG encoder plus the rasteriser
- `tools/pixelart/gen.js` — the artwork itself, one block per sprite

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
