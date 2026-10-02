import { expect, test } from '@playwright/test';
import { parityCases } from '../../src/lab/cases';
import { normalizeIds, PROTOTYPE_URL, runInApp, runInPrototype } from './proto';

test.describe('Parité des illustrations avec le prototype', () => {
  test('chaque générateur SVG produit exactement la même chaîne', async ({ page }) => {
    const cases = parityCases();
    const proto = (await runInPrototype(page, cases)).map(normalizeIds);
    const ours = (await runInApp(page, cases)).map(normalizeIds);
    const diffs = cases
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => proto[i] !== ours[i])
      .map(({ c, i }) => `${c.fn}(${JSON.stringify(c.args)})\n  prototype: ${proto[i]!.slice(0, 300)}\n  app:       ${ours[i]!.slice(0, 300)}`);
    expect(diffs, `${diffs.length} écarts sur ${cases.length} cas`).toEqual([]);
    console.log(`  ${cases.length} cas comparés, 0 écart`);
  });

  test('les icônes écrites dans le HTML du prototype sont identiques', async ({ page }) => {
    // [écran à afficher dans le prototype, sélecteur, nom dans src/art]
    const pairs: [string, string, string][] = [
      ['who', '#btnParent svg', 'icoParentLock'],
      ['who', '#btnAdd .plus svg', 'icoPlus'],
      ['who', '#crBack svg', 'icoBack'],
      ['who', '#btnQuit svg', 'icoQuit'],
      ['who', '#parClose svg', 'icoClose'],
      ['who', '#endAgain svg', 'icoAgain'],
      ['who', '[data-screen="home"] [data-tabnav="home"] svg', 'icoTabHome'],
      ['who', '[data-screen="home"] [data-tabnav="grid"] svg', 'icoTabGrid'],
      ['who', '[data-screen="home"] [data-tabnav="treasure"] svg', 'icoTabTreasure'],
      ['isle', '#isdDiscover .ic svg', 'icoDiscover'],
      ['help', '#fbSheet .bulb svg', 'icoBulb'],
    ];
    await page.goto(PROTOTYPE_URL);
    const proto: string[] = [];
    for (const [screen, sel] of pairs) {
      proto.push(await page.evaluate(([scr, s]) => {
        // go, check et QCFG sont des globales du prototype
        const g = globalThis as unknown as { eval(x: string): unknown };
        if (scr === 'isle') g.eval("ISEL={n:7,sel:null};go('isle')");
        if (scr === 'help') g.eval("QCFG={};go('question');check(false)");
        return document.querySelector(s!)!.outerHTML;
      }, [screen, sel]));
    }
    const ours = await runInApp(page, pairs.map(([, , fn]) => ({ fn })));
    // Le prototype passe par le DOM (innerHTML) : on resérialise nos chaînes de la même façon.
    const reserialized = await page.evaluate((list) => list.map((s) => {
      const d = document.createElement('div');
      d.innerHTML = s;
      return d.firstElementChild!.outerHTML;
    }), ours);
    expect(reserialized).toEqual(proto);
  });
});
