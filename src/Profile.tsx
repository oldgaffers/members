import { useState } from "react";
import { FormControlLabel, LinearProgress, Stack, Switch, Typography } from "@mui/material";
import CrewCard from "./CrewCard";
import { Member } from "./lib/membership.mts";
import { postPhotos } from "./lib/postphotos";
import Photodrop from "./PhotoDrop";

export default function Profile({ member, profile, user }: { member: Member, profile: string, user: any }) {
    const [useAvatar, setUseAvatar] = useState<boolean>(!!user.picture);
    const [publish, setPublish] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);
  
    function handleSave(profile: string, text: string) {
      console.log('handleSave', profile, text);
      alert('not done');
    }
  
    const m = { ...member, pictures: [] as string[] };
    if (useAvatar) {
      m.pictures.push(user.picture);
    }
  
    function onDrop(files: File[]) {
      console.log('ondrop', files);
      setUploading(true);
      postPhotos(files, '', member.email ?? '', undefined, setProgress).then(
        () => {
          console.log('uploaded');
          setUploading(false);
        }
    );
    }
  
    return <>
      <Typography>This is your {profile} profile card</Typography>
      <Stack direction='row' spacing={2} >
        <CrewCard member={m} profile={profile} editEnabled={true} onSaveProfile={handleSave} />
        <Stack>
          <Typography>You can customise your card by adding and removing pictures and editing the text.
            Your profile can be saved but won't be visible until it is published.
            If you have a profile picture associated with your login, you can use that, or you can add additional pictures.
            You can favourite a single picture to represent you on the card or have a selection as a gallery.
          </Typography>
          <FormControlLabel control={<Switch checked={useAvatar} onChange={(e) => setUseAvatar(e.target.checked)} />} label="Use my login picture" />
          <Photodrop onDrop={onDrop} preview={false} />
          {uploading ? <LinearProgress value={progress}/> : ''}
          <Typography>Edit the text by clicking on the edit button above the text. Save the changes or cancel using the tick and cross
            buttons that appear during editing.</Typography>
            <FormControlLabel control={<Switch checked={publish} onChange={(e) => setPublish(e.target.checked)} />} label="Published" />
        </Stack>
      </Stack>
    </>;
  }