# Clash Royale JS

This is a JavaScript port of Clash Royale, playable in the browser.

**See [`UPDATES.md`](UPDATES.md) for the full update timeline** — versioned `year.major.minor.patch` (e.g. `26.3.12`), where the major number restarts at 1 each year and ticks up whenever the background color changes.

## How to Play (local)

The client lives in `web/` and is served by `server.js`, which also provides
the save and multiplayer (room) APIs.

1. Run `node server.js`.
2. Open <http://localhost:8000/> in a web browser.
3. Build your deck and start a battle!

> Note: the game uses ES modules and `/api/*` endpoints, so it must be served
> over HTTP (opening the file directly will not work). Multiplayer requires
> `server.js` to be running and reachable by both players.

## Multiplayer

Multiplayer is host-authoritative lockstep over a tiny "rooms" API
(`/api/create`, `/api/join`, `/api/action`, `/api/health`) provided by
`server.js`. One player hosts a room and shares the 5-digit code; the other
joins with it.

- **Local / same-origin:** run `node server.js` and both players hit the same
  origin — it works with no extra config.
- **Static deploy (Netlify, GitHub Pages, …):** the static host has **no
  backend**, so multiplayer needs `server.js` running somewhere public
  (Render, Fly.io, Railway, a VPS, …). Point the client at it by editing
  `DEFAULT_MP_API_BASE` in [`web/src/config.js`](web/src/config.js):

  ```js
  const DEFAULT_MP_API_BASE = "https://your-clash-server.onrender.com";
  ```

  Or override per-session without editing files by adding `?server=<origin>` to
  the page URL. `server.js` already sends permissive CORS headers, so a
  cross-origin backend works. When no backend is reachable, the Multiplayer
  menu says so; single-player still works fully (progress is saved to
  `localStorage`).

## Deployment to Netlify

### Option 1: Netlify Drop (Easiest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `web` folder onto the page.
3. Your game will be live instantly!

### Option 2: Git Integration
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Log in to Netlify and "New Site from Git".
3. Select your repository.
4. Netlify should automatically detect the `netlify.toml` file and set the publish directory to `web`.
   - If not, set **Publish directory** to `web`.
5. Click **Deploy Site**.
