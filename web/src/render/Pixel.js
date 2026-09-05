// Pixel-art rendering for the game: sprite blitting, 9-slice frames, tinting,
// and text drawn from the bitmap font in images/pixel/font/.
//
// Everything here draws with smoothing OFF and snaps to whole pixels, which is
// the whole point — a 16x16 sprite scaled to 32px has to land on hard edges or
// it turns to mush. Sprites are authored by tools/pixelart/gen.js.
export class Pixel {
    constructor(base = "images/pixel/") {
        this.base = base;
        this.img = {};            // "troops/knight" -> HTMLImageElement
        this.metrics = null;      // font metrics (cell size + per-glyph widths)
        this.ready = false;
        this._cache = new Map();  // recoloured copies, keyed by sprite|mode|colour
        this._slug = new Map();   // card name -> sprite name
        this.unit = 1;            // position snap, in logical px: 1/R of the backing store
        this.clock = Date.now();  // the animation clock; the renderer sets it once per frame
        this.onMissing = null;    // called with a sprite name the renderer asked for that is not in the set
    }

    // How many frames a sprite has: its sheet is frames stacked downward, one
    // square cell each, so the count is simply height / width (1 for still art).
    frames(name) { const im = this.img[name]; return (im && im.height > im.width && im.height % im.width === 0) ? im.height / im.width : 1; }

    // Snap a logical coordinate to the backing store's pixel grid, so a sprite
    // lands on whole device pixels (no half-pixel edge) but can move in steps as
    // fine as that grid allows.
    q(v) { return Math.round(v / this.unit) * this.unit; }

    // Loads the manifest, then every sprite in it. Rejects if the manifest, the
    // font metrics or ANY sprite fails to load - the game shows its crash screen
    // rather than run without its art.
    async load() {
        const json = async (rel) => { const r = await fetch(this.base + rel); if (!r.ok) throw new Error(rel + " (HTTP " + r.status + ")"); return r.json(); };
        const manifest = await json("sprites.json");
        this.metrics = await json("font/metrics.json");
        const missing = [];
        const one = (folder, name) => new Promise(res => {
            const im = new Image();
            im.onload = () => { this.img[`${folder}/${name}`] = im; res(); };
            im.onerror = () => { missing.push(`${folder}/${name}.png`); res(); };
            im.src = `${this.base}${folder}/${name}.png`;
        });
        const jobs = [];
        for (const [folder, names] of Object.entries(manifest)) for (const n of names) jobs.push(one(folder, n));
        await Promise.all(jobs);
        if (missing.length) throw new Error(`${missing.length} sprite${missing.length > 1 ? "s" : ""} failed to load: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? ", ..." : ""}`);
        this.ready = true;
        return this;
    }

    has(name) { return !!this.img[name]; }

    // "Mini P.E.K.K.A" -> "troops/mini-p-e-k-k-a", the slug gen.js files them under.
    troop(cardName) {
        let s = this._slug.get(cardName);
        if (!s) { s = "troops/" + cardName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); this._slug.set(cardName, s); }
        return s;
    }

    // --- recolouring (all cached; these run per frame) ------------------------
    _recolour(name, key, paint) {
        const k = name + "|" + key;
        let c = this._cache.get(k);
        if (c) return c;
        const im = this.img[name];
        if (!im) return null;
        c = document.createElement("canvas");
        c.width = im.width; c.height = im.height;
        const g = c.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.drawImage(im, 0, 0);
        paint(g, im, c);
        this._cache.set(k, c);
        return c;
    }
    // Flat: every pixel becomes `colour`, alpha kept. For the white font.
    tinted(name, colour) {
        return this._recolour(name, "flat" + colour, (g, im, c) => {
            g.globalCompositeOperation = "source-in";
            g.fillStyle = colour; g.fillRect(0, 0, c.width, c.height);
        });
    }
    // Wash: `colour` laid over the sprite at `alpha`, shading kept underneath.
    // This is how freeze, slow, clone and ghost tints work on a static sprite.
    washed(name, colour, alpha = 0.6) {
        return this._recolour(name, "wash" + colour + alpha, (g, im, c) => {
            g.globalCompositeOperation = "source-atop";
            g.globalAlpha = alpha;
            g.fillStyle = colour; g.fillRect(0, 0, c.width, c.height);
        });
    }
    // Multiply: a grey-drawn sprite takes on `colour` with its bevel intact —
    // one neutral button sprite serves every button colour the game uses.
    multiplied(name, colour) {
        return this._recolour(name, "mul" + colour, (g, im, c) => {
            g.globalCompositeOperation = "multiply";
            g.fillStyle = colour; g.fillRect(0, 0, c.width, c.height);
            g.globalCompositeOperation = "destination-in";
            g.drawImage(im, 0, 0);
        });
    }

    // --- blitting -------------------------------------------------------------
    // Draw a sprite CENTRED on (x, y) at `size` pixels across, optionally rotated.
    // `wash` = [colour, alpha] lays a status tint over it. Returns false when the
    // sprite is missing so callers can fall back to their old vector drawing.
    // `frame` picks a cell of an animated sheet; leave it out and the sprite plays
    // its frames on the shared clock (ten a second). Still art ignores it.
    draw(ctx, name, x, y, size, angle = 0, wash = null, frame = undefined) {
        const base = this.img[name];
        if (!base) { if (this.ready && this.onMissing) this.onMissing(name); return false; }   // no such art: crash
        const im = wash ? this.washed(name, wash[0], wash[1]) : base;
        // A sheet is taller than it is wide by a whole number of square cells; any
        // other shape is one still picture drawn whole.
        const cell = base.width, sheet = base.height > cell && base.height % cell === 0;
        const nf = sheet ? base.height / cell : 1, sh = sheet ? cell : base.height;
        let f = 0;
        if (nf > 1) { f = frame === undefined ? Math.floor(this.clock / 100) : Math.floor(frame); f = ((f % nf) + nf) % nf; }
        const sy = f * cell;
        const s = Math.max(1, Math.round(size));
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (angle) {
            // The whole sprite turns as one rigid image about its centre - nothing is
            // redrawn or resampled per angle. With the 2-3x backing store the turned
            // edges land on fine device pixels, so it stays clean.
            ctx.translate(this.q(x), this.q(y));
            ctx.rotate(angle);
            ctx.drawImage(im, 0, sy, cell, sh, -s / 2, -s / 2, s, s);
        } else {
            ctx.drawImage(im, 0, sy, cell, sh, this.q(x - s / 2), this.q(y - s / 2), s, s);
        }
        ctx.restore();
        return true;
    }

    // Draw at the sprite's own aspect, top-left anchored (bar pieces, sheets).
    drawAt(ctx, name, x, y, w = null, h = null) {
        const im = this.img[name];
        if (!im) return false;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(im, this.q(x), this.q(y), Math.round(w ?? im.width), Math.round(h ?? im.height));
        ctx.restore();
        return true;
    }

    // 9-slice: corners stay at native size, edges and centre stretch. This is how
    // one 24x24 card frame fits the 110x122 hand card and the 72x100 slot without
    // the rounded corners going soft. `src` may be a sprite name or a canvas.
    nine(ctx, src, x, y, w, h, corner = 8) {
        const im = typeof src === "string" ? this.img[src] : src;
        if (!im) return false;
        const sw = im.width, sh = im.height, c = Math.min(corner, Math.floor(sw / 2), Math.floor(sh / 2));
        const mw = sw - 2 * c, mh = sh - 2 * c;
        x = this.q(x); y = this.q(y); w = Math.round(w); h = Math.round(h);
        const tw = Math.max(0, w - 2 * c), th = Math.max(0, h - 2 * c);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        const put = (sx, sy, spw, sph, dx, dy, dw, dh) => { if (dw > 0 && dh > 0) ctx.drawImage(im, sx, sy, spw, sph, dx, dy, dw, dh); };
        put(0, 0, c, c, x, y, c, c);                     put(sw - c, 0, c, c, x + w - c, y, c, c);
        put(0, sh - c, c, c, x, y + h - c, c, c);        put(sw - c, sh - c, c, c, x + w - c, y + h - c, c, c);
        put(c, 0, mw, c, x + c, y, tw, c);               put(c, sh - c, mw, c, x + c, y + h - c, tw, c);
        put(0, c, c, mh, x, y + c, c, th);               put(sw - c, c, c, mh, x + w - c, y + c, c, th);
        put(c, c, mw, mh, x + c, y + c, tw, th);
        ctx.restore();
        return true;
    }

    // A button in any colour: the neutral grey pill multiplied by `colour`, then
    // 9-sliced to the rect. Scale 2 keeps the bevel readable at button sizes.
    button(ctx, x, y, w, h, colour) {
        const src = this.multiplied("ui/button", colour);
        if (!src) return false;
        // Draw through an upscaled copy so the slice corners are 2px pixels, not 1px.
        const key = "ui/button|mul2x" + colour;
        let big = this._cache.get(key);
        if (!big) {
            big = document.createElement("canvas");
            big.width = src.width * 2; big.height = src.height * 2;
            const g = big.getContext("2d"); g.imageSmoothingEnabled = false;
            g.drawImage(src, 0, 0, big.width, big.height);
            this._cache.set(key, big);
        }
        return this.nine(ctx, big, x, y, w, h, 10);
    }

    // The elixir bar assembled from its pieces: caps stay crisp at any width.
    elixirBar(ctx, x, y, w, pct) {
        if (!this.img["elixir/bar-mid"]) return false;
        const capL = this.img["elixir/bar-cap-left"], capR = this.img["elixir/bar-cap-right"], mid = this.img["elixir/bar-mid"];
        const fL = this.img["elixir/bar-fill-cap-left"], fM = this.img["elixir/bar-fill-mid"], fR = this.img["elixir/bar-fill-cap-right"];
        const tick = this.img["elixir/bar-tick"];
        x = Math.round(x); y = Math.round(y); w = Math.round(w);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(capL, x, y);
        ctx.drawImage(mid, x + capL.width, y, w - capL.width - capR.width, mid.height);
        ctx.drawImage(capR, x + w - capR.width, y);
        const fw = Math.round(w * Math.max(0, Math.min(1, pct)));
        if (fw > 0) {
            ctx.drawImage(fL, x, y, Math.min(fL.width, fw), fL.height);
            if (fw > fL.width) ctx.drawImage(fM, x + fL.width, y, Math.max(0, fw - fL.width - (fw >= w ? fR.width : 0)), fM.height);
            if (fw >= w) ctx.drawImage(fR, x + w - fR.width, y);
        }
        for (let i = 1; i < 10; i++) ctx.drawImage(tick, x + Math.round(i * w / 10) - 1, y);
        ctx.restore();
        return true;
    }

    // --- text ---------------------------------------------------------------
    // ONE text size everywhere: every label, name, number and button is the font
    // at 2x (a 14px cap). Two exceptions: a display title — the game's name, the
    // countdown, "You Win!" — asks for 40px or more and gets 4x; and the small
    // name over a troop asks for 7px and gets the font at 1x — the same glyphs,
    // the same pixels, just not doubled.
    scaleFor(size) { return size <= 7 ? 1 : size >= 40 ? 4 : 2; }
    capHeight(size) { return this.scaleFor(size) * 7; }
    lineHeight(size) { return this.scaleFor(size) * (this.metrics ? this.metrics.art.h : 8); }

    // `tight` drops the letter spacing — for a word that would otherwise not fit
    // its card, instead of shrinking the font.
    measure(str, size, tight = false) {
        if (!this.metrics) return 0;
        const s = this.scaleFor(size), m = this.metrics, gap = tight ? 0 : m.gap;
        let w = 0;
        for (const ch of String(str)) w += ((m.width[ch] ?? m.width[" "]) + gap) * s;
        return w - gap * s;                // no trailing gap
    }

    // align: "left" | "center" | "right". `y` is the BASELINE (like fillText), so
    // existing call sites can hand over their coordinates unchanged.
    text(ctx, str, x, y, size, colour = "#ffffff", align = "left", tight = false) {
        if (!this.ready || !this.metrics) return false;
        const sheet = this.tinted("font/sheet", colour);
        if (!sheet) return false;
        const m = this.metrics, s = this.scaleFor(size), gap = tight ? 0 : m.gap;
        str = String(str);
        let cx = this.q(x);
        if (align === "center") cx -= Math.round(this.measure(str, size, tight) / 2);
        else if (align === "right") cx -= Math.round(this.measure(str, size, tight));
        const ty = this.q(y) - 7 * s;       // baseline -> top of the 7-row cap box
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        for (const ch of str) {
            const code = ch.charCodeAt(0);
            if (code >= m.first && code <= m.last) {
                const i = code - m.first;
                ctx.drawImage(sheet,
                    (i % m.cols) * m.cell.w, Math.floor(i / m.cols) * m.cell.h, m.art.w, m.art.h,
                    cx, ty, m.art.w * s, m.art.h * s);
            }
            cx += ((m.width[ch] ?? m.width[" "]) + gap) * s;
        }
        ctx.restore();
        return true;
    }

    // Text with a hard one-pixel drop shadow — the pixel-art stand-in for the
    // game's stroked labels, and far more readable over the battlefield.
    textShadow(ctx, str, x, y, size, colour = "#ffffff", align = "left", shadow = "rgba(0,0,0,0.75)") {
        const s = this.scaleFor(size);
        this.text(ctx, str, x + s, y + s, size, shadow, align);
        return this.text(ctx, str, x, y, size, colour, align);
    }
}
