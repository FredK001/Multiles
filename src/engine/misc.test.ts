import { describe, expect, it } from 'vitest';
import { SHOP } from '../content/shop';
import { ofIsle } from '../content/isles';
import { stickerName, stickerHow } from '../content/stickers';
import { nb } from '../content/text';
import { frNum, gateQuestion, gateSolved, newGate } from './gate';
import { gridCount, rowPct, tablesDone } from './mastery';
import { buy, cleanName, freeColors, isWorn, randomizeAvatar, wear } from './profile';
import { seeded } from './random';
import { hardList, weekMinutes } from './stats';
import { ActiveClock, Countdown, fmtTime } from './timer';
import { newKid, TODAY } from './test-helpers';

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
    const p = newKid({ days: { '2026-09-28': { ms: 12 * 60_000, sessions: 3 }, [TODAY]: { ms: 4.4 * 60_000, sessions: 1 } } });
    expect(weekMinutes(p.days, TODAY)).toEqual([12, 0, 0, 0, 4, 0, 0]);
  });
  it('tables maîtrisées et part par table', () => {
    const m = Array.from({ length: 10 }, (_, i) => `2x${i + 1}`) as `${number}x${number}`[];
    expect(rowPct(m, 2)).toBe(100);
    expect(rowPct(m, 3)).toBe(10); // 2x3 maîtrisée colore 3x2
    expect(tablesDone(m)).toBe(1);
    expect(gridCount(m, ['2x7'])).toBe(17); // 10 + 9 symétriques - le piège 2×7 et sa symétrique
  });
  it('multiplications difficiles triées par erreurs récentes', () => {
    const p = newKid({ traps: ['4x7', '7x8'], trapLog: { '7x8': [TODAY, TODAY, TODAY] } });
    expect(hardList(p, TODAY).map((h) => [h.key, h.errors])).toEqual([['7x8', 3], ['4x7', 1]]);
  });
});

describe('Profil et boutique', () => {
  it('prénom nettoyé, première lettre en capitale', () => {
    expect(cleanName('  léa ')).toBe('Léa');
  });
  it('nouveau profil : 50 pièces, 1 bouée, Plage en cours', () => {
    const p = newKid();
    expect(p).toMatchObject({ coins: 50, level: 1, xp: 0, isle: 1, streak: { buoys: 1, current: 0 } });
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
    expect(stickerName('7-pepin')).toBe('Pépin au Volcan');
    expect(stickerName('10-pepin')).toBe("Pépin dans l'Espace");
    expect(stickerName('3-gardien')).toBe('Pommax le gardien');
    expect(stickerHow('1-pepin')).toBe("Fais 9 étoiles sur l'île de la Plage.");
  });
});
