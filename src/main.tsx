import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import UpdateMyDetails from './UpdateMyDetails.tsx';
import Members from './Members.tsx';
import Boats from './Boats.tsx';
import FindCrew from './FindACruise.tsx';
import FindACruise from './FindACruise.tsx';

const details = document.getElementById('update_my_details');
const members = document.getElementById('members');
const boats = document.getElementById('members_boats');
const crewfinder = document.getElementById('crewfinder');
const cruisefinder = document.getElementById('cruisefinder');
console.log('PPP', details, members, boats, crewfinder, cruisefinder);
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
