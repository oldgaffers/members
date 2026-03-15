import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromCognitoIdentity } from "@aws-sdk/credential-providers";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getCredentials } from './lib/boatregister-api.mjs';

export async function getPdf(name: string, accessToken: string): Promise<string> {
  const { region, identityId, token } = await getCredentials(accessToken);
  const credentials = fromCognitoIdentity({
    identityId,
    clientConfig: { region },
    logins: {
      'cognito-identity.amazonaws.com': token,
    }
  });
  const client = new S3Client({ region, credentials });
  const command = new GetObjectCommand({
    Bucket: 'boatregister-upload',
    Key: `Gaffers Log/${name}`,
  });
  return getSignedUrl(client, command, { expiresIn: 1800 });
}

