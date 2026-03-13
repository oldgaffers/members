import { useState, useEffect, ReactNode } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import RoleRestricted from "./RoleRestricted";
import LoginButton from './LoginButton';

const apiWeb = 'https://5li1jytxma.execute-api.eu-west-1.amazonaws.com/default/doc';

export async function getFolder(folder: string, accessToken: string) {
  return (await fetch(
    `${apiWeb}?folder_name=${encodeURIComponent(folder)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/javascript',
        Authorization: `Bearer ${accessToken}`,
      }
    }
  )).json();
}

function LinkList({ links }: { links: [any] }) {
  console.log('links', links);
  return (
    <>
      {links.map(({name, id}) => (
        <li key={name}>
          <a href={id as string} target="_blank" rel="noopener noreferrer">{name}</a>
        </li>
      ))}
    </>
  );
}

export default function PrivateFolder({ name }: { name?: string }) {
  const [doc, setDoc] = useState<object | undefined>();
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    async function getToken() {
      if (!token) {
        const tok = await getAccessTokenSilently();
        setToken(tok);
      }
    }
    getToken();
  }, [token]);

  useEffect(() => {
    const getData = async () => {
      if (name && token) {
        setDoc(await getFolder(name, token))
      }
    }
    if (!doc) {
      getData();
    }
  }, [doc, name, token]);

  return (
    <>
      <RoleRestricted role="member">
        <ul>
      { doc ? <LinkList links={doc} /> : <p>Loading...</p>   }
      </ul>
      </RoleRestricted>
      <LoginButton />
    </>
  );
}
