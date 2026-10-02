/* Effets visuels du prototype : confettis et pièce qui vole vers le compteur. */
import { coinIcon } from '../art';
import { reducedMotion } from './ui';

const appEl = (): HTMLElement => document.querySelector('.app') as HTMLElement;

export function confetti(host: Element | null): void {
  if (!host || reducedMotion()) return;
  const cols = ['#FFC93C', '#FFFFFF', '#FF8FA3', '#9FD9E8', '#FFC93C'];
  const app = appEl(), r = host.getBoundingClientRect(), ar = app.getBoundingClientRect();
  for (let i = 0; i < 28; i++) {
    const c = document.createElement('span');
    c.className = 'conf';
    c.style.background = cols[i % cols.length]!;
    c.style.borderRadius = i % 3 ? '50%' : '3px';
    c.style.left = r.left - ar.left + r.width / 2 + 'px';
    c.style.top = r.top - ar.top + 20 + 'px';
    app.appendChild(c);
    const ang = -Math.PI * (0.1 + 0.8 * Math.random()), dist = 90 + Math.random() * 120;
    c.animate(
      [
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${Math.cos(ang) * dist * 1.6}px,${Math.sin(ang) * dist}px) rotate(${Math.random() * 500}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${Math.cos(ang) * dist * 1.8}px,${Math.sin(ang) * dist + 140}px) rotate(${Math.random() * 700}deg)`, opacity: 0 },
      ],
      { duration: 1100, easing: 'cubic-bezier(.2,.7,.4,1)' },
    ).onfinish = () => c.remove();
  }
}

/** Fait voler une pièce de `from` vers `to`, puis appelle `done`. */
export function flyCoin(from: Element | null, to: Element | null, done: () => void): void {
  if (!from || !to || reducedMotion()) {
    done();
    return;
  }
  const app = appEl(), ar = app.getBoundingClientRect(), f = from.getBoundingClientRect(), t = to.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly';
  el.innerHTML = coinIcon(34);
  app.appendChild(el);
  const x0 = f.left - ar.left + f.width / 2 - 17, y0 = f.top - ar.top + f.height / 2 - 17, x1 = t.left - ar.left - 2, y1 = t.top - ar.top - 2;
  el.style.left = x0 + 'px';
  el.style.top = y0 + 'px';
  if (!el.animate) {
    el.remove();
    done();
    return;
  }
  el.animate(
    [
      { transform: 'translate(0,0) scale(1.4) rotate(0)' },
      { transform: `translate(${(x1 - x0) * 0.5}px,${(y1 - y0) * 0.5 - 60}px) scale(1.2) rotate(140deg)` },
      { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(.9) rotate(280deg)` },
    ],
    { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' },
  ).onfinish = () => {
    el.remove();
    done();
  };
}

/** Relance l'animation « pop » sur un élément. */
export function pop(el: Element | null): void {
  if (!el) return;
  el.classList.remove('pop');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('pop');
}
