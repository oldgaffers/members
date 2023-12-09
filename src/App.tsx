import React, { PropsWithChildren } from 'react'
import { Auth0Provider } from '@auth0/auth0-react';
import './App.css'
import OGAProvider from './OGAProvider';

type FooProps = {
  name?: string
}

function App({ children }: PropsWithChildren<FooProps>) {
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

export default App