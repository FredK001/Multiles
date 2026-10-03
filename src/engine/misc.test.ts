import { describe, expect, it } from 'vitest';
import { SHOP } from '../content/shop';
import { ofIsle } from '../content/isles';
import { stickerName, stickerHow } from '../content/stickers';
import { nb } from '../content/text';
import { tipOf } from '../content/messages';
import { frNum, gateQuestion, gateSolved, newGate } from './gate';
import { gridCount, rowPct, seriesDone, seriesPct, tablesDone } from './mastery';
import { factsOf } from './series';
import { factKey } from './keys';
import { buy, cleanName, createProfile, defaultAvatar, freeColors, isWorn, randomizeAvatar, setGrade, wear } from './profile';
import { opProg } from './progress';
import { seeded } from './random';
import { hardList, weekMinutes } from './stats';
import { ActiveClock, Countdown, fmtTime } from './timer';
import { mulOf, newKid, TODAY } from './test-helpers';

describe('Chrono', () => {
  it('compte à rebours, en pause pendant le feedback d\'erreur', () => {
    const c = new Countdown(60, 0);
    expect(c.left(10_000)).toBe(50);
    c.pause(10_000);
    expect(c.left(25_000)).toBe(50); // 15 s de pause ignorées
    c.resume(25_000);
    expect(c.left(35_000)).toBe(40);
    expect(c.expired(85_000)).toBe(true);
    expect(c.left(90_000)).toBe(0);
  });
  it('la barre passe en miel sous 10 s', () => {
    const c = new Countdown(60, 0);
    expect(c.low(49_000)).toBe(false);
    expect(c.low(50_000)).toBe(true);
  });
  it('affichage m:ss arrondi à la seconde supérieure', () => {
    expect(fmtTime(60)).toBe('1:00');
    expect(fmtTime(9.2)).toBe('0:10');
    expect(fmtTime(120)).toBe('2:00');
  });
  it('temps actif : ne court pas quand l\'app est masquée', () => {
    const a = new ActiveClock();
    a.start(0);
    a.pause(30_000);
    a.start(90_000);
    expect(a.elapsed(100_000)).toBe(40_000);
  });
});

describe('Verrou parent', () => {
  it('deux nombres de 21 à 49', () => {
    const rng = seeded(7);
    for (let i = 0; i < 500; i++) {
      const g = newGate(rng);
      for (const n of [g.a, g.b]) { expect(n).toBeGreaterThanOrEqual(21); expect(n).toBeLessThanOrEqual(49); }
    }
  });
  it('écrits en lettres', () => {
    expect([21, 30, 31, 44, 49].map(frNum)).toEqual(['vingt et un', 'trente', 'trente et un', 'quarante-quatre', 'quarante-neuf']);
    expect(frNum(71)).toBe('soixante et onze');
    expect(frNum(80)).toBe('quatre-vingts');
    expect(frNum(98)).toBe('quatre-vingt-dix-huit');
    expect(gateQuestion({ a: 21, b: 34 })).toBe('vingt et un plus trente-quatre');
  });
  it('se résout en chiffres', () => {
    expect(gateSolved({ a: 21, b: 34 }, '55')).toBe(true);
    expect(gateSolved({ a: 21, b: 34 }, '54')).toBe(false);
    expect(gateSolved({ a: 21, b: 34 }, '')).toBe(false);
  });
});

describe('Espace parent', () => {
  it('minutes par jour de la semaine en cours', () => {
    const p = newKid({ days: { '2026-09-28': { ms: 12 * 60_000, sessions: 3, ops: { mul: { ms: 12 * 60_000, sessions: 3 } } }, [TODAY]: { ms: 4.4 * 60_000, sessions: 1, ops: { add: { ms: 4.4 * 60_000, sessions: 1 } } } } });
    expect(weekMinutes(p.days, TODAY)).toEqual([12, 0, 0, 0, 4, 0, 0]);
    expect(weekMinutes(p.days, TODAY, 'mul')).toEqual([12, 0, 0, 0, 0, 0, 0]);
    expect(weekMinutes(p.days, TODAY, 'add')).toEqual([0, 0, 0, 0, 4, 0, 0]);
  });
  it('tables maîtrisées et part par table', () => {
    const m = Array.from({ length: 10 }, (_, i) => `2x${i + 1}`) as `${number}x${number}`[];
    expect(rowPct(m, 2)).toBe(100);
    expect(rowPct(m, 3)).toBe(10); // 2x3 maîtrisée colore 3x2
    expect(tablesDone(m)).toBe(1);
    expect(gridCount(m, ['2x7'])).toBe(17); // 10 + 9 symétriques - le piège 2×7 et sa symétrique
  });
  it('part maîtrisée par série : identique à la part par table pour ×, symétrique pour +, pas pour −', () => {
    const m = ['2x3', '7x2', '5x5', '9x9'] as `${number}x${number}`[];
    for (let r = 1; r <= 10; r++) expect(seriesPct(m, `mul-${r}` as 'mul-1')).toBe(rowPct(m, r));
    const all = factsOf('add-10').map((f) => factKey('add', f.a, f.b));
    expect(seriesPct(all, 'add-10')).toBe(100);
    expect(seriesDone(all, 'add')).toBe(1);
    // 66 calculs : 3+4 compte aussi pour 4+3
    expect(seriesPct(['3+4'], 'add-10')).toBe(Math.round((2 * 100) / 66));
    expect(seriesPct(['9-2'], 'sub-10')).toBe(Math.round(100 / 66));
    expect(seriesPct(['2-9'], 'sub-10')).toBe(0);
  });
  it('multiplications difficiles triées par erreurs récentes', () => {
    const p = newKid({}, { traps: ['4x7', '7x8'], trapLog: { '7x8': [TODAY, TODAY, TODAY] } });
    expect(hardList(mulOf(p), TODAY).map((h) => [h.key, h.errors])).toEqual([['7x8', 3], ['4x7', 1]]);
  });
  it('soustractions difficiles : résultat calculé, 9-2 et 2-9 distincts', () => {
    const h = hardList({ traps: ['13-5', '9+4'], trapLog: { '13-5': [TODAY, TODAY], '4+9': [TODAY] } }, TODAY);
    expect(h.map((x) => [x.key, x.op, x.r, x.errors])).toEqual([['13-5', 'sub', 8, 2], ['9+4', 'add', 13, 1]]);
  });
});

describe('Profil et boutique', () => {
  it('prénom nettoyé, première lettre en capitale', () => {
    expect(cleanName('  léa ')).toBe('Léa');
  });
  it('nouveau profil : 50 pièces, 1 bouée, Plage en cours', () => {
    const p = newKid();
    expect(p).toMatchObject({ coins: 50, level: 1, xp: 0, grade: 'CM1', op: 'mul', autoSpeech: false, streak: { buoys: 1, current: 0 } });
    expect(mulOf(p).current).toBe('mul-1');
  });
  it('nouveau profil de CP : addition en cours, lecture automatique', () => {
    const p = createProfile({ name: 'tom', color: '#0D7A5F', av: defaultAvatar(), pepin: 'pousse', grade: 'CP' });
    expect(p).toMatchObject({ name: 'Tom', grade: 'CP', op: 'add', autoSpeech: true, prog: {} });
    expect(opProg(p).current).toBe('add-10');
  });
  it('changer de classe garde la progression de chaque opération', () => {
    const p = newKid({}, { mastered: ['7x8'] });
    const cp = setGrade(p, 'CP');
    expect(cp).toMatchObject({ grade: 'CP', op: 'add' });
    const back = setGrade(cp, 'CM1');
    expect(back.op).toBe('mul');
    expect(mulOf(back).mastered).toEqual(['7x8']);
    expect(setGrade(back, 'CM1')).toBe(back);
  });
  it('couleurs de profil libres', () => {
    const a = newKid({ color: '#C8371D' }), b = newKid({ color: '#0D7A5F' });
    expect(freeColors([a, b])).toEqual(['#8A36A8', '#A35400']);
    expect(freeColors([a, b], a)).toEqual(['#C8371D', '#8A36A8', '#A35400']);
  });
  it('« Au hasard » ne touche jamais à la peau ni aux accessoires payants', () => {
    const rng = seeded(3);
    for (let i = 0; i < 200; i++) {
      const av = randomizeAvatar({ face: 'rond', hair: 'court', skin: '#5E3A22', hairColor: '#2B1D14', acc: 'aucun' }, rng);
      expect(av.skin).toBe('#5E3A22');
      expect(['ecouteurs', 'bob', 'couronne']).not.toContain(av.acc);
    }
  });
  it('achat : pièces débitées, objet porté', () => {
    const cape = SHOP.moi.find((i) => i.id === 'cape')!;
    const r = buy('moi', cape, newKid({ coins: 130 }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.profile.coins).toBe(10);
    expect(r.profile.owned).toEqual(['cape']);
    expect(r.profile.av.outfit).toBe('cape');
    expect(buy('moi', cape, r.profile)).toEqual({ ok: false, reason: 'owned' });
  });
  it('pas assez de pièces', () => {
    const it0 = SHOP.maison.find((i) => i.id === 'h-aquarium')!;
    expect(buy('maison', it0, newKid({ coins: 30 }))).toEqual({ ok: false, reason: 'coins', missing: 90 });
  });
  it('enlever un objet du Pépin, ranger un objet de la maison, enlever un accessoire', () => {
    const fete = SHOP.pepin[0]!, plante = SHOP.maison[0]!, bob = SHOP.moi.find((i) => i.id === 'bob')!;
    let p = wear('pepin', fete, newKid(), true);
    expect(p.pw.head).toBe('fete');
    expect(isWorn('pepin', fete, p)).toBe(true);
    p = wear('pepin', fete, p, false);
    expect(p.pw.head).toBeNull();
    p = wear('maison', plante, p, true);
    expect(p.house).toEqual(['h-plante']);
    p = wear('maison', plante, p, false);
    expect(p.house).toEqual([]);
    p = wear('moi', bob, wear('moi', bob, p, true), false);
    expect(p.av.acc).toBe('aucun');
  });
});

describe('Textes', () => {
  it('espaces insécables avant ? ! :', () => {
    expect(nb('Qui joue ? Bravo ! Astuce : oui')).toBe('Qui joue\u00a0? Bravo\u00a0! Astuce\u00a0: oui');
  });
  it('compléments d\'île et noms de stickers', () => {
    expect([1, 6, 7, 8, 10].map((n) => ofIsle(n as 1))).toEqual(['de la Plage', 'Bonbon', 'du Volcan', 'des Collines du vent', "de l'Espace"]);
    expect(stickerName('mul-7-pepin')).toBe('Pépin au Volcan');
    expect(stickerName('mul-10-pepin')).toBe("Pépin dans l'Espace");
    expect(stickerName('mul-3-gardien')).toBe('Pommax le gardien');
    expect(stickerHow('mul-1-pepin')).toBe("Fais 9 étoiles sur l'île de la Plage.");
  });
});

describe('Astuces du CP', () => {
  it('pour chaque calcul : jamais de nombre négatif, le bon résultat est donné', () => {
    for (const series of ['add-10', 'add-20', 'sub-10', 'sub-20'] as const)
      for (const f of factsOf(series)) {
        const op = series.startsWith('add') ? 'add' : 'sub', p = op === 'add' ? f.a + f.b : f.a - f.b;
        const t = tipOf({ op, a: f.a, b: f.b });
        expect(t).not.toMatch(/(^|[^\d])-\d|−\s*-/);
        expect(t).toMatch(new RegExp(`\\b${p}\\b`));
        // Chaque nombre écrit dans l'astuce est entre 0 et 20.
        for (const n of t.match(/\d+/g) ?? []) expect(Number(n)).toBeLessThanOrEqual(20);
      }
  });
  it('quelques astuces', () => {
    expect(tipOf({ op: 'add', a: 8, b: 5 })).toBe('Passe par 10 : 8 + 2 = 10, puis 10 + 3 = 13.');
    expect(tipOf({ op: 'add', a: 4, b: 4 })).toBe("C'est un double : 4 + 4 = 8.");
    expect(tipOf({ op: 'add', a: 3, b: 7 })).toBe('Ce sont des amis de 10 : 3 et 7 font 10.');
    expect(tipOf({ op: 'sub', a: 13, b: 5 })).toBe("Descends jusqu'à 10 : 13 − 3 = 10, puis 10 − 2 = 8.");
    expect(tipOf({ op: 'sub', a: 20, b: 5 })).toBe("20, c'est 10 et encore 10 : 10 − 5 = 5, puis 10 + 5 = 15.");
    expect(tipOf({ op: 'sub', a: 8, b: 3 })).toBe('Recule de 3 à partir de 8 : 7, 6, 5.');
    expect(tipOf({ op: 'mul', a: 7, b: 8 })).toBe('Retiens la suite 5, 6, 7, 8 : 56 = 7 × 8.');
  });
});
