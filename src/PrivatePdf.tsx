import { useState, useEffect } from 'react';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromCognitoIdentity } from "@aws-sdk/credential-providers";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getUploadCredentials } from './lib/boatregister-api.mjs';
import RoleRestricted from "./RoleRestricted";

export async function getPdf(name: string): Promise<string> {
  const { region, identityId } = await getUploadCredentials();
  const credentials = fromCognitoIdentity({ identityId, clientConfig: { region } });
  const client = new S3Client({ region, credentials });
  const command = new GetObjectCommand({
    Bucket: 'boatregister-upload',
    Key: `Gaffers Log/${name}`,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export default function PrivatePdf({ id }: { id?: string }) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    const getData = async () => {
      if (id) {
        setUrl(await getPdf(id))
      }
    }
    if (!url) {
      getData();
    }
  }, [url, id]);

  return (
    <RoleRestricted role="member">
      <div style={{ height: '100vh' }}>
        {url ? <iframe src={url} width="100%" height="100%" /> : 'Loading...'}
      </div>
    </RoleRestricted>
  );
}
