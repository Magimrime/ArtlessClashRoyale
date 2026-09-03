// Generates every 16x16 sprite in web/images/pixel/.
//
//     node tools/pixelart/gen.js
//
// Everything is plotted pixel by pixel (see lib.js) — no anti-aliasing and no
// downscaling — so circles are perfectly round and each sprite keeps a tiny
// palette. Colours are the game's own (copied from main.js getUnitColor).
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Sprite, shade } = require('./lib.js');

// PIXEL_OUT lets test-guard.js run against a scratch dir instead of the real art.
const OUT = process.env.PIXEL_OUT || path.join(__dirname, '..', '..', 'web', 'images', 'pixel');
const out = (cat, name) => path.join(OUT, cat, name + '.png');
const made = [];
const kept = [];

// ---------------------------------------------------------------------------
// YOUR EDITS WIN.
//
// Replace or repaint any sprite in web/images/pixel/ and the generator will
// never overwrite it again — not on the next run, not even if the drawing
// code for that sprite changes.
//
// How it knows: it hashes every file it writes into .generated.json. A sprite
// still matching its hash is the generator's own output and may be replaced.
// A sprite that does not match is yours, and is left alone. With no hash on
// record it compares against what it would draw right now, so the very first
// run already protects edits made before any of this existed.
//
//   node tools/pixelart/gen.js            keep everything you have touched
//   node tools/pixelart/gen.js --force    overwrite it all, discarding edits
//
// To hand a sprite back to the generator, delete it (or its .generated.json
// line) and re-run.
const MANIFEST = path.join(OUT, '.generated.json');
const FORCE = process.argv.includes('--force');
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

// Two separate records, and the distinction is the whole point:
//   sprites — the hash of what the generator itself wrote
//   yours   — the hash of a sprite you replaced, which it must never touch
// A hash of yours is NEVER filed under `sprites`. Conflating the two is what
// let a "kept" sprite get overwritten on the following run.
let prev = { sprites: {}, yours: {} };
try {
  const j = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  prev = { sprites: j.sprites || {}, yours: j.yours || {} };
} catch { /* first run */ }
const nowGen = {}, nowYours = {};

const save = (sp, cat, name) => {
  const rel = `${cat}/${name}.png`, file = out(cat, name);
  const fresh = sp.bytes(), freshHash = sha(fresh);
  made.push({ cat, name, colours: sp.palette().size });
  const claim = () => { sp.save(file); nowGen[rel] = freshHash; return sp; };

  if (FORCE) return claim();
  if (!fs.existsSync(file)) return claim();   // deleted on purpose -> hand it back

  const diskHash = sha(fs.readFileSync(file));
  const mine = () => { nowYours[rel] = diskHash; kept.push(rel); return sp; };

  if (prev.yours[rel] === diskHash) return mine();          // already yours, still untouched
  // Is this the generator's own output? With nothing on record, compare against
  // what it would draw right now — so edits made before any of this existed are
  // still recognised as yours on the very first run.
  const wasOurs = rel in prev.sprites ? diskHash === prev.sprites[rel] : diskHash === freshHash;
  if (!wasOurs) return mine();                              // you changed it

  if (diskHash !== freshHash) sp.save(file);
  nowGen[rel] = freshHash;
  return sp;
};

// Some art is hand-drawn rather than generated — the zap effect in web/images/.
// Adopt those files as-is so a rebuild never paints over them.
const HAND = path.join(__dirname, '..', '..', 'web', 'images');
const orphaned = [];
const adopt = (file, cat, name) => {
  const src = path.join(HAND, file), dest = out(cat, name);
  if (fs.existsSync(src)) return save(Sprite.load(src), cat, name);
  // Source gone — keep the copy already in the set rather than redrawing it.
  if (fs.existsSync(dest)) { orphaned.push(`${cat}/${name}.png (source ${file} is missing)`); return save(Sprite.load(dest), cat, name); }
  orphaned.push(`${cat}/${name}.png (SKIPPED — no ${file} and nothing in the set)`);
  return null;
};

// ============================ TROOPS =========================================
// The game's colour per card (main.js getUnitColor).
const C = {
  knight:'#9aa6b2', archers:'#c98fb0', giant:'#e0a458', 'mini-pekka':'#5566a0',
  skeletons:'#e6e3d3', 'skeleton-army':'#e6e3d3', musketeer:'#7c8fc7',
  'elite-musketeer':'#ec7fb4', 'mega-knight':'#6b5b8a', 'p-e-k-k-a':'#4b4f86',
  barbarians:'#d8a24e', 'fire-spirit':'#ff7a3c', 'ice-spirit':'#9ddcef',
  'electro-spirit':'#4f9bff', 'heal-spirit':'#76d98a', minions:'#356b6b',
  goblins:'#79b44a', 'spear-goblins':'#8cc04f', bats:'#6a4a78',
  'goblin-demolisher':'#5e9c3a', wizard:'#ff7043', witch:'#8e4fb0',
  'mega-minion':'#2f4f6e', 'minion-horde':'#356b6b', 'baby-dragon':'#79c267',
  'inferno-dragon':'#ff5a2c', golem:'#8a8a8a', 'lava-hound':'#cf5a3c',
  'elixir-golem':'#d56ab5', 'elite-barbarians':'#e0934a', zappies:'#ffd24d',
  sparky:'#64c8ff', 'wall-breakers':'#b5733a', 'royal-giant':'#e6b15a',
  'electro-giant':'#46b6c4', bowler:'#7456b0', 'hog-rider':'#b07a45',
  'royal-hogs':'#e89ab5', prince:'#f1c64a', 'mother-witch':'#7a3f9c',
  'royal-recruits':'#b9a06a', 'dark-prince':'#4a3f5a', 'ice-golem':'#a9dcef',
  lumberjack:'#5a7a3a', hopper:'#6db84a', firecracker:'#e87ea1',
  valkyrie:'#d16f3a', executioner:'#3f8a72', golemite:'#8a8a8a',
  'lava-pup':'#ff8a4c', 'elixir-golemite':'#d56ab5', 'elixir-blob':'#d56ab5',
  'cursed-hog':'#8e4fb0', 'three-musketeers':'#ec7fb4', guard:'#e6e3d3',
  'graveyard-skeleton':'#e6e3d3',
};
// The game's mass per card (Troop.js) — this is the unit's real radius.
const M = {}; for (const k of Object.keys(C)) M[k] = 10;
for (const k of ['skeletons','bats','skeleton-army','graveyard-skeleton','guard']) M[k] = 6;
for (const k of ['fire-spirit','ice-spirit','electro-spirit','heal-spirit']) M[k] = 10;
for (const k of ['goblins','spear-goblins','archers','wall-breakers']) M[k] = 8;
for (const k of ['barbarians','elite-barbarians','royal-recruits']) M[k] = 12;
for (const k of ['mega-knight','p-e-k-k-a']) M[k] = 20;
for (const k of ['sparky','bowler']) M[k] = 18;
for (const k of ['baby-dragon','inferno-dragon','lava-hound']) M[k] = 16;
for (const k of ['giant','golem','elixir-golem','royal-giant','electro-giant']) M[k] = 20;
M['elixir-blob'] = 6; M['lava-pup'] = 6; M['golemite'] = 10; M['elixir-golemite'] = 10;

// Real radius -> pixel radius. Linear, so relative size still reads: the
// smallest unit is a 2.5px dot, the biggest fills the cell.
const pxR = m => 3.2 + (Math.min(m, 20) - 6) / 14 * 4.0;   // 6 -> 3.2 (still round), 20 -> 7.2

// The disc every troop is: base fill, a darker rim, and (when there's room) a
// two-pixel highlight. Three or four colours, never more.
function troopDisc(sp, r, col, cx = 8, cy = 8) {
  const edge = shade(col, -0.26), lite = shade(col, 0.22);
  sp.disc(cx, cy, r, edge);
  sp.disc(cx, cy, Math.max(0.8, r - 1), col);
  if (r >= 4.2) {
    sp.plot(cx - Math.round(r * 0.45) - 1, cy - Math.round(r * 0.45), lite);
    sp.plot(cx - Math.round(r * 0.45),     cy - Math.round(r * 0.45) - 1, lite);
    sp.plot(cx - Math.round(r * 0.45),     cy - Math.round(r * 0.45), lite);
  } else if (r >= 3) {
    sp.plot(cx - Math.round(r * 0.4), cy - Math.round(r * 0.4), lite);
  }
  return sp;
}

for (const [name, col] of Object.entries(C)) {
  save(troopDisc(new Sprite(), pxR(M[name]), col), 'troops', name);
}

// Balloon — envelope + basket. ONE shape function; the teams differ only in colour.
function balloon(col) {
  const sp = new Sprite();
  const edge = shade(col, -0.26), lite = shade(col, 0.22), wood = '#7a5228', woodD = '#4a3016';
  sp.rect(6, 11, 4, 4, woodD);          // basket
  sp.rect(7, 12, 2, 2, wood);
  sp.plot(5, 10, woodD); sp.plot(10, 10, woodD);   // ropes
  sp.disc(8, 7, 6, edge);               // envelope (perfect circle)
  sp.disc(8, 7, 5, col);
  sp.plot(5, 4, lite); sp.plot(6, 4, lite); sp.plot(5, 5, lite);
  return sp;
}
save(balloon('#4f8fe0'), 'troops', 'balloon');
save(balloon('#e05555'), 'troops', 'balloon-red');

// Skeleton Barrel — a barrel, not a disc: staves, two hoops, a skull.
{
  const sp = new Sprite();
  sp.rrect(3, 1, 10, 14, 3, '#5c3a18');
  sp.rrect(4, 2, 8, 12, 2, '#a5713a');
  sp.hline(3, 12, 4, '#6b4423'); sp.hline(3, 12, 11, '#6b4423');   // iron hoops
  sp.vline(6, 3, 10, '#c08a52');                                    // lit stave
  sp.rect(6, 6, 4, 4, '#efe8d8');                                   // skull
  sp.plot(6, 7, '#3a2a1a'); sp.plot(9, 7, '#3a2a1a');
  save(sp, 'troops', 'skeleton-barrel');
}

// ============================ TOWERS =========================================
// Rounded block + a turret layer that can be rotated to aim.
function towerBase(col, s) {
  const sp = new Sprite();
  const edge = shade(col, -0.30), band = shade(col, -0.12);
  sp.rrect(8-s, 8-s, s*2, s*2, Math.max(2, s*0.42), edge);
  sp.rrect(8-s+1, 8-s+1, s*2-2, s*2-2, Math.max(2, s*0.36), band);
  sp.rrect(8-s+2, 8-s+2, s*2-4, s*2-4, Math.max(1, s*0.3), col);
  return sp;
}
function towerTurret(tr) {
  const sp = new Sprite();
  sp.rect(8, 7, Math.round(tr*1.5), 2, '#2b2f36');   // barrel, pointing right
  sp.disc(8, 8, tr, '#2b2f36');
  sp.disc(8, 8, Math.max(1, tr-1), '#4a4e55');
  sp.disc(8, 8, Math.max(0.8, tr*0.42), '#26282c');
  return sp;
}
for (const [side, col] of [['blue','#4aa3ff'], ['red','#ff5a5a']]) {
  for (const [kind, s, tr] of [['princess', 6, 2.6], ['king', 7, 3.2]]) {
    const base = towerBase(col, s);
    save(base, 'towers', `${kind}-${side}-base`);
    save(towerTurret(tr), 'towers', `${kind}-${side}-turret`);
    // the assembled tower, for when you just want one image
    const full = towerBase(col, s);
    const t = towerTurret(tr);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const c2 = t.at(x, y); if (c2) full.plot(x, y, '#' + c2.map(v=>v.toString(16).padStart(2,'0')).join('')); }
    save(full, 'towers', `${kind}-${side}`);
    if (kind === 'king') save(towerTurret(2.2), 'towers', `${kind}-${side}-vent`);
  }
}

// =========================== BUILDINGS =======================================
// All built on the same ROUNDED block the towers use, then given one clear
// feature each so they read at a glance. Four colours apiece.
function block(sp, col, s = 7, r = 3) {
  const edge = shade(col, -0.30), band = shade(col, -0.12);
  sp.rrect(8-s, 8-s, s*2, s*2, r, edge);
  sp.rrect(8-s+1, 8-s+1, s*2-2, s*2-2, r-0.5, band);
  sp.rrect(8-s+2, 8-s+2, s*2-4, s*2-4, r-1, col);
  return sp;
}
{ // Cannon — round wooden base with a barrel out the top
  const sp = new Sprite();
  sp.disc(8, 9, 6.6, '#4a2a10'); sp.disc(8, 9, 5.6, '#8a5c33');
  sp.hline(3, 12, 7, '#6b4423'); sp.hline(3, 12, 11, '#6b4423');
  sp.rect(7, 1, 2, 6, '#26282c');            // barrel
  sp.rect(6, 1, 4, 2, '#4a4e55');            // muzzle
  sp.disc(8, 9, 2.4, '#4a4e55'); sp.disc(8, 9, 1.2, '#26282c');
  save(sp, 'buildings', 'cannon');
}
{ // Tesla — rounded drum, coil post, glowing orb
  const sp = new Sprite(); block(sp, '#2d6d80', 6, 3);
  sp.hline(3, 12, 10, shade('#2d6d80', -0.24));
  sp.hline(3, 12, 12, shade('#2d6d80', -0.24));
  sp.rect(7, 5, 2, 4, '#1e3742');
  sp.disc(8, 4, 3, '#1e3742'); sp.disc(8, 4, 2, '#9fdcf2');
  save(sp, 'buildings', 'tesla-up');
}
{ // Tesla covered — the shut wooden hatch
  const sp = new Sprite(); block(sp, '#8a5c33', 6, 3);
  sp.hline(3, 12, 6, '#5c3a18'); sp.hline(3, 12, 10, '#5c3a18');
  sp.rect(7, 7, 2, 2, '#4a4e55');
  save(sp, 'buildings', 'tesla-covered');
}
{ // Bomb Tower — stone block with a bomb and a lit fuse
  const sp = new Sprite(); block(sp, '#8a8f99', 6, 3);
  sp.disc(8, 6, 3.4, '#101216'); sp.disc(7, 5, 1.1, shade('#8a8f99', -0.12));
  sp.plot(11, 2, '#101216'); sp.disc(12, 1, 1.2, '#ffb63c');
  save(sp, 'buildings', 'bomb-tower');
}
{ // Tombstone — rounded headstone with a cross
  const sp = new Sprite();
  sp.rrect(4, 2, 8, 12, 4, '#5f646b');
  sp.rrect(5, 3, 6, 10, 3, '#9aa0a8');
  sp.vline(8, 5, 11, '#5f646b'); sp.hline(6, 10, 7, '#5f646b');
  sp.hline(3, 12, 14, '#5f4a29'); sp.hline(4, 11, 15, '#5f4a29');   // earth
  save(sp, 'buildings', 'tombstone');
}
{ // Inferno Tower — rounded tower with a glowing eye
  const sp = new Sprite(); block(sp, '#b5563a', 6, 3);
  sp.disc(8, 6, 3.4, '#2c2118'); sp.disc(8, 6, 2.2, '#e06a2c'); sp.disc(8, 6, 1.1, '#ffd47a');
  save(sp, 'buildings', 'inferno-tower');
}
{ // Elixir Collector — rounded tank with a spout and a drop
  const sp = new Sprite(); block(sp, '#c46fb0', 6, 3);
  sp.disc(7, 9, 3, shade('#c46fb0', -0.20)); sp.disc(7, 9, 2, '#eaa8d8');
  sp.rect(10, 3, 2, 5, shade('#c46fb0', -0.30));
  sp.rect(7, 2, 5, 2, shade('#c46fb0', -0.30));
  sp.plot(12, 8, '#f7d9ef'); sp.plot(12, 9, '#f7d9ef');
  save(sp, 'buildings', 'elixir-collector');
}
{ // Crate — rounded box, planks and a brace
  const sp = new Sprite(); block(sp, '#9c7b4a', 6, 3);
  for (let i = 0; i < 9; i++) sp.plot(4 + i, 4 + i, '#7c6238');
  sp.hline(3, 12, 8, '#7c6238');
  save(sp, 'buildings', 'crate');
}

// ============================ SPELLS =========================================
// The placed-spell footprint: a perfect circle with a TEXTURE on it, so each
// zone has a surface of its own rather than a flat fill.
function zone(name, col, opts = {}) {
  const sp = new Sprite();
  const edge = shade(col, -0.26), lite = shade(col, 0.20), dark = shade(col, -0.14);
  const r = opts.r || 7;
  sp.disc(8, 8, r, edge);
  sp.disc(8, 8, r - 1, col);
  if (opts.texture === 'bubbles') {           // poison: clustered bubbles
    for (const [x,y,rr] of [[6,6,1.6],[10,9,1.3],[7,11,1.1],[11,5,1.0]]) { sp.disc(x, y, rr, lite); }
  } else if (opts.texture === 'sparks') {     // rage: bright flecks
    sp.speckle(lite, 7, 0.22);
    sp.disc(8, 8, 2, lite);
  } else if (opts.texture === 'swirl') {      // clone / mirror: a soft inner ring
    sp.ring(8, 8, r - 2, r - 3.2, lite);
    sp.disc(8, 8, 1.8, lite);
  } else if (opts.texture === 'cross') {      // heal: a plus
    sp.rect(7, 4, 2, 8, lite); sp.rect(4, 7, 8, 2, lite);
  } else if (opts.texture === 'flake') {      // freeze: a six-point flake
    sp.rect(7, 3, 2, 10, lite); sp.rect(3, 7, 10, 2, lite);
    sp.plot(5,5,lite); sp.plot(10,10,lite); sp.plot(10,5,lite); sp.plot(5,10,lite);
  } else if (opts.texture === 'grave') {      // graveyard: little headstones
    sp.rect(5, 6, 2, 4, lite); sp.rect(9, 7, 2, 4, lite); sp.plot(8, 5, lite);
  } else if (opts.texture === 'vine') {       // vines: twisting strands
    for (const [x,y] of [[5,5],[6,7],[7,9],[8,11],[10,6],[11,8],[9,4]]) sp.plot(x, y, lite);
    for (const [x,y] of [[6,6],[7,8],[8,10],[10,7]]) sp.plot(x, y, dark);
  } else if (opts.texture === 'stone') {      // royale delivery: crate slats
    sp.hline(4, 11, 6, dark); sp.hline(4, 11, 9, dark); sp.vline(8, 4, 11, dark);
  }
  return sp;
}
save(zone('poison', '#4f8a34', { texture:'bubbles' }), 'spells', 'poison');
save(zone('rage', '#d94f9c', { texture:'sparks' }), 'spells', 'rage');
save(zone('clone', '#3fd3e0', { texture:'swirl' }), 'spells', 'clone');
save(zone('mirror', '#b07fd8', { texture:'swirl' }), 'spells', 'mirror');
save(zone('heal', '#4fb063', { texture:'cross' }), 'spells', 'heal');
save(zone('freeze', '#8fd0ee', { texture:'flake' }), 'spells', 'freeze');
save(zone('graveyard', '#7a5a8a', { texture:'grave' }), 'spells', 'graveyard');
save(zone('vines', '#5fae4f', { texture:'vine' }), 'spells', 'vines');
save(zone('royale-delivery', '#c0a06a', { texture:'stone' }), 'spells', 'royale-delivery');

{ // Fireball — concentric hot core
  const sp = new Sprite();
  sp.disc(8, 8, 7, '#7a2205'); sp.disc(8, 8, 6, '#e8521a');
  sp.disc(8, 8, 4, '#ff8c2b'); sp.disc(8, 8, 2, '#ffd24d');
  save(sp, 'spells', 'fireball');
}
{ // Rocket — dark ball with a skull
  const sp = new Sprite();
  sp.disc(8, 8, 7, '#3a2716'); sp.disc(8, 8, 6, '#6e4a2b');
  sp.disc(8, 7, 3.4, '#f2eede'); sp.rect(6, 10, 4, 2, '#f2eede');
  sp.plot(6, 7, '#241509'); sp.plot(9, 7, '#241509');
  save(sp, 'spells', 'rocket');
}
{ // Giant Snowball — packed snow
  const sp = new Sprite();
  sp.disc(8, 8, 7, '#6f9bbd'); sp.disc(8, 8, 6, '#e9f6ff');
  sp.disc(10, 10, 2, '#cfe4f5'); sp.disc(5, 11, 1.4, '#cfe4f5'); sp.disc(5, 5, 2, '#ffffff');
  save(sp, 'spells', 'giant-snowball');
}
adopt('zap.png', 'spells', 'zap');   // hand-drawn, not generated
{ // Arrows — a fan of three
  const sp = new Sprite();
  for (const x of [3, 8, 13]) {
    sp.vline(x, 2, 11, '#6b4423');
    sp.plot(x-1, 12, '#e2e2e2'); sp.plot(x, 12, '#e2e2e2'); sp.plot(x+1, 12, '#e2e2e2'); sp.plot(x, 13, '#e2e2e2');
    sp.plot(x-1, 3, '#caa15a'); sp.plot(x+1, 3, '#caa15a');
  }
  save(sp, 'spells', 'arrows');
}
{ // The Log / Barbarian Barrel — rolling wood
  const log = new Sprite();
  log.rrect(0, 5, 16, 6, 3, '#3c220c'); log.rrect(1, 6, 14, 4, 2, '#8b4513');
  for (const x of [3, 7, 11]) log.vline(x, 6, 9, '#6b4423');
  log.hline(2, 13, 6, '#b07a3c');
  save(log, 'spells', 'the-log');
  const bb = new Sprite();
  bb.rrect(1, 3, 14, 10, 4, '#3c220c'); bb.rrect(2, 4, 12, 8, 3, '#9c6b3a');
  bb.vline(5, 4, 11, '#6b4423'); bb.vline(10, 4, 11, '#6b4423');
  bb.hline(3, 12, 5, '#c08a52');
  save(bb, 'spells', 'barbarian-barrel');
}
{ // Goblin Barrel — barrel with a green goblin peeking out
  const sp = new Sprite();
  sp.rrect(3, 2, 10, 12, 3, '#5c3a18'); sp.rrect(4, 3, 8, 10, 2, '#8a5a2c');
  sp.hline(3, 12, 6, '#5c3a18'); sp.hline(3, 12, 10, '#5c3a18');
  sp.disc(8, 4, 2, '#79b44a'); sp.plot(7, 4, '#243a18'); sp.plot(9, 4, '#243a18');
  save(sp, 'spells', 'goblin-barrel');
}

// ============================ EFFECTS ========================================
// Perfect rings and discs for everything the game flashes on impact.
const eff = (name, fn) => { const sp = new Sprite(); fn(sp); save(sp, 'effects', name); };
eff('explosion-burst', sp => { sp.disc(8,8,7,'#8f2a06'); sp.disc(8,8,5.6,'#ff4500'); sp.disc(8,8,3.4,'#ffb03a'); sp.disc(8,8,1.6,'#ffe680'); });
eff('explosion-gray',  sp => { sp.disc(8,8,7,'#4a4d52'); sp.disc(8,8,5.6,'#767a82'); sp.disc(8,8,3.4,'#a8adb5'); sp.disc(8,8,1.6,'#d5d9de'); });
eff('shockwave',       sp => { sp.ring(8,8,7,5.6,'#5b6c7e'); sp.ring(8,8,6.4,5.6,'#ffffff'); sp.ring(8,8,3.6,2.6,'#8fa3b6'); });
eff('ice-nova',        sp => { sp.disc(8,8,7,'#4a86a8'); sp.disc(8,8,5.8,'#87cefa'); sp.disc(8,8,3,'#c8ecff');
                               sp.vline(8,2,13,'#ffffff'); sp.hline(2,13,8,'#ffffff'); });
eff('electric-ring',   sp => { sp.ring(8,8,7,5.4,'#6b2b9c'); sp.ring(8,8,6.4,5.4,'#d98cff');
                               for (const [x,y] of [[8,0],[8,15],[0,8],[15,8]]) sp.plot(x,y,'#f7e6ff'); });
eff('phantom-burst',   sp => { sp.ring(8,8,7,5.6,'#7fa8bf'); sp.ring(8,8,4,3,'#c8e4f2'); sp.disc(8,8,1.6,'#ffffff'); });
eff('poison-cloud',    sp => { sp.disc(8,8,7,'#2f5c22'); sp.disc(8,8,6,'#4f8a34');
                               for (const [x,y,r] of [[6,6,1.8],[10,9,1.5],[7,11,1.2]]) sp.disc(x,y,r,'#7ab84a'); });
eff('rage-zone',       sp => { sp.disc(8,8,7,'#8a2f6b'); sp.disc(8,8,6,'#d94f9c'); sp.disc(8,8,3,'#ff8ec6'); sp.disc(8,8,1.2,'#ffc4e2'); });
eff('heal-zone',       sp => { sp.ring(8,8,7,5.6,'#4fb063'); sp.rect(7,4,2,8,'#d8f7e0'); sp.rect(4,7,8,2,'#d8f7e0'); });
eff('graveyard',       sp => { sp.disc(8,8,7,'#2b1140'); sp.disc(8,8,6,'#5a2a80');
                               sp.rect(6,6,2,5,'#cfc7d8'); sp.rect(9,7,2,4,'#cfc7d8'); });
eff('clone-zone',      sp => { sp.disc(8,8,7,'#1e6d78'); sp.disc(8,8,6,'#3fd3e0'); sp.ring(8,8,4,3,'#9df2fa'); sp.disc(8,8,1.4,'#ffffff'); });
eff('chain-lightning', sp => { for (const [x,y] of [[1,10],[2,9],[3,8],[4,7],[5,8],[6,9],[7,8],[8,7],[9,6],[10,7],[11,8],[12,7],[13,6],[14,5]]) sp.plot(x,y,'#4f9bff');
                               for (const [x,y] of [[3,8],[6,9],[9,6],[12,7]]) sp.plot(x,y,'#eaffff'); });
eff('spin-sweep',      sp => { sp.ring(8,8,7,5.6,'#ffe3b8'); for (let x=8;x<16;x++) sp.clearPx(x, 8);
                               sp.rect(11,4,3,2,'#cfd8de'); sp.rect(12,6,1,2,'#8a6033'); });
eff('death-bomb',      sp => { sp.disc(8,9,5.6,'#101216'); sp.disc(8,9,4.4,'#2b2f36'); sp.disc(6,7,1.2,'#4a4e55');
                               sp.plot(12,3,'#6b5a2e'); sp.disc(13,2,1.4,'#ffb63c'); });
eff('evo-gem',         sp => { for (let y=0;y<16;y++) for (let x=0;x<16;x++) { const d=Math.abs(x-7.5)+Math.abs(y-7.5);
                               if (d<=7) sp.plot(x,y,'#4a1273'); if (d<=5.5) sp.plot(x,y,'#c45cff'); if (d<=2.5) sp.plot(x,y,'#f0c4ff'); } });
eff('elixir-drop',     sp => { for (let y=0;y<16;y++) for (let x=0;x<16;x++) { const d=Math.abs(x-7.5)+Math.abs(y-7.5);
                               if (d<=6) sp.plot(x,y,'#4a1152'); if (d<=4.5) sp.plot(x,y,'#e05fe8'); if (d<=2) sp.plot(x,y,'#f7b8fb'); } });
// The zap strikes are hand-drawn art, adopted whole.
adopt('zap.png',     'effects', 'zap-strike');
adopt('evo_zap.png', 'effects', 'zap-strike-evo');

// ========================== PROJECTILES ======================================
const proj = (name, fn) => { const sp = new Sprite(); fn(sp); save(sp, 'projectiles', name); };
proj('bullet',       sp => { sp.disc(8,8,3.4,'#20242a'); sp.disc(8,8,2.4,'#5b636e'); sp.plot(7,7,'#9aa3ae'); });
proj('cannonball',   sp => { sp.disc(8,8,5.4,'#0e1013'); sp.disc(8,8,4.4,'#2b3038'); sp.disc(6,6,1.4,'#4e5560'); });
proj('fireball',     sp => { sp.disc(8,8,6,'#7a2205'); sp.disc(8,8,4.8,'#e8521a'); sp.disc(8,8,3,'#ff8c2b'); sp.disc(8,8,1.4,'#ffd24d'); });
proj('rocket',       sp => { sp.disc(8,8,6,'#3a2716'); sp.disc(8,8,5,'#6e4a2b'); sp.disc(8,7,2.6,'#f2eede');
                             sp.plot(7,7,'#241509'); sp.plot(9,7,'#241509'); sp.rect(7,10,3,2,'#f2eede'); });
proj('giant-snowball', sp => { sp.disc(8,8,7,'#6f9bbd'); sp.disc(8,8,6,'#e9f6ff'); sp.disc(10,10,2,'#cfe4f5'); sp.disc(5,5,2,'#ffffff'); });
proj('firework-rocket', sp => { sp.disc(9,7,4,'#8f2f5c'); sp.disc(9,7,3,'#ff6fae'); sp.disc(9,7,1.4,'#ffffff');
                                for (const [x,y] of [[4,12],[5,11],[6,10]]) sp.plot(x,y,'#c4457f'); });
proj('firework-spark', sp => { sp.disc(10,6,2.6,'#ffd9ec'); sp.disc(10,6,1.2,'#ffffff');
                               for (const [x,y] of [[4,12],[5,11],[6,10],[7,9]]) sp.plot(x,y,'#ffbee0'); });
proj('dynamite',     sp => { sp.rrect(5,3,6,11,2,'#6b1010'); sp.rrect(6,4,4,9,1,'#cc2b2b'); sp.rect(6,4,4,2,'#f0e3b0');
                             sp.plot(11,2,'#6b5a2e'); sp.disc(12,1,1.3,'#ffcf3c'); });
proj('axe',          sp => { sp.rect(2,7,9,2,'#7a5228'); sp.rect(2,7,3,2,'#3c280f');
                             sp.rrect(10,4,5,8,2,'#cfd8de'); sp.rect(9,6,2,4,'#98a3ac'); });
proj('the-log',      sp => { sp.rrect(0,5,16,6,3,'#3c220c'); sp.rrect(1,6,14,4,2,'#8b4513');
                             for (const x of [3,7,11]) sp.vline(x,6,9,'#6b4423'); sp.hline(2,13,6,'#b07a3c'); });
proj('the-log-enemy',sp => { sp.rrect(0,5,16,6,3,'#2e0606'); sp.rrect(1,6,14,4,2,'#8b0000');
                             for (const x of [3,7,11]) sp.vline(x,6,9,'#6b1212'); sp.hline(2,13,6,'#b03434'); });
proj('barbarian-barrel', sp => { sp.rrect(1,3,14,10,4,'#3c220c'); sp.rrect(2,4,12,8,3,'#9c6b3a');
                                 sp.vline(5,4,11,'#6b4423'); sp.vline(10,4,11,'#6b4423'); sp.hline(3,12,5,'#c08a52'); });
proj('goblin-barrel', sp => { sp.rrect(3,2,10,12,3,'#5c3a18'); sp.rrect(4,3,8,10,2,'#8a5a2c');
                              sp.hline(3,12,6,'#5c3a18'); sp.hline(3,12,10,'#5c3a18'); sp.vline(6,4,9,'#a8703f'); });
proj('arrows',       sp => { for (const x of [3,8,13]) { sp.vline(x,2,11,'#6b4423');
                             sp.plot(x-1,12,'#e2e2e2'); sp.plot(x,12,'#e2e2e2'); sp.plot(x+1,12,'#e2e2e2'); sp.plot(x,13,'#e2e2e2'); } });

// ============================== UI ===========================================
for (const [n, col] of [['green','#32CD32'],['orange','#FFA500'],['blue','#3296ff'],['purple','#8a6bbf'],['red','#FF6347']]) {
  const sp = new Sprite();
  sp.rrect(0, 3, 16, 10, 5, shade(col, -0.22));
  sp.rrect(1, 4, 14, 8, 4, col);
  sp.hline(3, 12, 5, shade(col, 0.20));
  save(sp, 'ui', 'button-' + n);
}
{ const sp = new Sprite();                                   // gear
  sp.disc(8,8,6.4,'#e8eef6'); sp.disc(8,8,4.6,'#12181f');
  for (const [x,y] of [[8,0],[8,15],[0,8],[15,8],[2,2],[13,2],[2,13],[13,13]]) sp.disc(x,y,1.4,'#e8eef6');
  sp.disc(8,8,2,'#e8eef6');
  save(sp, 'ui', 'gear'); }
{ const sp = new Sprite();                                   // elixir badge
  for (let y=0;y<16;y++) for (let x=0;x<16;x++) { const d=Math.abs(x-7.5)+Math.abs(y-7.5);
    if (d<=6) sp.plot(x,y,'#4a1152'); if (d<=4.5) sp.plot(x,y,'#e05fe8'); if (d<=2) sp.plot(x,y,'#f7b8fb'); }
  save(sp, 'ui', 'elixir-4'); }
{ const sp = new Sprite();                                   // evo gem
  for (let y=0;y<16;y++) for (let x=0;x<16;x++) { const d=Math.abs(x-7.5)+Math.abs(y-7.5);
    if (d<=7) sp.plot(x,y,'#4a1273'); if (d<=5.5) sp.plot(x,y,'#c45cff'); if (d<=2.5) sp.plot(x,y,'#f0c4ff'); }
  save(sp, 'ui', 'evo-gem'); }

// ============================= MAP ===========================================
// Flat ground tiles in the game's real ocean-theme colours; they tile seamlessly.
const tile = (name, base, fn) => { const sp = new Sprite(); sp.rect(0,0,16,16,base); if (fn) fn(sp); save(sp, 'map', name); };
tile('tile-field', '#2e7da0');
tile('tile-field-band', '#2e7da0', sp => sp.rect(0, 0, 16, 8, '#2a7395'));
tile('tile-grid', '#2e7da0', sp => { sp.hline(0, 15, 0, '#348aae'); sp.vline(0, 0, 15, '#348aae'); });
tile('tile-blocked', '#2e7da0', sp => sp.speckle('#8a4a52', 11, 0.5));
tile('tile-river', '#3a8fd0', sp => { sp.hline(0, 15, 4, '#47a0e0'); sp.hline(0, 15, 11, '#3184c2'); });
tile('tile-bridge', '#9c6b3a', sp => { for (const y of [3, 7, 11, 15]) sp.hline(0, 15, y, '#7a5228'); });
tile('tile-menu', '#236480');
tile('tile-deck', '#152c3a');

// ============================ FONT ===========================================
// The 5x7 glyphs drawn in font.js, packed into one sheet. Pure white on
// transparent, so the game tints it to whatever colour the text needs.
let fontMetrics = null;
{
  const F = require('./font.js');
  const COLS = 16, ROWS = Math.ceil((F.LAST - F.FIRST + 1) / COLS);
  const sheet = new Sprite(COLS * F.CELL_W, ROWS * F.CELL_H);
  const width = {};
  for (let code = F.FIRST; code <= F.LAST; code++) {
    const ch = String.fromCharCode(code), art = F.GLYPHS[ch];
    if (!art) continue;
    const i = code - F.FIRST, ox = (i % COLS) * F.CELL_W, oy = Math.floor(i / COLS) * F.CELL_H;
    let ink = -1;
    for (let y = 0; y < F.ART_H; y++) for (let x = 0; x < F.ART_W; x++) {
      if (art[y][x] !== '#') continue;
      sheet.plot(ox + x, oy + y, '#ffffff');
      if (x > ink) ink = x;
    }
    width[ch] = ink < 0 ? 2 : ink + 1;   // blank right columns trimmed -> proportional
  }
  save(sheet, 'font', 'sheet');
  fontMetrics = { cell: { w: F.CELL_W, h: F.CELL_H }, art: { w: F.ART_W, h: F.ART_H },
                  cols: COLS, first: F.FIRST, last: F.LAST, gap: 1, width };
}

// ============================ ELIXIR =========================================
// The game's own elixir colours (main.js: the bar is #d426c8 on #2a1430).
const ELX = '#d426c8', ELX_BG = '#2a1430';

{ // The droplet — a taper into a round bulb, the shape everything else echoes.
  const drop = (name, col) => {
    const sp = new Sprite();
    for (let y = 2; y <= 9; y++) {                     // taper from the point down
      const hw = (y - 2) * 0.62;
      for (let x = Math.round(8 - hw); x <= Math.round(7 + hw); x++) sp.plot(x, y, col);
    }
    sp.disc(8, 10, 5, col);                            // the bulb, a perfect circle
    sp.rim(shade(col, -0.28));
    sp.disc(6, 9, 1.3, shade(col, 0.3));               // highlight
    save(sp, 'elixir', name);
  };
  drop('drop', ELX);
  drop('drop-gold', '#e8b33c');                        // the collector's payout
}

{ // Cost badge — the droplet again, but flattened into a coin so a numeral fits.
  const sp = new Sprite();
  sp.disc(8, 8, 7, ELX);
  sp.rim(shade(ELX, -0.32));
  sp.disc(6, 5, 1.6, shade(ELX, 0.3));
  save(sp, 'elixir', 'badge');
}

{ // Bar pieces. The bar is full-width and 16px tall, so it is built from a left
  // cap, a stretched middle and a right cap — the caps stay crisp at any width.
  const piece = (name, w, h, draw) => { const sp = new Sprite(w, h); draw(sp); save(sp, 'elixir', name); };
  const capL = (col) => sp => { sp.rrect(0, 2, 12, 12, 5, col); sp.rim(shade(col, -0.32)); };
  const capR = (col) => sp => { sp.rrect(-6, 2, 12, 12, 5, col); sp.rim(shade(col, -0.32)); };
  const mid  = (col) => sp => {
    sp.rect(0, 2, sp.w, 12, col);
    sp.hline(0, sp.w - 1, 2, shade(col, -0.32));       // only top/bottom get an edge,
    sp.hline(0, sp.w - 1, 13, shade(col, -0.32));      // so tiled copies show no seam
    sp.hline(0, sp.w - 1, 3, shade(col, 0.18));
  };
  piece('bar-cap-left',       6, 16, capL(ELX_BG));
  piece('bar-cap-right',      6, 16, capR(ELX_BG));
  piece('bar-mid',            4, 16, mid(ELX_BG));
  piece('bar-fill-cap-left',  6, 16, capL(ELX));
  piece('bar-fill-cap-right', 6, 16, capR(ELX));
  piece('bar-fill-mid',       4, 16, mid(ELX));
  piece('bar-tick',           2, 16, sp => { sp.vline(0, 3, 12, '#1b0c20'); sp.vline(1, 3, 12, shade(ELX_BG, 0.12)); });
}

// ============================ CARDS ==========================================
// Card frames are 9-slice: 24x24 with 8px corners, so one frame fits the 110x122
// hand card, the 72x100 next-card slot and the 140-tall deck tile without ever
// stretching a corner. Colours follow main.js elixirColor().
{
  const frame = (name, col, face = '#f4efe6') => {
    const sp = new Sprite(24, 24);
    sp.rrect(0, 0, 24, 24, 6, shade(col, -0.38));   // outer edge
    sp.rrect(1, 1, 22, 22, 5, col);                 // the band
    sp.rrect(2, 2, 20, 20, 4, shade(col, 0.16));    // bevel
    sp.rrect(3, 3, 18, 18, 3, face);                // the face; the centre stretches
    save(sp, 'cards', name);
  };
  frame('frame-1', '#3a8f5a');   // <=2 elixir
  frame('frame-2', '#3a6f9f');   // <=4
  frame('frame-3', '#6a4a9f');   // <=6
  frame('frame-4', '#9f3a6a');   // 7+
  frame('frame-evo', '#c45cff');
  frame('frame-locked', '#6b6f75', '#b9bdb7');

  { // Card back — the crown-less skull mark the app icon uses, kept simple.
    const sp = new Sprite(24, 24);
    sp.rrect(0, 0, 24, 24, 6, '#2b1c3a');
    sp.rrect(2, 2, 20, 20, 4, '#4a2f6b');
    sp.disc(12, 11, 5, '#e8e2d6');
    sp.rect(10, 13, 2, 2, '#2b1c3a'); sp.rect(14, 13, 2, 2, '#2b1c3a');
    sp.rect(10, 16, 6, 3, '#e8e2d6');
    save(sp, 'cards', 'back');
  }
  { // Empty slot — a dashed well for the next-card position.
    const sp = new Sprite(24, 24);
    sp.rrect(0, 0, 24, 24, 6, '#3a3f47');
    sp.rrect(2, 2, 20, 20, 4, '#22262c');
    for (let i = 3; i < 21; i += 4) { sp.plot(i, 2, '#555b64'); sp.plot(i, 21, '#555b64'); sp.plot(2, i, '#555b64'); sp.plot(21, i, '#555b64'); }
    save(sp, 'cards', 'slot');
  }
}

// ---------------------------------------------------------------------------
const byCat = {};
for (const m of made) (byCat[m.cat] = byCat[m.cat] || []).push(m);
console.log(`generated ${made.length} sprites`);
for (const [cat, list] of Object.entries(byCat)) {
  const worst = list.reduce((a, b) => (b.colours > a.colours ? b : a));
  console.log(`  ${cat.padEnd(12)} ${String(list.length).padStart(3)}   max colours: ${worst.colours} (${worst.name})`);
}
const fat = made.filter(m => m.colours > 6);
if (fat.length) console.log('\nover 6 colours:', fat.map(m => `${m.cat}/${m.name}=${m.colours}`).join(', '));
else console.log('\nevery sprite uses 6 colours or fewer');

fs.mkdirSync(OUT, { recursive: true });
if (fontMetrics) fs.writeFileSync(path.join(OUT, 'font', 'metrics.json'), JSON.stringify(fontMetrics, null, 1) + '\n');
fs.writeFileSync(MANIFEST, JSON.stringify({
  note: 'sprites = what the generator wrote, and may overwrite. yours = sprites you replaced; the generator leaves these alone forever. To hand one back, delete the file (or its line here) and re-run.',
  yours: nowYours,
  sprites: nowGen,
}, null, 1) + '\n');

if (FORCE) console.log('\n--force: everything overwritten, INCLUDING sprites of yours');
else if (kept.length) {
  console.log(`\nkept ${kept.length} sprite${kept.length > 1 ? 's' : ''} of yours (not regenerated):`);
  for (const r of kept) console.log('  ' + r);
}
if (orphaned.length) { console.log('\nhand-drawn sources:'); for (const o of orphaned) console.log('  ' + o); }
