// Proves the generator cannot overwrite art you replaced.
//
//     node tools/pixelart/test-guard.js
//
// Runs the real generator against a scratch directory, so it never touches
// web/images/pixel/. Exists because an earlier version of the guard reported a
// sprite as "kept" and then overwrote it on the NEXT run — it had filed the
// user's hash under `sprites`, so the following run mistook it for its own
// work. Anything that ships must survive `repeated runs`, not just one.
const { execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');

const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pixelguard-'));
const GEN = path.join(__dirname, 'gen.js');
const run = (...args) => execFileSync('node', [GEN, ...args], { env: { ...process.env, PIXEL_OUT: DIR } }).toString();
const file = rel => path.join(DIR, rel);
const hash = rel => crypto.createHash('sha256').update(fs.readFileSync(file(rel))).digest('hex').slice(0, 16);
const manifest = () => JSON.parse(fs.readFileSync(path.join(DIR, '.generated.json'), 'utf8'));

let failed = 0;
const check = (label, cond) => { console.log(`${cond ? '  ok  ' : '  FAIL'}  ${label}`); if (!cond) failed++; };

const MINE = 'projectiles/axe.png', THEIRS = 'projectiles/bullet.png';
// Stand-in for "you opened it in an editor and repainted it".
const repaint = rel => { const b = fs.readFileSync(file(rel)); b[b.length - 30] ^= 0xFF; fs.writeFileSync(file(rel), b); return hash(rel); };

try {
  run();
  console.log(`generated a full set into ${DIR}\n`);
  const genBullet = hash(THEIRS);

  const yours = repaint(MINE);
  run();
  check('your edit survives the first run after it', hash(MINE) === yours);
  check('it is recorded under `yours`, not `sprites`', manifest().yours[MINE] === yours && !(MINE in manifest().sprites));

  for (let i = 2; i <= 6; i++) { run(); if (hash(MINE) !== yours) break; }
  check('your edit survives five more runs (the regression)', hash(MINE) === yours);

  check('a sprite you did NOT touch is still generator-owned', hash(THEIRS) === genBullet && THEIRS in manifest().sprites);

  // A sprite whose drawing code changes must still update — the guard has to
  // protect your art without freezing everything else.
  const b = fs.readFileSync(file(THEIRS)); fs.writeFileSync(file(THEIRS), b);
  const m = manifest(); m.sprites[THEIRS] = 'stale000stale000';
  fs.writeFileSync(path.join(DIR, '.generated.json'), JSON.stringify(m));
  run();
  check('a stale generated sprite is refreshed, not frozen', hash(THEIRS) === genBullet);

  fs.unlinkSync(file(MINE));
  run();
  check('deleting your sprite hands it back to the generator', fs.existsSync(file(MINE)) && hash(MINE) !== yours);

  const again = repaint(MINE);
  run('--force');
  check('--force does overwrite your art, as documented', hash(MINE) !== again);

  const out = (repaint(MINE), run());
  check('the run says which sprites it kept', out.includes('kept 1 sprite') && out.includes(MINE));
} finally {
  fs.rmSync(DIR, { recursive: true, force: true });
}
console.log(failed ? `\n${failed} check(s) FAILED` : '\nall checks passed');
process.exit(failed ? 1 : 0);
