// Rebuilds web/images/pixel/index.html — a contact sheet of every exported sprite.
//   node tools/pixelart/make-viewer.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', 'web', 'images', 'pixel');
const size = f => { const b = fs.readFileSync(f); return b.readUInt32BE(16) + '×' + b.readUInt32BE(20); };
const cats = fs.existsSync(ROOT) ? fs.readdirSync(ROOT).filter(d => fs.statSync(path.join(ROOT, d)).isDirectory()).sort() : [];
let total = 0;
const sections = cats.map(cat => {
  const files = fs.readdirSync(path.join(ROOT, cat)).filter(f => f.endsWith('.png')).sort();
  total += files.length;
  return `<h2>${cat} <span class="count">${files.length}</span></h2>\n<div class="grid">\n` + files.map(f => {
    const n = f.replace(/\.png$/, '');
    return `  <figure onclick="window.open('${cat}/${f}','_blank')"><img src="${cat}/${f}" alt="${n}"><figcaption>${n}<span>${size(path.join(ROOT, cat, f))}</span></figcaption></figure>`;
  }).join('\n') + `\n</div>`;
}).join('\n');

fs.writeFileSync(path.join(ROOT, 'index.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Artless Clash Royale — pixel sprites</title>
<style>
 :root{color-scheme:dark}
 body{margin:0;padding:26px 30px 70px;background:#12181f;color:#e8eef6;font:15px/1.5 "Baloo 2","Segoe UI",system-ui,sans-serif}
 h1{margin:0 0 4px;font-size:25px} p.lead{margin:0 0 6px;color:#93a4b7;max-width:74ch}
 code{background:#1b232d;padding:1px 5px;border-radius:4px;font-size:13px}
 h2{margin:32px 0 12px;font-size:17px;text-transform:capitalize;border-bottom:1px solid #253040;padding-bottom:6px}
 h2 .count{color:#6d8098;font-size:13px;font-weight:400;margin-left:6px}
 .grid{display:grid;gap:13px;grid-template-columns:repeat(auto-fill,minmax(104px,1fr))}
 figure{margin:0;background:#1b232d;border:1px solid #26313f;border-radius:8px;padding:9px 6px 7px;text-align:center;cursor:pointer}
 figure:hover{border-color:#4f8fe0}
 figure img{image-rendering:pixelated;width:64px;height:64px;background:repeating-conic-gradient(#222b36 0% 25%,#1a222b 0% 50%) 50%/12px 12px;border-radius:4px}
 figcaption{margin-top:6px;font-size:12px;color:#cfdcea;word-break:break-word}
 figcaption span{display:block;color:#6d8098;font-size:10.5px}
 .bar{position:fixed;right:18px;bottom:16px;background:#1b232d;border:1px solid #2c3949;border-radius:999px;padding:8px 15px;font-size:13px;color:#a8bdd4}
</style></head><body>
<h1>Pixel sprites — troops &amp; towers</h1>
<p class="lead">All <strong>16×16</strong>, rendered by the game's own renderer and scaled down, so each sprite is exactly what the game draws today. <strong>Not wired into the game</strong> — these are standalone PNGs you can edit in any image editor.</p>
<p class="lead">Towers ship as <strong>layers</strong>: <code>-base</code> (the block) and <code>-turret</code> (the cannon, barrel pointing right, pivot dead-centre) — draw the base, then draw the turret rotated to the aim angle. Kings also have a <code>-vent</code> layer.</p>
${sections}
<div class="bar">${total} sprites</div>
</body></html>`);
console.log('viewer written:', total, 'sprites');
