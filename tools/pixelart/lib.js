// Pixel-art toolkit: a tiny PNG encoder plus a rasteriser that plots whole
// pixels only — no anti-aliasing, no downscaling. That's what makes the circles
// come out perfectly round and the palettes stay tiny.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ---------- PNG ----------
const CRC = (() => { const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c; }
  return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let i = 0; i < w * 4; i++) raw[y * (w * 4 + 1) + 1 + i] = rgba[y * w * 4 + i];
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- PNG in ----------
// Reads a hand-drawn PNG back into a Sprite, so artwork drawn by hand can be
// adopted into the set instead of being redrawn by the generator.
function decodePNG(file) {
  const b = fs.readFileSync(file);
  let p = 8, w = 0, h = 0, ct = 0, bd = 8; const idat = [];
  while (p + 8 <= b.length) {
    const len = b.readUInt32BE(p), t = b.toString('ascii', p + 4, p + 8);
    if (t === 'IHDR') { w = b.readUInt32BE(p + 8); h = b.readUInt32BE(p + 12); bd = b[p + 16]; ct = b[p + 17]; }
    else if (t === 'IDAT') idat.push(b.slice(p + 8, p + 8 + len));
    else if (t === 'IEND') break;
    p += len + 12;
  }
  if (bd !== 8 || (ct !== 6 && ct !== 2)) throw new Error(`${file}: need 8-bit RGB/RGBA, got depth ${bd} type ${ct}`);
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(w * h * 4), prev = new Uint8Array(w * bpp), cur = new Uint8Array(w * bpp);
  let o = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[o++];
    for (let i = 0; i < w * bpp; i++) {                       // undo the per-row filter
      const x = raw[o + i], a = i >= bpp ? cur[i - bpp] : 0, up = prev[i], ul = i >= bpp ? prev[i - bpp] : 0;
      let v;
      switch (ft) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + up; break;
        case 3: v = x + ((a + up) >> 1); break;
        default: {                                            // Paeth
          const pa = Math.abs(up - ul), pb = Math.abs(a - ul), pc = Math.abs(a + up - 2 * ul);
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? up : ul);
        }
      }
      cur[i] = v & 255;
    }
    o += w * bpp;
    for (let x = 0; x < w; x++) {
      const d = (y * w + x) * 4, s = x * bpp;
      out[d] = cur[s]; out[d+1] = cur[s+1]; out[d+2] = cur[s+2]; out[d+3] = bpp === 4 ? cur[s+3] : 255;
    }
    prev.set(cur);
  }
  return { w, h, data: out };
}

// ---------- colour ----------
function hex(c) {
  let h = String(c).replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16), 255];
}
// Matches main.js shade(): lighten (amt > 0) or darken (amt < 0).
function shade(c, amt) {
  const [r,g,b] = hex(c);
  const f = v => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2,'0')).join('');
}

// ---------- raster ----------
class Sprite {
  constructor(size = 16) { this.w = this.h = size; this.data = new Uint8Array(size*size*4); }
  plot(x, y, col) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const [r,g,b,a] = hex(col), i = (y*this.w + x) * 4;
    this.data[i]=r; this.data[i+1]=g; this.data[i+2]=b; this.data[i+3]=a;
  }
  at(x, y) { const i = (y*this.w + x)*4; return this.data[i+3] ? [this.data[i],this.data[i+1],this.data[i+2]] : null; }
  clearPx(x, y) { const i = (y*this.w + x)*4; this.data[i+3] = 0; }

  // A PERFECT circle: every pixel whose centre falls inside the radius. Centre is
  // given in pixel-grid coordinates (8,8 = the exact middle of a 16px sprite), so
  // the result is symmetric on both axes.
  disc(cx, cy, r, col) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx*dx + dy*dy <= r*r) this.plot(x, y, col);
    }
  }
  // Ring between two radii (inclusive outer, exclusive inner).
  ring(cx, cy, rOuter, rInner, col) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d2 = dx*dx + dy*dy;
      if (d2 <= rOuter*rOuter && d2 > rInner*rInner) this.plot(x, y, col);
    }
  }
  rect(x0, y0, w, h, col) {
    for (let y = y0; y < y0+h; y++) for (let x = x0; x < x0+w; x++) this.plot(x, y, col);
  }
  // Rounded rectangle — corners cut by a quarter-disc test, so they read as round.
  rrect(x0, y0, w, h, r, col) {
    for (let y = y0; y < y0+h; y++) for (let x = x0; x < x0+w; x++) {
      const cx = Math.min(Math.max(x + 0.5, x0 + r), x0 + w - r);
      const cy = Math.min(Math.max(y + 0.5, y0 + r), y0 + h - r);
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx*dx + dy*dy <= r*r) this.plot(x, y, col);
    }
  }
  hline(x0, x1, y, col) { for (let x = x0; x <= x1; x++) this.plot(x, y, col); }
  vline(x, y0, y1, col) { for (let y = y0; y <= y1; y++) this.plot(x, y, col); }

  // Sprinkle a texture colour on a deterministic scatter inside the current shape —
  // gives spell zones a surface instead of a flat fill, without adding noise.
  speckle(col, seed, density, inside) {
    let s = seed >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (!this.at(x, y)) continue;
      if (inside && !inside(x, y)) continue;
      if (rnd() < density) this.plot(x, y, col);
    }
  }
  // Count distinct colours — used by the build to keep palettes honest.
  palette() {
    const set = new Set();
    for (let i = 0; i < this.w*this.h; i++) if (this.data[i*4+3]) set.add(this.data.slice(i*4, i*4+3).join(','));
    return set;
  }
  // Adopt a hand-drawn PNG as-is.
  static load(file) {
    const { w, h, data } = decodePNG(file);
    if (w !== h) throw new Error(`${file}: expected a square sprite, got ${w}x${h}`);
    const sp = new Sprite(w); sp.data.set(data); return sp;
  }
  save(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, encodePNG(this.w, this.h, this.data));
    return this;
  }
}

module.exports = { Sprite, shade, hex, encodePNG, decodePNG };
