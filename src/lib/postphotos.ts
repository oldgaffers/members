import { SetStateAction } from 'react';
import { fromCognitoIdentity } from "@aws-sdk/credential-providers";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getUploadCredentials } from './api.mjs';

function allProgress(proms: any[], progress_cb: { (p: any): void; (arg0: number): void; }) {
    let d = 0;
    progress_cb(0);
    return Promise.allSettled(proms.map((p: Promise<any>) => {
        return p.then(() => {
            d++;
            progress_cb((d * 100) / proms.length);
        }).catch((err: any) => console.log(err));
    }));
}

export async function postPhotos(fileList: File[], copyright: string, email: string, albumKey: string | undefined, setProgress: { (value: SetStateAction<number>): void; (arg0: any): void; }) {
    if (fileList?.length > 0) {
        try {
            const { bucketName, region, identityId } = await getUploadCredentials();
            const credentials = fromCognitoIdentity({ identityId, clientConfig: { region } });
            const client = new S3Client({ region, credentials });
            const uploads = fileList.map((file) => {
                const params: any = {
                    Bucket: bucketName,
                    Key: `${email}/${file.name}`,
                    ContentType: file.type,
                    Body: file,
                };
                if (albumKey) {
                    params.Metadata = { albumKey, copyright };
                }
                const upload = new Upload({ client, params });
                upload.on("httpUploadProgress", (progress: any) => {
                    console.log('progress', progress);
                });
                const p = upload.done();
                return p;
            });
            const a = await allProgress(uploads, (p: any) => {
                setProgress(p);
            });
            console.log(a);
            return a;
        } catch (e) {
            // console.log(e);
        }
    }
    return undefined;
}