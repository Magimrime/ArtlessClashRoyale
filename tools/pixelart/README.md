# Pixel sprites — troops & towers

16×16 sprites in `web/images/pixel/`. **Not wired into the game** — nothing in `web/src/`
reads them. They're ordinary 8-bit RGBA PNGs, editable in any image editor.

Browse them: open `web/images/pixel/index.html`, or with the game server running,
<http://localhost:8000/images/pixel/>.

## How they were made

They aren't hand-drawn — they're **the game drawing itself**. Each sprite is produced by
calling the game's real `drawEntityBody()` on a real entity, cropping what it drew, and
scaling it down to a 16×16 cell. So every sprite is exactly the shape, colour, rim band
and highlight the game renders today.

After the downscale each sprite gets a crisping pass, which is what keeps it from looking
like a blurry thumbnail:

1. **hard alpha** — edge pixels are all-or-nothing, never half-transparent
2. **posterise** — colours snap to bands, so the body reads as flat pixel colour
3. **outline** — every opaque pixel touching empty space is darkened, giving a defined rim

## Tower layers

Towers ship as separate layers so the cannon can actually aim:

| File | What it is |
|---|---|
| `princess-blue.png` | the whole tower, one image |
| `princess-blue-base.png` | just the block |
| `princess-blue-turret.png` | just the cannon — **barrel points right (angle 0), pivot dead-centre** |
| `king-blue-vent.png` | the king's spell vent (kings only) |

To draw an aiming tower: blit `-base`, then blit `-turret` rotated about its centre to the
tower's aim angle (kings: base → vent → turret). All layers share the same 16×16 frame, so
they line up when stacked with no offset.

## Re-exporting

The exporter runs inside the live game, so it needs a temporary hook:

1. At the end of `web/src/main.js`, change `new Main();` to:
   ```js
   window.__ACR = new Main();
   window.__ACR_CLASSES = { Troop, Tower, Building, GameEngine };
   ```
2. Load the game, then in the console: `__ACR.loop = function(){}` to freeze the render
   loop so the canvas can be used as scratch space.
3. Render each entity with `__ACR.drawEntityBody(entity, true)`, crop, downscale to 16×16,
   apply the crisping pass, and save.
4. **Remove the hook from `main.js`** when done.

Then rebuild the contact sheet:

```bash
node tools/pixelart/make-viewer.js
```
