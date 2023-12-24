import { SetStateAction, useState } from "react";
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth0 } from "@auth0/auth0-react";
import { postPhotos } from "./lib/postphotos";
import { createPhotoAlbum } from './lib/api.mjs';
import Photodrop from './PhotoDrop';
import { CircularProgress } from "@mui/material";
import { Member } from "./lib/membership.mts";

type PhotoUploaderProps = {
  member: Member
  onNewAlbum: Function
}

export default function PhotoUploader(props: PhotoUploaderProps) {
  const { member, onNewAlbum } = props;
  const { user } = useAuth0();
  const [pictures, setPictures] = useState([]);
  const [copyright, setCopyright] = useState(''); // user && user.name);
  const [progress, setProgress] = useState(0);

  const onDrop = (p: SetStateAction<never[]>) => {
    setPictures(p);
  };

  const onUpload = async () => {
    const { image_key, id } = member;
    let albumKey;
    if (image_key) {
      albumKey = image_key;
    } else {
      const r = await createPhotoAlbum(`${member.firstname} ${member.lastname}`, id);
      albumKey = r.albumKey;
    }
    await postPhotos(pictures, copyright, user?.email || '', albumKey, setProgress);
    onNewAlbum(albumKey);
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
