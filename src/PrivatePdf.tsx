import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromCognitoIdentity } from "@aws-sdk/credential-providers";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getUploadCredentials } from './lib/boatregister-api.mjs';
import RoleRestricted from "./RoleRestricted";
import LoginButton from './LoginButton';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export async function getPdf(name: string): Promise<Blob> {
    const { region, identityId } = await getUploadCredentials();
    const credentials = fromCognitoIdentity({ identityId, clientConfig: { region } });
    const client = new S3Client({ region, credentials });
    const command = new GetObjectCommand({
        Bucket: 'boatregister-upload',
        Key: `Gaffers Log/${name}`,
    });
    return getSignedUrl(client, command, { expiresIn: 3600 }) as Promise<unknown> as Promise<Blob>;
}

export default function PrivatePdf({ id }: { id?: string }) {
  const [doc, setDoc] = useState<Blob | undefined>();
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    const getData = async () => {
      if (id) {
        setDoc(await getPdf(id))
      }
    }
    if (!doc) {
      getData();
    }
  }, [doc, id]);

  return (
    <>
      <RoleRestricted role="member">
        {doc ? <Document file={doc} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document> : 'Loading...'}
      <p>
        Page {pageNumber} of {numPages}
      </p>
      </RoleRestricted>
      <LoginButton />
    </>
  );
}
