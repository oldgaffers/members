import { useState, useEffect, PropsWithChildren } from 'react';
import { InMemoryCache, ApolloClient, HttpLink } from '@apollo/client';
import { ApolloProvider } from "@apollo/client/react";
import { useAuth0 } from "@auth0/auth0-react";

type GOLDProviderProps = {
  uri?: string
  next?: boolean
}

const url1 = 'https://5li1jytxma.execute-api.eu-west-1.amazonaws.com/default/graphql';
const url2 = 'https://jwxzd1md02.execute-api.eu-west-1.amazonaws.com/default/graphql';

export default function GOLDProvider(props: PropsWithChildren<GOLDProviderProps>) {
  const [client, setClient] = useState<ApolloClient>();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const uri = props.uri || props.next ? url2 : url1;
  useEffect(() => {
    const getAccessToken = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        setClient(new ApolloClient({
          link: new HttpLink({
            uri,
            headers: {
              authorization: `Bearer ${token}`,
            }
          }),
          cache: new InMemoryCache(),
        }));
      } else {
        setClient(new ApolloClient({
          link: new HttpLink({ uri }),
          cache: new InMemoryCache(),
        }));
      }
    };
    getAccessToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (!client) return;
  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}
