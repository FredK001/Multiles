import { afterEach, describe, expect, it, vi } from 'vitest';

type V = { lang: string; localService: boolean; name: string };
const voice = (lang: string, name = lang, localService = true): V => ({ lang, localService, name });

/** Fausse synthèse vocale : garde les énoncés lus. */
function install(list: V[]) {
  const spoken: { text: string; lang: string; rate: number; voice: string }[] = [];
  const handlers: Record<string, () => void> = {};
  class Utterance {
    text: string; lang = ''; rate = 1; volume = 1; voice: V | null = null;
    onend: (() => void) | null = null; onerror: (() => void) | null = null;
    constructor(t: string) { this.text = t; }
  }
  const synth = {
    voices: list,
    getVoices() { return this.voices; },
    speak(u: Utterance) { if (u.text) spoken.push({ text: u.text, lang: u.lang, rate: u.rate, voice: u.voice?.name ?? '' }); u.onend?.(); },
    cancel: vi.fn(),
    addEventListener(_: string, fn: () => void) { handlers.change = fn; },
  };
  vi.stubGlobal('window', { speechSynthesis: synth, SpeechSynthesisUtterance: Utterance });
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  return { spoken, synth, change: () => handlers.change?.() };
}

async function load(list: V[]) {
  vi.resetModules();
  const env = install(list);
  return { ...env, m: await import('./speech') };
}

afterEach(() => vi.unstubAllGlobals());

describe('voix', () => {
  it('préfère l’anglais britannique, puis toute voix anglaise installée ; ignore les voix en ligne', async () => {
    let { m } = await load([voice('en-US', 'Samantha'), voice('en-GB', 'Daniel'), voice('fr-FR', 'Amélie')]);
    expect(m.canSpeak('en')).toBe(true);
    const env = await load([voice('en-US', 'Samantha'), voice('en_GB', 'Kate'), voice('fr-FR')]);
    env.m.speak([{ text: 'apple', lang: 'en' }]);
    expect(env.spoken[0]!.voice).toBe('Kate');
    ({ m } = await load([voice('en-GB', 'Google UK', false), voice('fr-FR')]));
    expect(m.canSpeak('en')).toBe(false);
    expect(m.canSpeak('fr')).toBe(true);
  });

  it('lit la consigne en français puis le mot en anglais, plus lentement ; fin annoncée une seule fois', async () => {
    const { m, spoken } = await load([voice('fr-FR'), voice('en-GB')]);
    const end = vi.fn();
    m.speak([{ text: 'Écoute et touche le bon dessin.', lang: 'fr' }, { text: 'giraffe', lang: 'en' }], end);
    expect(spoken.map((s) => [s.text, s.lang])).toEqual([['Écoute et touche le bon dessin.', 'fr-FR'], ['giraffe', 'en-GB']]);
    expect(spoken[1]!.rate).toBeLessThan(spoken[0]!.rate);
    expect(end).toHaveBeenCalledTimes(1);
  });

  it('une chaîne simple reste lue en français', async () => {
    const { m, spoken } = await load([voice('fr-FR'), voice('en-GB')]);
    m.speak('Bravo !');
    expect(spoken).toEqual([expect.objectContaining({ text: 'Bravo !', lang: 'fr-FR' })]);
  });

  it('sans voix anglaise : l’anglais est sauté, le français reste lu ; bouton visible si une partie se lit', async () => {
    const { m, spoken } = await load([voice('fr-FR')]);
    const end = vi.fn();
    m.speak([{ text: 'Écoute bien.', lang: 'fr' }, { text: 'cat', lang: 'en' }], end);
    expect(spoken.map((s) => s.text)).toEqual(['Écoute bien.']);
    expect(end).toHaveBeenCalledTimes(1);
    expect(m.canSay([{ text: 'cat', lang: 'en' }])).toBe(false);
    expect(m.canSay([{ text: 'Écoute.', lang: 'fr' }, { text: 'cat', lang: 'en' }])).toBe(true);
  });

  it('rien à lire : fin annoncée tout de suite', async () => {
    const { m, spoken } = await load([]);
    const end = vi.fn();
    m.speak([{ text: 'dog', lang: 'en' }], end);
    expect(spoken).toEqual([]);
    expect(end).toHaveBeenCalledTimes(1);
  });

  it('prévient quand une voix anglaise apparaît (voix chargées après coup)', async () => {
    const { m, synth, change } = await load([voice('fr-FR')]);
    const en = vi.fn(), fr = vi.fn();
    m.onVoiceChange(en, 'en');
    m.onVoiceChange(fr, 'fr');
    synth.voices = [voice('fr-FR'), voice('en-GB')];
    change();
    expect(en).toHaveBeenCalledWith(true);
    expect(fr).not.toHaveBeenCalled();
  });
});
