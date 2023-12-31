import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useDropzone } from 'react-dropzone';

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

interface FileWithPreview {
  file: File,
  preview: string
}

function ThumbView({ file }: { file: FileWithPreview }) {
  return <Box sx={{
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
  }} key={file.file.name}>
    <Box sx={{
      display: 'flex',
      minWidth: 0,
      overflow: 'hidden'
    }}>
      <img
        alt=''
        src={file.preview}
        style={img}
        // Revoke data uri after image is loaded
        onLoad={() => { URL.revokeObjectURL(file.preview) }}
      />
    </Box>
  </Box>
}

function addPreview(file: File): FileWithPreview {
  return { file, preview: URL.createObjectURL(file) }
}

export default function Photodrop({ onDrop, preview = true, maxFiles=1 }: { onDrop: Function, preview?: boolean, maxFiles?: number }) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles,
    accept: { 'image/*': [] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => setFiles([...files, ...acceptedFiles.map((file) => addPreview(file))]),
  });

  useEffect(() => {
    onDrop(files.map((f) => f.file));
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const helperText = (maxFiles==1) ? 'Drag a picture in, or click to add a file' : 'Drag some pictures in, or click to add files';

  return (
    <>
      <Box sx={{ padding: 1, borderRadius: 2, border: '1px dashed' }} {...getRootProps()}>
        <input {...getInputProps()} />
        <p>{helperText}</p>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 1,
      }}>
        {preview ? files.map((file, index) => <ThumbView key={index} file={file} />) : ''}
      </Box>
    </>
  );
}