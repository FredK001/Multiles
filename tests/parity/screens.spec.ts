/* Captures comparées écran par écran : prototype (profils de démonstration) / application (mêmes données).
   Sorties : test-results/screens/<écran>.png = prototype | application | différences. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { answer, next, openMap, seedDb } from '../helpers';
import { PROTOTYPE_URL } from './proto';

const OUT = resolve(process.cwd(), 'test-results/screens');
const FRIDAY = new Date(2026, 9, 2, 10, 0, 0);
const results: { name: string; pct: number }[] = [];
/** Dernière question affichée par le prototype (pour imposer la même à l'app). */
let protoQ: { choices?: number[] } = {};

async function prepare(page: Page) {
  await page.clock.setFixedTime(FRIDAY);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Math.random = () => 0;
    const v = { lang: 'fr-FR', localService: true, name: 'Test', voiceURI: 'test', default: true };
    if ('speechSynthesis' in window) speechSynthesis.getVoices = () => [v as unknown as SpeechSynthesisVoice];
  });
}

/** Convertit les profils de démonstration du prototype au format de l'application. */
async function protoProfiles(page: Page) {
  await page.goto(PROTOTYPE_URL);
  return page.evaluate(() => {
    const g = globalThis as unknown as { eval(s: string): unknown };
    return g.eval(`PROFILES.map((p) => {
      seedMastery(p); seedStickers(p);
      const isl = {};
      for (const [n, st] of Object.entries(p.isl)) isl[n] = { steps: st[0], trophy: !!st[1], stepStars: stepStars(st) };
      const days = {};
      const week = ['2026-09-28','2026-09-29','2026-09-30','2026-10-01','2026-10-02','2026-10-03','2026-10-04'];
      (p.mins || []).forEach((m, i) => { if (m) days[week[i]] = { ms: m * 60000, sessions: 1 }; });
      const first = Object.keys(days)[0];
      if (first) days[first].sessions += Math.max(0, (p.sessions || 0) - Object.keys(days).length);
      const trapLog = {};
      for (const [k, n] of Object.entries(p.trapErr || {})) { const [a, b] = k.split('x').map(Number); trapLog[Math.min(a, b) + 'x' + Math.max(a, b)] = Array(n).fill('2026-10-02'); }
      return { id: 'seed-' + p.name, name: p.name, color: p.color, av: { ...p.av }, pepin: p.pepin, pw: p.pw || {}, house: p.house || [], owned: p.owned || [],
        stars: p.stars, coins: p.coins, level: p.level, xp: p.xp,
        streak: { current: p.streak, best: p.best || 0, buoys: p.joker, lastDay: p.streak ? '2026-10-01' : null, buoyDays: [], checkedDay: '2026-10-02' },
        isle: p.isle, isl, mastered: [...p.mastered], traps: [...p.traps], trapLog, records: { ...(p.records || {}) },
        stickers: [...p.stickers], seen: [...p.seen], days, defiDay: p.defi ? '2026-10-02' : null, defiPick: { day: '2026-10-02', table: 6 },
        pendingStreak: null, createdAt: 0 };
    })`);
  });
}

async function shot(page: Page): Promise<Buffer> {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  return page.screenshot({ clip: { x: 0, y: 0, width: 390, height: 844 }, animations: 'disabled' });
}

function compare(name: string, a: Buffer, b: Buffer) {
  const A = PNG.sync.read(a), B = PNG.sync.read(b), w = A.width, h = A.height;
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(A.data, B.data, diff.data, w, h, { threshold: 0.1 });
  const out = new PNG({ width: w * 3 + 40, height: h });
  out.data.fill(255);
  PNG.bitblt(A, out, 0, 0, w, h, 0, 0);
  PNG.bitblt(B, out, 0, 0, w, h, w + 20, 0);
  PNG.bitblt(diff, out, 0, 0, w, h, 2 * w + 40, 0);
  writeFileSync(`${OUT}/${name}.png`, PNG.sync.write(out));
  results.push({ name, pct: (n / (w * h)) * 100 });
}

type Step = { name: string; proto: string; app: (page: Page) => Promise<void> };

const lea = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Jouer avec le profil de Léa' }).click();
  await page.locator('[data-screen="home"]').waitFor();
};
const isle7 = async (page: Page) => {
  await lea(page);
  await openMap(page);
  await page.locator('.isle[aria-label^="Île 7,"]').click();
  await page.locator('[data-screen="isle"]').waitFor();
};
const force = (q: object) => async (page: Page) => {
  await page.waitForFunction(() => '__multilesQuestion' in window);
  await page.evaluate((x) => (window as unknown as { __multilesQuestion(q: object): void }).__multilesQuestion(x), q);
};
const stepQuestion = async (page: Page) => {
  await isle7(page);
  await page.locator('.btn-isle').click();
  await page.locator('[data-screen="question"]').waitFor();
};
const PROTO_Q = "PLAYER=PROFILES[0];QCFG={label:'Étape 2',stepIdx:1,back:'isle'};review.isle=7;review.fmt='pave';go('question');";

const STEPS: Step[] = [
  { name: '01-qui-joue', proto: "go('who')", app: async (p) => { await p.goto('/'); } },
  { name: '02-creation', proto: 'startCreate()', app: async (p) => { await p.goto('/'); await p.locator('#btnAdd').click(); } },
  { name: '03-editeur', proto: "PLAYER=PROFILES[0];openEditor('home')", app: async (p) => { await lea(p); await p.locator('.home-disc').click(); } },
  { name: '04-accueil', proto: "PLAYER=PROFILES[0];go('home')", app: lea },
  { name: '05-carte', proto: "PLAYER=PROFILES[0];go('map')", app: async (p) => { await lea(p); await openMap(p); } },
  { name: '06-ile', proto: "PLAYER=PROFILES[0];ISEL={n:7,sel:null};go('isle')", app: isle7 },
  { name: '06b-decouvrir', proto: "PLAYER=PROFILES[0];DSEL={n:7,m:4};go('discover')", app: async (p) => { await isle7(p); await p.locator('.modes2 .discover').first().click(); await p.locator('.mchip').nth(3).click(); } },
  { name: '07a-question-pave', proto: PROTO_Q + "S.cur=makeQ(7,8,'pave');renderQ()", app: async (p) => { await stepQuestion(p); await force({ a: 7, b: 8, fmt: 'pave', p: 56 })(p); } },
  { name: '07b-question-qcm', proto: PROTO_Q + "S.cur=makeQ(7,8,'qcm');renderQ()", app: async (p) => { await stepQuestion(p); await force({ a: 7, b: 8, fmt: 'qcm', p: 56, choices: protoQ.choices })(p); } },
  { name: '07c-question-manquant', proto: PROTO_Q + "S.cur=makeQ(7,8,'manquant');renderQ()", app: async (p) => { await stepQuestion(p); await force({ a: 7, b: 8, fmt: 'manquant', p: 56 })(p); } },
  { name: '07d-question-vf', proto: PROTO_Q + "S.cur=makeQ(7,8,'vf');renderQ()", app: async (p) => { await stepQuestion(p); await force({ a: 7, b: 8, fmt: 'vf', p: 56, truth: true, shown: 56 })(p); } },
  { name: '08a-feedback-juste', proto: PROTO_Q + "S.cur=makeQ(7,8,'pave');renderQ();S.input='56';check(true)", app: async (p) => { await stepQuestion(p); await force({ a: 7, b: 8, fmt: 'pave', p: 56 })(p); await p.locator('.pad .key', { hasText: /^5$/ }).click(); await p.locator('.pad .key', { hasText: /^6$/ }).click(); await p.getByRole('button', { name: 'Valider' }).click(); } },
  { name: '08b-feedback-erreur', proto: PROTO_Q + "S.cur=makeQ(7,8,'pave');renderQ();S.input='54';check(false)", app: async (p) => { await stepQuestion(p); await force({ a: 7, b: 8, fmt: 'pave', p: 56 })(p); await p.locator('.pad .key', { hasText: /^5$/ }).click(); await p.locator('.pad .key', { hasText: /^4$/ }).click(); await p.getByRole('button', { name: 'Valider' }).click(); } },
  { name: '07e-chrono', proto: "PLAYER=PROFILES[0];QCFG={mode:'chrono',timed:60,endless:true,table:7,label:'Défi chrono',back:'isle'};review.isle=7;review.fmt='mix';go('question');S.cur=makeQ(7,8,'pave');renderQ()", app: async (p) => { await isle7(p); await p.locator('.modes2 .discover').nth(1).click(); await force({ a: 7, b: 8, fmt: 'pave', p: 56 })(p); } },
  {
    name: '09-fin', proto: "PLAYER=PROFILES[0];review.isle=7;QCFG={label:'Étape 2',stepIdx:1,back:'isle'};S={firstOK:[],missed:['7x3','7x8'],coins0:PLAYER.coins,good:10};finishSession({first:8,noSticker:true})",
    app: async (p) => { await stepQuestion(p); for (let i = 0; i < 12 && !(await p.locator('[data-screen="end"]').count()); i++) { await answer(p, i >= 2); await next(p); } await p.locator('[data-screen="end"]').waitFor(); await p.waitForTimeout(1600); },
  },
  { name: '10-grille', proto: "PLAYER=PROFILES[0];go('grid')", app: async (p) => { await lea(p); await p.locator('.tabbtn', { hasText: 'Ma grille' }).click(); } },
  { name: '11-boutique', proto: "PLAYER=PROFILES[0];SHOPST={cat:'moi',sel:null,confirm:false};go('shop')", app: async (p) => { await lea(p); await p.locator('.tabbtn', { hasText: 'Trésors' }).click(); } },
  { name: '13a-parent-verrou', proto: "go('parent')", app: async (p) => { await p.goto('/'); await p.locator('#btnParent').click(); } },
  { name: '13b-parent', proto: "PARENT={ok:true};PSEL=0;go('parent')", app: async (p) => { await p.goto('/'); await p.locator('#btnParent').click(); for (const k of ['4', '2', 'Valider']) await p.locator('.gate .key', { hasText: new RegExp(`^${k}$`) }).click(); } },
  { name: '13c-parent-bas', proto: "PARENT={ok:true};PSEL=0;go('parent');document.getElementById('parBody').scrollTop=99999", app: async (p) => { await p.goto('/'); await p.locator('#btnParent').click(); for (const k of ['4', '2', 'Valider']) await p.locator('.gate .key', { hasText: new RegExp(`^${k}$`) }).click(); await p.locator('.par-body').evaluate((e) => { e.scrollTop = 99999; }); } },
  { name: '12-album', proto: "PLAYER=PROFILES[0];go('album')", app: async (p) => { await lea(p); await p.locator('.tabbtn', { hasText: 'Trésors' }).click(); await p.getByRole('button', { name: 'Album' }).click(); } },
];

test.describe.configure({ mode: 'serial' });

test('captures comparées des écrans enfant', async ({ browser }) => {
  test.setTimeout(240_000);
  mkdirSync(OUT, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, baseURL: 'http://localhost:5173' });
  const proto = await ctx.newPage(), app = await ctx.newPage();
  await prepare(proto);
  await prepare(app);
  const profiles = await protoProfiles(proto);
  await seedDb(app, { version: 1, profiles, settings: { sound: true, bossTime: 2 }, persistAsked: true });
  for (const s of STEPS) {
    await proto.goto(PROTOTYPE_URL);
    await proto.evaluate((code) => (globalThis as unknown as { eval(s: string): unknown }).eval(code), s.proto);
    protoQ = await proto.evaluate(() => (globalThis as unknown as { eval(s: string): unknown }).eval('typeof S!=="undefined"&&S&&S.cur?S.cur:{}') as { choices?: number[] });
    if (s.name === '09-fin') await proto.waitForTimeout(1600);
    const a = await shot(proto);
    await s.app(app);
    const b = await shot(app);
    compare(s.name, a, b);
    await seedDb(app, { version: 1, profiles, settings: { sound: true, bossTime: 2 }, persistAsked: true });
  }
  console.log(results.map((r) => `  ${r.name.padEnd(24)} ${r.pct.toFixed(2)} % de pixels différents`).join('\n'));
  writeFileSync(`${OUT}/resume.json`, JSON.stringify(results, null, 2));
  await ctx.close();
});
