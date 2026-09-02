# Pixel art

Pixel-art sprites for the game — **not wired into the game**. Nothing in `web/src/` reads
these yet; they exist to look at, edit, and eventually adopt.

## Where things are

| What | Where |
|---|---|
| The art (real PNG files) | `web/images/pixel/<category>/<name>.png` |
| A page showing every sprite | `web/images/pixel/index.html` |
| The drawing code | `tools/pixelart/draw/*.ps1` |
| The drawing library | `tools/pixelart/_lib.ps1` |
| Redraw everything | `tools/pixelart/draw-all.ps1` |

## Two ways to change the art

**1. Edit the PNGs directly.** They're ordinary 8-bit RGBA PNGs — open them in Paint,
Aseprite, Photopea, anything. That's the simplest route. (Re-running the drawing script
would overwrite them, so if you hand-edit a PNG, either don't redraw that sprite or copy
the change back into the drawing code.)

**2. Edit the drawing code and redraw.** Each sprite is *drawn* with real graphics
primitives — ellipses, polygons, arcs — in a small coordinate space:

```powershell
Save-Sprite -Category troops -Name knight -Size 16 -Palette @('#20242b','#4a5666','#8fa3b8','#d7e3f0') -Draw {
    param($g)
    $dark = B '#20242b'; $mid = B '#4a5666'; $lit = B '#8fa3b8'
    $g.FillEllipse($dark, 3.2, 3.2, 9.6, 10.4)   # body
    $g.FillEllipse($mid,  4.0, 4.0, 8.0, 9.0)    # armour
    $g.FillEllipse($lit,  4.6, 4.4, 6.8, 5.4)    # helmet
}
```

Then:

```bash
powershell -ExecutionPolicy Bypass -File tools\pixelart\draw-all.ps1
```

That redraws every PNG and regenerates the viewer page.

### How it becomes pixel art

The library (`_lib.ps1`) draws your shapes at **8× size with anti-aliasing**, shrinks the
result down to the target size, then **snaps every pixel to the palette you passed in**.
Drawing big and reducing gives well-formed shapes; the palette snap is what turns the
smooth drawing into crisp pixel art. So keep `-Palette` to the 4–6 colours you actually
paint with.

`-Opaque` (map tiles only) fills edge to edge with no transparency, so tiles butt
together seamlessly.

## Viewing them

Open `web/images/pixel/index.html` in a browser, or with the game server running:
<http://localhost:8000/images/pixel/>. Everything is shown at 4× on a checkerboard so
transparency is obvious; click a sprite to open the real file.

## Style

Matched to the game's existing `web/images/zap.png`:

- **16×16** troops, spells, icons, map tiles · **24×24** buildings · **32×32** towers
- a **tight palette**, about 4–6 colours per sprite
- shade within one hue family: dark edge tone → base → lighter → highlight
- **no black outline** — the sprite's own darkest tone forms its edge
- team colours: blue `#4f8fe0` family (player), red `#e05555` family (enemy)
