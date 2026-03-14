import { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import RoleRestricted from "./RoleRestricted";
import LoginButton from './LoginButton';
import PrivatePdf from './PrivatePdf';
import { Link, Typography } from '@mui/material';

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

function FolderList({ folders, onClick }: { folders: [any], onClick: (id: string) => void }) {
  return (    
    <ul>
      {folders.map(({name}) => (
        <li key={name}>
          <Link component="button" variant="body2" onClick={() => onClick(name as string)}>
            {name as string}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function PrivateFolder({ name }: { name?: string }) {
  const [doc, setDoc] = useState<[any] | undefined>();
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handleClick = (id: string) => {
    setSelectedId(id);
  };

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

  if (selectedId) {
    return <PrivatePdf id={selectedId} />;
  }
  
  return (
    <>
      <RoleRestricted role="member">
      { doc ? <FolderList folders={doc} onClick={handleClick} /> : <p>Loading...</p>   }
      </RoleRestricted>
      <LoginButton />
    </>
  );
}
