import { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import RoleRestricted from "./RoleRestricted";
import { getPdf } from './PrivatePdf';

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

function PdfInNewTab({ name }: { name: string }) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    const getData = async () => {
      if (name) {
        setUrl(await getPdf(name))
      }
    }
    if (!url) {
      getData();
    }
  }, [url, name]);

  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer">
      {name}
    </a>
  } else {
    return <p>Loading...</p>
  }
}

export function FolderList({ folders }: { folders: [any] }) {
  return (
    <ul>
      {folders.map(({ name }) => (
        <li key={name}>
          <PdfInNewTab name={name as string} />
        </li>
      ))}
    </ul>
  );
}

export default function PrivateFolder({ name }: { name?: string }) {
  const [doc, setDoc] = useState<[any] | undefined>();
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
    <RoleRestricted role="member" hide={false}>
      {doc ? <FolderList folders={doc} /> : <p>Loading...</p>}
    </RoleRestricted>
  );
}
