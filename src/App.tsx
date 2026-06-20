import React, { PropsWithChildren } from 'react'
import { Auth0Provider } from '@auth0/auth0-react';
import './App.css'
import GOLDProvider from './GOLDProvider';

type AppProps = {
  name?: string
}

function App({ children }: PropsWithChildren<AppProps>) {
  const redirect_uri = window.location.origin + window.location.pathname;
  const params = new URLSearchParams(document.location.search);
  const next = params.get("next") === 'true';
  return (
    <React.StrictMode>
      <Auth0Provider
        domain="dev-uf87e942.eu.auth0.com"
        clientId="Mlm45jI7zvoQXbLSYSNV8F1qI1iTEnce"
        authorizationParams={{
          redirect_uri,
          audience: 'https://oga.org.uk/boatregister',
          scope: 'openid profile email member',
        }}
        useRefreshTokens
        useRefreshTokensFallback
        cacheLocation="localstorage"
      >
        <GOLDProvider next={next}>
          {children}
        </GOLDProvider>
      </Auth0Provider>
    </React.StrictMode>
  );
}


export default App
