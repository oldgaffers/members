import { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import RoleRestricted from "./RoleRestricted";
import { getCredentials } from './lib/boatregister-api.mts';
import { fromCognitoIdentity } from '@aws-sdk/credential-providers';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function PdfInNewTab({ bucket, name, client }: { bucket: string; name: string; client: S3Client }) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    const getData = async () => {
      if (name) {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: name,
        });
        setUrl(await getSignedUrl(client, command, { expiresIn: 1800 }))
      }
    }
    if (!url) {
      getData();
    }
  }, [url, name]);

  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer">
      {name.split('/').slice(-1)[0]}
    </a>
  } else {
    return <p>Loading...</p>
  }
}

function Folder({ name, client, credentials }: { name: string; client: S3Client; credentials: any }) {
  const [folder, setFolder] = useState<any[] | undefined>();

  useEffect(() => {
    const getData = async () => {
      if (name && client) {
        const command = new ListObjectsV2Command({
          Bucket: credentials.bucketName,
          Prefix: `${name}/`,
        });
        const l = await client.send(command);
        const files = l.Contents?.filter(({ Key }) => Key?.toLowerCase().endsWith('.pdf')) ?? [];
        const names = files.map(({ Key }) => Key);
        if (names.length === 0) {
          setFolder([]);
          return;
        }
        setFolder(names);
      }
    }
    if (client && !folder) {
      getData();
    }
  }, [folder, name, client]);

  if (!folder) {
    return <p>Loading...</p>
  }

  if (!folder || folder.length === 0) {
    return <p>No files found</p>;
  }
  console.log('folder', folder);
  return <ul>
    {folder.map((name) => (
      <li key={name}>
        <PdfInNewTab bucket={credentials.bucketName} name={name} client={client} />
      </li>
    ))}
  </ul>;
}

export default function PrivateFolder({ name }: { name?: string }) {
  const { getAccessTokenSilently } = useAuth0();
  const [client, setClient] = useState<S3Client | undefined>();
  const [credentials, setCredentials] = useState<any | undefined>();

  useEffect(() => {

    async function getClient() {
      const token = await getAccessTokenSilently();
      const cred = await getCredentials(token);
      const credentials = fromCognitoIdentity({
        identityId: cred.identityId,
        clientConfig: { region: cred.region },
        logins: {
          'cognito-identity.amazonaws.com': cred.token,
        }
      });
      const client = new S3Client({ region: cred.region, credentials });
      setClient(client);
      setCredentials(cred);
    }

    if (client) return;
    if (!name) return;

    getClient();
  }, [client, credentials]);

  if (!name) {
    return <p>No folder specified</p>
  }

  return (
    <RoleRestricted role="member" hide={false}>
      <Folder name={name} client={client!} credentials={credentials} />
    </RoleRestricted>
  );
}
