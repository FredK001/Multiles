import type { Page } from '@playwright/test';

/** Répond à la question affichée en lisant son énoncé (aria-label de l'expression). */
export async function answer(page: Page, right = true) {
  await page.locator('.expr[aria-label]').waitFor();
  const label = (await page.locator('.expr').getAttribute('aria-label'))!;
  if (await page.locator('.pad').count()) {
    const m = label.match(/^(\d+) fois combien font (\d+)/);
    let v = m ? Number(m[2]) / Number(m[1]) : (() => { const [, a, b] = label.match(/(\d+) fois (\d+)/)!; return Number(a) * Number(b); })();
    if (!right) v += 1;
    for (const d of String(v)) await page.locator('.pad .key', { hasText: new RegExp(`^${d}$`) }).click();
    await page.getByRole('button', { name: 'Valider' }).click();
  } else if (await page.locator('.vf').count()) {
    const [, a, b, s] = label.match(/(\d+) fois (\d+) égale (\d+)/)!;
    const truth = Number(a) * Number(b) === Number(s);
    await page.locator('.vf .choice', { hasText: truth === right ? 'Vrai' : 'Faux' }).click();
  } else {
    const [, a, b] = label.match(/(\d+) fois (\d+)/)!;
    const p = Number(a) * Number(b);
    const target = right ? page.locator('.choices .choice', { hasText: new RegExp(`^${p}$`) }) : page.locator('.choices .choice').filter({ hasNotText: new RegExp(`^${p}$`) }).first();
    await target.click();
  }
}

/** Passe le feedback : attend la fermeture automatique (bonne réponse) ou touche « J'ai compris ». */
export async function next(page: Page) {
  if (await page.locator('.fb-sheet.help').count()) await page.getByRole('button', { name: "J'ai compris" }).click();
  else await page.locator('.fb-sheet').waitFor({ state: 'detached' });
}

/** Écrit des données dans l'IndexedDB de l'app (base « multiles », magasin « kv », clé « data »). */
export async function seedDb(page: Page, data: unknown) {
  await page.goto('/lab.html');
  await page.evaluate((d) => new Promise<void>((res, rej) => {
    const r = indexedDB.open('multiles');
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onerror = () => rej(r.error);
    r.onsuccess = () => {
      const tx = r.result.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(d, 'data');
      tx.oncomplete = () => { r.result.close(); res(); };
    };
  }), data);
}

const WORDS: Record<string, number> = { vingt: 20, trente: 30, quarante: 40, un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9 };
/** Résout le verrou parent : « vingt et un plus quarante-trois » → 64. */
export const solveGate = (t: string): number =>
  t.split(' plus ').reduce((s, part) => s + part.replace(' et ', '-').split('-').reduce((n, w) => n + (WORDS[w] ?? 0), 0), 0);

export const PROD = 'http://localhost:4173';

/** Profil de test minimal, au format de l'application. */
export const kid = (over: Record<string, unknown> = {}) => ({
  id: 'k1', name: 'Nina', color: '#0D7A5F', av: { face: 'rond', hair: 'court', skin: '#F1C29A', hairColor: '#6B3E1F', acc: 'aucun' },
  pepin: 'braise', pw: {}, house: [], owned: [], stars: 0, coins: 50, level: 1, xp: 0,
  streak: { current: 0, best: 0, buoys: 1, lastDay: null, buoyDays: [], checkedDay: null },
  isle: 1, isl: {}, mastered: [], traps: [], trapLog: {}, records: {}, stickers: [], seen: [], days: {},
  defiDay: null, defiPick: null, pendingStreak: null, createdAt: 0, ...over,
});

/** Écrit des profils dans l'IndexedDB du build de production puis recharge. */
export async function seedProd(page: Page, profiles: unknown[], settings = { sound: true, bossTime: 2 }) {
  await page.goto(PROD + '/');
  await page.evaluate((d) => new Promise<void>((res, rej) => {
    const r = indexedDB.open('multiles');
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onerror = () => rej(r.error);
    r.onsuccess = () => {
      const tx = r.result.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(d, 'data');
      tx.oncomplete = () => { r.result.close(); res(); };
    };
  }), { version: 1, profiles, settings, persistAsked: true });
  await page.reload();
}
