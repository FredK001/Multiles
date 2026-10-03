/* Aiguillage des écrans selon la route. */
import { Album } from '../screens/Album';
import { Create } from '../screens/Create';
import { Discover } from '../screens/Discover';
import { Editor } from '../screens/Editor';
import { End } from '../screens/End';
import { Grid } from '../screens/Grid';
import { Home } from '../screens/Home';
import { IsleScreen } from '../screens/Isle';
import { MapScreen } from '../screens/Map';
import { OpsScreen } from '../screens/Ops';
import { Parent } from '../screens/Parent';
import { QuestionScreen } from '../screens/Question';
import { Shop } from '../screens/Shop';
import { Who } from '../screens/Who';
import { useApp } from './context';
import type { Route } from './routes';

/** Écrans qui demandent un joueur sélectionné. */
const CHILD = new Set(['home', 'ops', 'map', 'isle', 'discover', 'question', 'end', 'grid', 'shop', 'album', 'editor']);

export function Screen({ route }: { route: Route }) {
  const { player } = useApp();
  if (CHILD.has(route.name) && !player) return <Who />;
  switch (route.name) {
    case 'who': return <Who />;
    case 'create': return <Create />;
    case 'editor': return <Editor ret={route.ret} />;
    case 'home': return <Home />;
    case 'map': return <MapScreen key={route.op} op={route.op} />;
    case 'ops': return <OpsScreen then={route.then} />;
    case 'isle': return <IsleScreen key={route.s} s={route.s} />;
    case 'discover': return <Discover s={route.s} m={route.m} />;
    // Une nouvelle clé à chaque lancement : « Rejouer » repart d'une session neuve.
    case 'question': return <QuestionScreen key={route.nonce} cfg={route.cfg} back={route.back} />;
    case 'end': return <End end={route.end} cfg={route.cfg} back={route.back} />;
    case 'grid': return <Grid />;
    case 'shop': return <Shop />;
    case 'album': return <Album />;
    case 'parent': return <Parent />;
  }
}
