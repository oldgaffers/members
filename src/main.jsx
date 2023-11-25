import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import reportWebVitals from './reportWebVitals';
import OGAProvider from './components/OGAProvider';
import Members from './components/Members';
import Boats from './components/Boats';
import UpdateMyDetails from './components/UpdateMyDetails';
import FindCrew from './components/FindCrew';

function Wrapper({ children }) {
  return (
    <React.StrictMode>
      <Auth0Provider
        domain="dev-uf87e942.eu.auth0.com"
        clientId="Mlm45jI7zvoQXbLSYSNV8F1qI1iTEnce"
        authorizationParams={{
          redirect_uri: window.location.origin + window.location.pathname,
          audience: 'https://oga.org.uk/boatregister',
          scope: 'openid profile email member',
        }}
        useRefreshTokens
        useRefreshTokensFallback
        cacheLocation="localstorage"
      >
        <OGAProvider>
          {children}
        </OGAProvider>
      </Auth0Provider>
    </React.StrictMode>
  );
}

const details = document.getElementById('update_my_details');
const members = document.getElementById('members');
const boats = document.getElementById('members_boats');
const crewfinder = document.getElementById('crewfinder');

if (details) {
  ReactDOM.createRoot(details).render(<Wrapper><UpdateMyDetails /></Wrapper>);
}

if (members) {
  ReactDOM.createRoot(members).render(<Wrapper><Members /></Wrapper>);
}

if (boats) {
  ReactDOM.createRoot(boats).render(<Wrapper><Boats /></Wrapper>);
}

if (crewfinder) {
  ReactDOM.createRoot(crewfinder).render(<Wrapper><FindCrew /></Wrapper>);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
