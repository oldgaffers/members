import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import UpdateMyDetails from './UpdateMyDetails.tsx';
import Members from './Members.tsx';
import Boats from './Boats.tsx';
import FindCrew from './FindCrew.tsx';
import FindACruise from './FindACruise.tsx';
import CustomMap from './CustomMap.tsx';
import PrivateDocument from './PrivateDocument.tsx';
// import { registerServiceWorker } from './rsw.mjs';

declare global {
  interface Window { markers: { latitude: number; longitude: number; icon: string; name: string; }[]; }
}
const body = document.getElementsByTagName('body').item(0);
if (!body) throw new Error('No body element found');
const alldivs = body.getElementsByTagName('div');
for (let i = 0; i < alldivs.length; i++) {
  const div = alldivs.item(i) as HTMLDivElement | null;
  if (!div) continue;
  const id = div.id;
  const comp = div.dataset['ogaComponent'] ?? id;

  if (comp === 'update_my_details') {
    ReactDOM.createRoot(div).render(<App><UpdateMyDetails /></App>);
  }

  if (comp === 'members') {
    ReactDOM.createRoot(div).render(<App><Members /></App>);
  }

  if (comp === 'members_boats') {
    ReactDOM.createRoot(div).render(<App><Boats /></App>);
  }

  if (comp === 'crewfinder') {
    ReactDOM.createRoot(div).render(<App><FindCrew /></App>);
  }

  if (comp === 'cruisefinder') {
    ReactDOM.createRoot(div).render(<App><FindACruise /></App>);
  }

  if (comp === 'map') {
    const attr = div.dataset;
    const markers = window.markers ?? [];
    ReactDOM.createRoot(div).render(<App><CustomMap height={800} markers={markers} scope={attr['scope'] ?? 'public'} /></App>);
  }

  if (comp === 'doc') {
    ReactDOM.createRoot(div).render(<App><PrivateDocument name={div.dataset['oga-arg0']} /></App>);
  }
}

// convert paragraph elements with <<xxxx>> to divs so that we can nest p and divs inside them
// we need this because most editors don't have html access.
function handleParagraphs() {
  const allparas = document.getElementsByTagName('p');
  for (let i = 0; i < allparas.length; i++) {
    const p = allparas.item(i);
    if (!p) continue;
    const text = p.innerText || '';
    const q = text.match(/^<<(.*?):(.*)>>$/);
    if (q?.length === 3) {
      const [, component, arglist] = q;
      const args = arglist.split(':');
      const al = args.map((a, index) => `data-oga-arg${index}="${a.trim()}"`).join(' ');
      p.outerHTML = `<div data-oga-component="${component}" ${al}></div>`;
    }
  }
}

handleParagraphs();

// registerServiceWorker();
