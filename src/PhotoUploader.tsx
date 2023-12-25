import { SetStateAction, useState } from "react";
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth0 } from "@auth0/auth0-react";
import { postPhotos } from "./lib/postphotos";
import Photodrop from './PhotoDrop';
import { CircularProgress } from "@mui/material";

export default function PhotoUploader() {
  const { user } = useAuth0();
  const [pictures, setPictures] = useState([]);
  const [copyright, setCopyright] = useState(''); // user && user.name);
  const [progress, setProgress] = useState(0);

  const onDrop = (p: SetStateAction<never[]>) => {
    setPictures(p);
  };

  const onUpload = async () => {
    await postPhotos(pictures, copyright, user?.email || '', undefined, setProgress);
  };

  const ready = () => {
    if (pictures.length === 0) return false;
    if (!user?.email) return false;
    if (!copyright) return false;
    return true;
  };

  return (
    <>
      <Typography variant="h5">
        Add pictures
      </Typography>
      <Photodrop onDrop={onDrop} />
      <Stack direction='row' spacing={1}>
      <TextField
        value={copyright}
        required={true}
        type="text"
        label="Copyright Owner"
        onChange={(e) => setCopyright(e.target.value)}
      />
        <Button
          disabled={!ready()}
          size="small"
          color="primary"
          variant="contained"
          onClick={onUpload}
        >
          Upload
        </Button>
        <CircularProgress variant="determinate" value={progress} />
      </Stack>
    </>
  );
}
