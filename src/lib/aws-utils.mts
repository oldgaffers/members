import { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } from "@aws-sdk/client-cognito-identity";
import { S3Client } from '@aws-sdk/client-s3';

export async function getAWSCredentials(idToken: string) {
    const cognitoClient = new CognitoIdentityClient({ region: "eu-west-1" });
    const identityPoolId = "eu-west-1:5110b2a1-6761-40f9-bd39-3d00bf8f5629";

    // Step 1: Get Identity ID
    const idCommand = new GetIdCommand({
        IdentityPoolId: identityPoolId,
        Logins: {
            "dev-uf87e942.eu.auth0.com": idToken
        }
    });
    const idResponse = await cognitoClient.send(idCommand);
    // Step 2: Get Credentials
    const credsCommand = new GetCredentialsForIdentityCommand({
        IdentityId: idResponse.IdentityId,
        Logins: {
            "dev-uf87e942.eu.auth0.com": idToken
        }
    });
    return cognitoClient.send(credsCommand);
}

export function getS3ClientFromCredentials(credsResponse: any) {
    if (!credsResponse.Credentials?.AccessKeyId || !credsResponse.Credentials?.SecretKey || !credsResponse.Credentials?.SessionToken) {
        throw new Error("Failed to get credentials");
    }
    return new S3Client({
        region: "eu-west-1",
        credentials: {
            accessKeyId: credsResponse.Credentials.AccessKeyId,
            secretAccessKey: credsResponse.Credentials.SecretKey,
            sessionToken: credsResponse.Credentials.SessionToken
        }
    });
}
