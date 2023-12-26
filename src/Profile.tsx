import { useEffect, useState } from "react";
import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import CrewCard from "./CrewCard";
import { Member } from "./lib/membership.mts";

export default function Profile({ member, profile, user }: { member: Member, profile: string, user: any }) {
    const [useAvatar, setUseAvatar] = useState<boolean>(!!user.picture);
    const [publish, setPublish] = useState<boolean>(false);
    const [pictures, setPictures] = useState<string[]>(member.pictures ?? []);

    useEffect(() => {
      if (useAvatar && user.picture) {
        setPictures([user.picture, ...pictures])
      } else {
        setPictures(member.pictures ?? []);
      }
    }, [useAvatar]);
  
    function handleSave(profile: string, text: string) {
      console.log('handleSave', profile, text);
      alert('not done');
    }

    const m = { ...member, pictures };

    return <>
      <Typography>This is your {profile} profile card</Typography>
      <Stack direction='row' spacing={2} >
        <CrewCard
          member={m}
          profile={profile}
          editEnabled={true}
          onSaveProfile={handleSave}
          onAddImage={(url: string) => setPictures([url])}
        />
        <Stack>
          <Typography>You can customise your card by adding and removing pictures and editing the text.
            Your profile can be saved but won't be visible until it is published.
            If you have a profile picture associated with your login, you can use that, or you can add additional pictures.
            You can favourite a single picture to represent you on the card or have a selection as a gallery.
          </Typography>
          <FormControlLabel control={<Switch checked={useAvatar} onChange={(e) => setUseAvatar(e.target.checked)} />} label="Use my login picture" />
          <Typography>Edit the text by clicking on the edit button above the text. Save the changes or cancel using the tick and cross
            buttons that appear during editing.</Typography>
            <FormControlLabel control={<Switch checked={publish} onChange={(e) => setPublish(e.target.checked)} />} label="Published" />
        </Stack>
      </Stack>
    </>;
  }