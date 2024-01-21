import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import UpdateMyDetails from './UpdateMyDetails.tsx';
import Members from './Members.tsx';
import Boats from './Boats.tsx';
import FindCrew from './FindCrew.tsx';
import FindACruise from './FindACruise.tsx';
import CustomMap from './CustomMap.tsx';
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

// registerServiceWorker();
