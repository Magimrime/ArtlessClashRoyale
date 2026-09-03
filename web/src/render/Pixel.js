// Pixel-art rendering for the game: sprite blitting, 9-slice frames, and text
// drawn from the bitmap font in images/pixel/font/.
//
// Everything here draws with smoothing OFF and snaps to whole pixels, which is
// the whole point — a 16x16 sprite scaled to 34px has to land on hard edges or
// it turns to mush. Sprites are authored by tools/pixelart/gen.js.
export class Pixel {
    constructor(base = "images/pixel/") {
        this.base = base;
        this.img = {};            // "troops/knight" -> HTMLImageElement
        this.metrics = null;      // font metrics (cell size + per-glyph widths)
        this.ready = false;
        this._tint = new Map();   // "troops/knight|#fff" -> tinted canvas
    }

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

    // A copy of a sprite recoloured to `colour`, keeping its alpha. Used for the
    // font (white glyphs) and for team-tinting; cached, since this is per-frame.
    tinted(name, colour) {
        const key = name + "|" + colour;
        let c = this._tint.get(key);
        if (c) return c;
        const im = this.img[name];
        if (!im) return null;
        c = document.createElement("canvas");
        c.width = im.width; c.height = im.height;
        const g = c.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.drawImage(im, 0, 0);
        g.globalCompositeOperation = "source-in";
        g.fillStyle = colour;
        g.fillRect(0, 0, c.width, c.height);
        this._tint.set(key, c);
        return c;
    }

    // Draw a sprite CENTRED on (x, y) at `size` pixels across, optionally rotated.
    // Returns false when the sprite is missing so callers can fall back to their
    // old vector drawing instead of silently rendering nothing.
    draw(ctx, name, x, y, size, angle = 0, colour = null) {
        const im = colour ? this.tinted(name, colour) : this.img[name];
        if (!im) return false;
        const s = Math.max(1, Math.round(size));
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        if (angle) {
            ctx.translate(Math.round(x), Math.round(y));
            ctx.rotate(angle);
            ctx.drawImage(im, -s / 2, -s / 2, s, s);
        } else {
            // Unrotated sprites snap to the pixel grid; rotated ones can't.
            ctx.drawImage(im, Math.round(x - s / 2), Math.round(y - s / 2), s, s);
        }
        ctx.restore();
        return true;
    }

    // Draw a sprite at its own aspect ratio, top-left anchored (bar pieces, sheets).
    drawAt(ctx, name, x, y, w = null, h = null) {
        const im = this.img[name];
        if (!im) return false;
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(im, Math.round(x), Math.round(y), Math.round(w ?? im.width), Math.round(h ?? im.height));
        ctx.restore();
        return true;
    }

    // 9-slice: corners stay at native size, edges and centre stretch. This is how
    // one 24x24 card frame fits the 110x122 hand card and the 72x100 slot without
    // the rounded corners going soft.
    nine(ctx, name, x, y, w, h, corner = 8) {
        const im = this.img[name];
        if (!im) return false;
        const sw = im.width, sh = im.height, c = corner;
        const mw = sw - 2 * c, mh = sh - 2 * c;
        x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
        const tw = Math.max(0, w - 2 * c), th = Math.max(0, h - 2 * c);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        const put = (sx, sy, spw, sph, dx, dy, dw, dh) => {
            if (dw > 0 && dh > 0) ctx.drawImage(im, sx, sy, spw, sph, dx, dy, dw, dh);
        };
        put(0, 0, c, c, x, y, c, c);
        put(sw - c, 0, c, c, x + w - c, y, c, c);
        put(0, sh - c, c, c, x, y + h - c, c, c);
        put(sw - c, sh - c, c, c, x + w - c, y + h - c, c, c);
        put(c, 0, mw, c, x + c, y, tw, c);
        put(c, sh - c, mw, c, x + c, y + h - c, tw, c);
        put(0, c, c, mh, x, y + c, c, th);
        put(sw - c, c, c, mh, x + w - c, y + c, c, th);
        put(c, c, mw, mh, x + c, y + c, tw, th);
        ctx.restore();
        return true;
    }

    // --- text ---------------------------------------------------------------
    // `size` is the intended cap height in pixels; the font is 7 rows tall above
    // the baseline, so the scale is size/7 rounded to a whole number to stay crisp.
    scaleFor(size) { return Math.max(1, Math.round(size / 7)); }

    measure(str, size) {
        if (!this.metrics) return 0;
        const s = this.scaleFor(size), m = this.metrics;
        let w = 0;
        for (const ch of String(str)) w += ((m.width[ch] ?? m.width[" "]) + m.gap) * s;
        return w - m.gap * s;              // no trailing gap
    }

    lineHeight(size) { return this.scaleFor(size) * (this.metrics ? this.metrics.art.h : 8); }

    // align: "left" | "center" | "right". y is the TOP of the glyph box.
    text(ctx, str, x, y, size, colour = "#ffffff", align = "left") {
        if (!this.ready || !this.metrics) return false;
        const sheet = this.tinted("font/sheet", colour);
        if (!sheet) return false;
        const m = this.metrics, s = this.scaleFor(size);
        str = String(str);
        let cx = Math.round(x);
        if (align === "center") cx -= Math.round(this.measure(str, size) / 2);
        else if (align === "right") cx -= Math.round(this.measure(str, size));
        const ty = Math.round(y);
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
            cx += ((m.width[ch] ?? m.width[" "]) + m.gap) * s;
        }
        ctx.restore();
        return true;
    }

    // Text with a 1px hard drop shadow — the pixel-art equivalent of the game's
    // existing stroked labels, and far more readable over the battlefield.
    textShadow(ctx, str, x, y, size, colour = "#ffffff", align = "left", shadow = "#000000") {
        const s = this.scaleFor(size);
        this.text(ctx, str, x + s, y + s, size, shadow, align);
        return this.text(ctx, str, x, y, size, colour, align);
    }
}
