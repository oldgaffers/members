import { SetStateAction } from 'react';
import { fromCognitoIdentity } from "@aws-sdk/credential-providers";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getUploadCredentials } from './api.mjs';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



export async function postPhotos(fileList: File[], copyright: string, email: string, id: number, albumKey: string | undefined, setProgress: { (value: SetStateAction<number>): void; (arg0: any): void; }) {
    if (fileList?.length > 0) {
        try {
            const { bucketName, region, identityId } = await getUploadCredentials();
            const credentials = fromCognitoIdentity({ identityId, clientConfig: { region } });
            const client = new S3Client({ region, credentials });
            const x = fileList.map((file) => ({ uuid: uuidv4(), file }));
            const uploads = x.map(({file, uuid}) => {
                const params: any = {
                    Bucket: bucketName,
                    Key: `${email}/${file.name}`,
                    ContentType: file.type,
                    Body: file,
                };
                if (albumKey) {
                    params.Metadata = { albumKey, copyright };
                } else {
                    params.Metadata = { uuid, id: `${id}` }
                }
                console.log('P', params);
                const upload = new Upload({ client, params });
                upload.on("httpUploadProgress", (progress: any) => {
                    const p = Math.ceil(100 * (progress.loaded / progress.total));
                    console.log('progress', p, progress);
                    setProgress(p);
                });
                return upload.done();
            });
            await Promise.allSettled(uploads);
            const settled = await Promise.allSettled(x.map(async ({file, uuid}) => {
                const key = `${id}/${uuid}.${file.name.replace(/^.*\./, '')}`;
                const command = new GetObjectCommand({
                    Bucket: 'boatregister-public',
                    Key: key,
                });
                return getSignedUrl(client, command, { expiresIn: 3600 });
            }));
            return settled.map((r: any) => (r.value));
        } catch (e) {
            // console.log(e);
        }
    }
    return undefined;
}