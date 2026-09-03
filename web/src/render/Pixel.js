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
    }

    // Snap a logical coordinate to the backing store's pixel grid, so a sprite
    // lands on whole device pixels (no half-pixel edge) but can move in steps as
    // fine as that grid allows.
    q(v) { return Math.round(v / this.unit) * this.unit; }

    // Loads the manifest, then every sprite in it. Resolves even if some images
    // fail, so a missing file degrades to "no sprite" instead of a black screen.
    async load() {
        const manifest = await fetch(this.base + "sprites.json").then(r => r.json());
        this.metrics = await fetch(this.base + "font/metrics.json").then(r => r.json());
        const one = (folder, name) => new Promise(res => {
            const im = new Image();
            im.onload = () => { this.img[`${folder}/${name}`] = im; res(); };
            im.onerror = () => res();                       // missing art must not block the game
            im.src = `${this.base}${folder}/${name}.png`;
        });
        const jobs = [];
        for (const [folder, names] of Object.entries(manifest)) for (const n of names) jobs.push(one(folder, n));
        await Promise.all(jobs);
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

    // Rotation is quantised to 16 steps: a 16px sprite turned to an arbitrary
    // angle shimmers every frame; 22.5-degree steps stay readable pixel art.
    static snap(angle, steps = 16) {
        const q = Math.PI * 2 / steps;
        return Math.round(angle / q) * q;
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

    // A sprite turned by `angle`, rotated at its OWN resolution: the 16px art is
    // spun with nearest-neighbour sampling into a small frame, and that frame is
    // what gets scaled up. Rotating the already-upscaled image (the old way) put
    // every edge at a sub-pixel diagonal and read as blur; this keeps each turned
    // pixel a whole block on the grid. Cached per sprite and 16-step angle.
    // The frame is 1.5x the sprite so a turned corner never clips.
    rotated(src, key, angle) {
        const step = Math.round(angle / (Math.PI / 8));           // 16 steps
        const k = key + "|rot" + step;
        let c = this._cache.get(k);
        if (c) return c;
        const w = src.width, h = src.height, D = Math.ceil(Math.max(w, h) * 1.5);
        c = document.createElement("canvas");
        c.width = D; c.height = D;
        const g = c.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.translate(D / 2, D / 2);
        g.rotate(step * Math.PI / 8);
        g.drawImage(src, -w / 2, -h / 2);
        this._cache.set(k, c);
        return c;
    }

    // --- blitting -------------------------------------------------------------
    // Draw a sprite CENTRED on (x, y) at `size` pixels across, optionally rotated.
    // `wash` = [colour, alpha] lays a status tint over it. Returns false when the
    // sprite is missing so callers can fall back to their old vector drawing.
    draw(ctx, name, x, y, size, angle = 0, wash = null) {
        const im = wash ? this.washed(name, wash[0], wash[1]) : this.img[name];
        if (!im) return false;
        const s = Math.max(1, Math.round(size));
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (angle) {
            // Turned at source resolution, then scaled by the same factor as an
            // unturned sprite, so its pixels stay the same size as everyone else's.
            const fr = this.rotated(im, name + (wash ? "|" + wash[0] + wash[1] : ""), angle);
            const scale = s / im.width, fs = Math.round(fr.width * scale);
            ctx.drawImage(fr, this.q(x - fs / 2), this.q(y - fs / 2), fs, fs);
        } else {
            ctx.drawImage(im, this.q(x - s / 2), this.q(y - s / 2), s, s);
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
