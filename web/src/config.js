// ----------------------------------------------------------------------------
// Multiplayer backend configuration
// ----------------------------------------------------------------------------
// The multiplayer "rooms" API (POST /api/create, GET /api/join, POST /api/action)
// is served by server.js. There is no build step here — this is a plain ES
// module, so the backend is configured directly in this file.
//
//   * Local / self-hosted:  run `node server.js` and play on the same origin
//                           (e.g. http://localhost:8000). Leave the default "".
//
//   * Static deploy (Netlify, GitHub Pages, ...): the static host has no
//     backend, so multiplayer needs server.js running somewhere public
//     (Render, Fly.io, Railway, a VPS, ...). Put that origin below, e.g.
//
//         const DEFAULT_MP_API_BASE = "https://my-clash-server.onrender.com";
//
//     server.js already sends permissive CORS headers, so a cross-origin
//     backend works from any static host.
//
// You can also override at runtime without editing this file by appending
// ?server=<origin> to the page URL — handy for testing a deployed client
// against a backend.
// ----------------------------------------------------------------------------

const DEFAULT_MP_API_BASE = "";

function resolveMpApiBase() {
    try {
        const override = new URLSearchParams(location.search).get('server');
        if (override) return override.replace(/\/+$/, '');
    } catch (e) {
        // location / URLSearchParams unavailable — fall through to default.
    }
    return DEFAULT_MP_API_BASE.replace(/\/+$/, '');
}

// Base origin for the multiplayer API ("" means "same origin as this page").
// Whether a backend is actually reachable is determined at runtime by probing
// GET /api/health (see MultiplayerManager.checkHealth).
export const MP_API_BASE = resolveMpApiBase();
