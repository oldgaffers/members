import { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import RoleRestricted from "./RoleRestricted";

const apiWeb = 'https://5li1jytxma.execute-api.eu-west-1.amazonaws.com/default/doc';

export async function getApiWeb(doc: string, accessToken: string) {
  return (await fetch(
    `${apiWeb}?doc_name=${doc}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    }
  )).text();
}

export default function Members({ name }: { name?: string }) {
  const [text, setText] = useState<string | undefined>();
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
      const p = await getApiWeb(name ?? '', token);
      setText(p);
    }
    if (!text) {
      getData();
    }
  }, [text]);

  return (
    <>
      <RoleRestricted role="member">
        <div dangerouslySetInnerHTML={{ __html: text ?? '' }}></div>
      </RoleRestricted>
    </>
  );
}
