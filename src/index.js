import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from "@auth0/auth0-react";
import './index.css';
import reportWebVitals from './reportWebVitals';
import OGAProvider from "./components/OGAProvider";
import Members from './components/Members';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      scope='member'
      domain="dev-uf87e942.eu.auth0.com"
      clientId="Mlm45jI7zvoQXbLSYSNV8F1qI1iTEnce"
      authorizationParams={{ redirect_uri: window.location.origin + window.location.pathname }}
      audience="https://oga.org.uk/boatregister"
      useRefreshTokens={true}
      cacheLocation='localstorage'
    >
      <OGAProvider>
        <Members />
      </OGAProvider>
    </Auth0Provider>
  </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
