import { SetStateAction } from 'react';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAWSCredentials, getS3ClientFromCredentials } from './aws-utils.mts';

export async function getPrivateImage(getAccessTokenSilently: () => Promise<string>, url: string) {
    const idToken = await getAccessTokenSilently();
    const credsResponse = await getAWSCredentials(idToken);
    if (!credsResponse.Credentials?.AccessKeyId || !credsResponse.Credentials?.SecretKey || !credsResponse.Credentials?.SessionToken) {
        throw new Error("Failed to get credentials");
    }
    const client = getS3ClientFromCredentials(credsResponse);
    const { hostname, pathname } = new URL(url);
    const command = new GetObjectCommand({
        Bucket: hostname.replace(/\..*/, ''),
        Key: pathname.slice(1),
    });
    return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function postPhotos(
    getAccessTokenSilently: () => Promise<string>,
    fileList: File[], copyright: string, email: string, id: number, albumKey: string | undefined, setProgress: { (value: SetStateAction<number>): void; (arg0: any): void; }) {
    if (fileList?.length > 0) {
        try {
            const idToken = await getAccessTokenSilently();
            const credsResponse = await getAWSCredentials(idToken);
            if (!credsResponse.Credentials?.AccessKeyId || !credsResponse.Credentials?.SecretKey || !credsResponse.Credentials?.SessionToken) {
                throw new Error("Failed to get credentials");
            }
            const client = getS3ClientFromCredentials(credsResponse);
            const x = fileList.map((file) => ({ uuid: uuidv4(), file }));
            const uploads = x.map(({ file, uuid }) => {
                const params: any = {
                    Bucket: 'boatregister-upload',
                    Key: `${email}/${file.name}`,
                    ContentType: file.type,
                    Body: file,
                };
                if (albumKey) {
                    params.Metadata = { albumKey, copyright };
                } else {
                    params.Metadata = { uuid, id: `${id}` }
                }
                // console.log('P', params);
                const upload = new Upload({ client, params });
                upload.on("httpUploadProgress", (progress: any) => {
                    const p = Math.ceil(100 * (progress.loaded / progress.total));
                    // console.log('progress', p, progress);
                    setProgress(p);
                });
                return { uuid, contentType: file.type };
            });
            const p = await Promise.allSettled(uploads);
            const fullfilled = p.filter((u) => u.status === 'fulfilled');
            return fullfilled.map((u: any) => u?.value);
        } catch (e) {
            // console.log(e);
        }
    }
    return undefined;
}