// Scans web/images/pixel/ and writes index.html — a contact sheet of every sprite,
// shown at 4x on a checkerboard so transparency is obvious.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', 'web', 'images', 'pixel');

function pngSize(file) {
    const b = fs.readFileSync(file);
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

const cats = fs.existsSync(ROOT)
    ? fs.readdirSync(ROOT).filter(d => fs.statSync(path.join(ROOT, d)).isDirectory()).sort()
    : [];

let total = 0;
const sections = cats.map(cat => {
    const files = fs.readdirSync(path.join(ROOT, cat)).filter(f => f.endsWith('.png')).sort();
    total += files.length;
    const items = files.map(f => {
        const { w, h } = pngSize(path.join(ROOT, cat, f));
        const name = f.replace(/\.png$/, '');
        return `  <figure onclick="window.open('${cat}/${f}','_blank')"><img src="${cat}/${f}" alt="${name}"><figcaption>${name}<span>${w}×${h}</span></figcaption></figure>`;
    }).join('\n');
    return `<h2>${cat} <span class="count">${files.length}</span></h2>\n<div class="grid">\n${items}\n</div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Artless Clash Royale — pixel art</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 28px 32px 70px; background: #12181f; color: #e8eef6;
         font: 15px/1.5 "Baloo 2", "Segoe UI", system-ui, sans-serif; }
  h1 { margin: 0 0 4px; font-size: 26px; }
  p.lead { margin: 0 0 8px; color: #93a4b7; max-width: 70ch; }
  code { background: #1b232d; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
  h2 { margin: 34px 0 12px; font-size: 17px; text-transform: capitalize;
       border-bottom: 1px solid #253040; padding-bottom: 6px; }
  h2 .count { color: #6d8098; font-size: 13px; font-weight: 400; margin-left: 6px; }
  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); }
  figure { margin: 0; background: #1b232d; border: 1px solid #26313f; border-radius: 8px;
           padding: 10px 6px 8px; text-align: center; cursor: pointer; }
  figure:hover { border-color: #4f8fe0; }
  figure img { image-rendering: pixelated; width: 72px; height: 72px; object-fit: contain;
               background: repeating-conic-gradient(#222b36 0% 25%, #1a222b 0% 50%) 50% / 12px 12px;
               border-radius: 4px; }
  figcaption { margin-top: 7px; font-size: 12px; color: #cfdcea; word-break: break-word; }
  figcaption span { display: block; color: #6d8098; font-size: 10.5px; }
  .bar { position: fixed; right: 18px; bottom: 16px; background: #1b232d; border: 1px solid #2c3949;
         border-radius: 999px; padding: 8px 15px; font-size: 13px; color: #a8bdd4; }
</style>
</head>
<body>
<h1>Pixel art — Artless Clash Royale</h1>
<p class="lead">Standalone sprites in <code>web/images/pixel/</code> — <strong>not used by the game yet</strong>.
These are ordinary PNGs: open and edit them in any image editor. To redraw them from source,
edit the drawing code in <code>tools/pixelart/draw/</code> and run
<code>powershell -File tools\\pixelart\\draw-all.ps1</code>.</p>
<p class="lead">Shown at 4× on a checkerboard. Click any sprite to open the real file.</p>
${sections}
<div class="bar">${total} sprites</div>
</body>
</html>`;

fs.mkdirSync(ROOT, { recursive: true });
fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`viewer written: ${total} sprites across ${cats.length} categories`);
