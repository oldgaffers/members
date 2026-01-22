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

const details = document.getElementById('update_my_details');
const members = document.getElementById('members');
const boats = document.getElementById('members_boats');
const crewfinder = document.getElementById('crewfinder');
const cruisefinder = document.getElementById('cruisefinder');
const map = document.getElementById('map');
const doc = document.getElementById('doc');

if (details) {
  ReactDOM.createRoot(details).render(<App><UpdateMyDetails /></App>);
}

if (members) {
  ReactDOM.createRoot(members).render(<App><Members /></App>);
}

if (boats) {
  ReactDOM.createRoot(boats).render(<App><Boats /></App>);
}

if (crewfinder) {
  ReactDOM.createRoot(crewfinder).render(<App><FindCrew /></App>);
}

if (cruisefinder) {
  ReactDOM.createRoot(cruisefinder).render(<App><FindACruise /></App>);
}

if (map) {
  const attr = map.dataset;
  const markers = window.markers ?? [];
  ReactDOM.createRoot(map).render(<App><CustomMap height={800} markers={markers} scope={attr['scope'] ?? 'public'} /></App>);
}

if (doc) {
  const attr = doc.dataset;
  ReactDOM.createRoot(doc).render(<App><PrivateDocument  name={attr['oga-arg0']}/></App>);
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
      p.outerHTML = `<div id="${component}" ${al}></div>`;
    }
  }
}

handleParagraphs();

// registerServiceWorker();
