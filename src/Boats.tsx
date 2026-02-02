import RoleRestricted from './RoleRestricted';
import BoatList from './BoatList';
import LoginButton from './LoginButton';
import Welcome from './Welcome';

const places = [
  { name: 'Southwold', area: 'EC', lat: 52.3202, lng: 1.6631 },
  { name: 'Slaughden', area: 'EC', lat: 52.142, lng: 1.6 },
  { name: 'Deben', area: 'EC', lat:  52.0512, lng: 1.3324 },
  { name: 'Harwich', area: 'EC', lat: 51.956, lng: 1.2878 },
  { name: 'Burnham on Crouch', area: 'EC', lat: 51.625, lng: 0.803 },
  { name: 'Medway', area: 'EC', lat: 51.46, lng: 0.742 },
  { name: 'Ramsgate', area: 'EC', lat: 51.3277, lng: 1.3875 },
  { name: 'Chichester', area: 'SO', lat: 50.805, lng: -0.984 },
  { name: 'Cowes', area: 'SO', lat: 50.7577, lng: -1.2934 },
  { name: 'Torbay', area: 'SW', lat: 50.432, lng: -3.526 },
  { name: 'Plymouth', area: 'SW', lat: 50.362, lng: -4.154 },
  { name: 'Fowey', area: 'SW', lat: 50.333, lng: -4.634 },
  { name: 'Falmouth', area: 'SW', lat: 50.1623, lng: -5.044 },
  { name: 'Scilly', area: 'SW', lat: 49.9548, lng: -6.3141 },
  { name: 'Cardiff', area: 'BC', lat: 51.464, lng: -3.15 },
  { name: 'Milford Haven', area: 'BC', lat: 51.703, lng: -5.067 },
  { name: 'Holyhead', area: 'NWa', lat: 53.32, lng: -4.639 },
{ name: 'Conwy', area: 'NWa', lat: 51.699825958, lng: -5.044766},
  { name: 'Dublin', area: 'DB', lat: 53.346, lng: -6.226 },
  { name: 'Belfast', area: 'DB', lat: 54.6, lng: -5.9 }, 
  { name: 'Killybegs', area: 'DB', lat: 54.63, lng: -8.442 }, 
  { name: 'Galway', area: 'DB', lat: 53.27, lng: -9.05 }, 
  { name: 'Dingle', area: 'DB', lat: 52.138, lng: -10.277 },
  { name: 'Cork', area: 'DB', lat: 51.8167, lng: -8.27 },  
  { name: 'Peel', area: 'DB', lat: 54.228, lng: -4.69 },
{ name: 'Lytham', area: 'NW', lat:  51.6998, lng: -5.044766 },
{ name: 'Arnside', area: 'NW', lat: 54.2013, lng: -2.8545 },
  { name: 'Ullswater', area: 'NW', lat: 54.573, lng: -2.9 },
  { name: 'Clyde', area: 'SC', lat: 55.8423, lng: -4.967 },
  { name: 'Oban', area: 'SC', lat: 56.4136, lng: -5.4937 },
  { name: 'Forth', area: 'SC', lat: 55.985, lng: -3.2157 },
  { name: 'Blyth', area: 'NE', lat: 55.1316, lng: -1.509 },
];

export default function Boats() {
  return (
    <>
    <LoginButton/>
    <Welcome />
    <RoleRestricted role="member"><BoatList places={places}/></RoleRestricted>
    </>
  );
}
