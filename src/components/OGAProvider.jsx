import React, { useState, useEffect } from 'react';
import { InMemoryCache, ApolloClient, createHttpLink } from '@apollo/client';
import { setContext } from "@apollo/client/link/context";
import { ApolloProvider } from '@apollo/react-hooks';
import { useAuth0 } from "@auth0/auth0-react";

const uri = 'https://5li1jytxma.execute-api.eu-west-1.amazonaws.com/default/graphql';

const httpLink = createHttpLink({ uri });

export default function OGAProvider({ children }) {
  const [client, setClient] = useState(new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  }));

  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getAccessToken = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        console.log('token', token);
        const authLink = setContext((_, { headers }) => {
          // get the authentication token from local storage if it exists
          // return the headers to the context so httpLink can read them
          return {
            headers: {
              ...headers,
              authorization: token ? `Bearer ${token}` : "",
            }
          };
        });
        setClient(new ApolloClient({
          link: authLink.concat(httpLink),
          cache: new InMemoryCache(),
        }));
      } else {
        setClient(new ApolloClient({
          link: httpLink,
          cache: new InMemoryCache(),
        }));
      }
    };
    getAccessToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}