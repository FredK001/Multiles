import { render } from 'preact';
import './design';
import { installAudioUnlock } from './audio';
import { App } from './app/App';
import { initPwa } from './pwa';
import { openStore } from './store';

installAudioUnlock();
void initPwa();

openStore()
  .then((store) => render(<App store={store} />, document.getElementById('app-root')!))
  .catch((e) => {
    console.error(e);
    document.getElementById('app-root')!.textContent = 'Multîles n\'a pas pu démarrer. Fermez puis rouvrez l\'application.';
  })
  .finally(() => document.getElementById('splash')?.remove());
