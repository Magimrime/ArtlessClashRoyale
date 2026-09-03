// Renders a proof sheet for the new UI art: the bitmap font, the elixir bar
// assembled from its pieces, and the card frames 9-sliced to the sizes the game
// actually uses. If the metrics or the slicing are wrong, it shows here.
//
//     node tools/pixelart/preview-ui.js
const fs = require('fs'), path = require('path');
const { Sprite } = require('./lib.js');

const OUT = path.join(__dirname, '..', '..', 'web', 'images', 'pixel');
const load = rel => Sprite.load(path.join(OUT, rel));
const METRICS = JSON.parse(fs.readFileSync(path.join(OUT, 'font', 'metrics.json'), 'utf8'));
const SHEET = load('font/sheet.png');

// --- the three primitives the game will need -------------------------------
function blit(dst, src, dx, dy, scale = 1, sx = 0, sy = 0, sw = src.w, sh = src.h, tint = null) {
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    const c = src.at(sx + x, sy + y);
    if (!c) continue;
    const col = tint || '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
    for (let ry = 0; ry < scale; ry++) for (let rx = 0; rx < scale; rx++) dst.plot(dx + x*scale + rx, dy + y*scale + ry, col);
  }
}

// Proportional: each glyph advances by its own ink width, not the cell width.
function textWidth(str, scale = 1) {
  let w = 0;
  for (const ch of str) w += ((METRICS.width[ch] ?? METRICS.width[' ']) + METRICS.gap) * scale;
  return w;
}
function text(dst, str, x, y, colour = '#ffffff', scale = 1) {
  let cx = x;
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= METRICS.first && code <= METRICS.last) {
      const i = code - METRICS.first;
      blit(dst, SHEET, cx, y, scale,
           (i % METRICS.cols) * METRICS.cell.w, Math.floor(i / METRICS.cols) * METRICS.cell.h,
           METRICS.art.w, METRICS.art.h, colour);
    }
    cx += ((METRICS.width[ch] ?? METRICS.width[' ']) + METRICS.gap) * scale;
  }
  return cx - x;
}

// 9-slice: corners at native size, edges and centre stretched by repetition.
function nineSlice(dst, src, dx, dy, dw, dh, c) {
  const sw = src.w, sh = src.h;
  const put = (sx, sy, spw, sph, tx, ty, tw, th) => {
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      const px = src.at(sx + Math.min(spw - 1, Math.floor(x * spw / tw)), sy + Math.min(sph - 1, Math.floor(y * sph / th)));
      if (px) dst.plot(tx + x, ty + y, '#' + px.map(v => v.toString(16).padStart(2, '0')).join(''));
    }
  };
  const mw = sw - 2*c, mh = sh - 2*c, tw = dw - 2*c, th = dh - 2*c;
  put(0, 0, c, c, dx, dy, c, c);                          put(sw-c, 0, c, c, dx+dw-c, dy, c, c);
  put(0, sh-c, c, c, dx, dy+dh-c, c, c);                  put(sw-c, sh-c, c, c, dx+dw-c, dy+dh-c, c, c);
  put(c, 0, mw, c, dx+c, dy, tw, c);                      put(c, sh-c, mw, c, dx+c, dy+dh-c, tw, c);
  put(0, c, c, mh, dx, dy+c, c, th);                      put(sw-c, c, c, mh, dx+dw-c, dy+c, c, th);
  put(c, c, mw, mh, dx+c, dy+c, tw, th);
}

// --- the sheet --------------------------------------------------------------
const W = 560, H = 420;
const page = new Sprite(W, H);
page.rect(0, 0, W, H, '#12181f');

let y = 10;
text(page, 'BITMAP FONT 5x8 - 95 GLYPHS', 10, y, '#6d8098', 1); y += 14;
text(page, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10, y, '#e8eef6', 2); y += 20;
text(page, 'abcdefghijklmnopqrstuvwxyz', 10, y, '#e8eef6', 2); y += 20;
text(page, '0123456789 !?.,:;()[]{}+-*/%', 10, y, '#e8eef6', 2); y += 26;

text(page, 'REAL CARD NAMES', 10, y, '#6d8098', 1); y += 14;
for (const n of ['Mini P.E.K.K.A', 'Elite Barbarians', 'Giant Snowball', 'Skeleton Barrel', 'Royal Recruits']) {
  text(page, n, 10, y, '#ffd24d', 2); y += 18;
}
y += 10;

text(page, 'ELIXIR BAR - assembled from pieces, 6.5/10', 10, y, '#6d8098', 1); y += 14;
{
  const capL = load('elixir/bar-cap-left.png'), capR = load('elixir/bar-cap-right.png'), mid = load('elixir/bar-mid.png');
  const fL = load('elixir/bar-fill-cap-left.png'), fM = load('elixir/bar-fill-mid.png');
  const tick = load('elixir/bar-tick.png');
  const barX = 10, barW = 520;
  blit(page, capL, barX, y);
  for (let x = barX + capL.w; x < barX + barW - capR.w; x += mid.w) blit(page, mid, x, y);
  blit(page, capR, barX + barW - capR.w, y);
  const fillW = Math.round(barW * 0.65);
  blit(page, fL, barX, y);
  for (let x = barX + fL.w; x < barX + fillW; x += fM.w) blit(page, fM, x, y);
  for (let i = 1; i < 10; i++) blit(page, tick, barX + Math.round(i * barW / 10), y);
  text(page, '6', barX + barW/2 - 3, y + 4, '#ffffff', 1);
  y += 24;
}

text(page, 'CARD FRAMES - 9-sliced to the real 110x122 and 72x100', 10, y, '#6d8098', 1); y += 14;
{
  const drop = load('elixir/drop.png');
  const names = [['frame-1', 'Skeletons', '1'], ['frame-2', 'Knight', '3'], ['frame-3', 'Wizard', '5'], ['frame-4', 'Golem', '8']];
  let x = 10;
  for (const [f, label, cost] of names) {
    nineSlice(page, load(`cards/${f}.png`), x, y, 110, 122, 8);
    text(page, label, x + 8, y + 8, '#2b2f36', 1);
    blit(page, drop, x + 4, y + 100, 1);
    text(page, cost, x + 10, y + 106, '#ffffff', 1);
    x += 118;
  }
  nineSlice(page, load('cards/slot.png'), x, y + 11, 72, 100, 8);
}

page.save(path.join(__dirname, '..', '..', 'web', 'images', 'pixel', 'ui-preview.png'));
console.log('wrote web/images/pixel/ui-preview.png', W + 'x' + H);
console.log('sample widths:', ['I', 'M', 'i', ' ', '1'].map(c => `${JSON.stringify(c)}=${METRICS.width[c]}`).join('  '));
console.log('"Mini P.E.K.K.A" at 2x =', textWidth('Mini P.E.K.K.A', 2), 'px');
