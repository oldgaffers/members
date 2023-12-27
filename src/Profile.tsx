import { useEffect, useState } from "react";
import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import CrewCard from "./CrewCard";
import { Member } from "./lib/membership.mts";
import { User } from "@auth0/auth0-react";

interface ProfileProps {
  member: Member,
  profile: string,
  user: User
  onUpdate: Function
}

export default function Profile({ member, profile, user, onUpdate }: ProfileProps) {
    const [useAvatar, setUseAvatar] = useState<boolean>(!!user.picture);
    const [publish, setPublish] = useState<boolean>(false);
    const [pictures, setPictures] = useState<string[]>(member.pictures ?? []);

    useEffect(() => {
      console.log('picture update')
      onUpdate({
        profile,
        pictures,
        publish
      })
    }, [pictures, profile, publish]);
  
    useEffect(() => {
      if (useAvatar && user.picture) {
        setPictures([user.picture, ...pictures])
      } else {
        setPictures(member.pictures ?? []);
      }
    }, [useAvatar]);
  
    function handleSave(profile: string, text: string) {
      console.log('handleSave', profile, text);
      onUpdate({
        text,
        pictures,
        publish
      })
    }
  
    function handleAddImage(url: string) {
      setPictures([url]);
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
          onAddImage={handleAddImage}
          onDeleteImage={() => setPictures([])}
          onUseAvatar={(value: boolean) => setUseAvatar(value)}
        />
        <Stack>
          <Typography>You can customise your card with an optional picture and your choice of text.</Typography>
          <Typography>
            Your profile can be saved but won't be visible until it is published.
          </Typography>
          <Typography>
            If we've picted a picture you don't like, or you don't want a picture, just click on the
            rubbish bin.
          </Typography>
          <Typography>Edit the text by clicking on the edit button above the text. Save the changes or cancel using the tick and cross
            buttons that appear during editing.</Typography>
            <FormControlLabel control={<Switch checked={publish} onChange={(e) => setPublish(e.target.checked)} />} label="Published" />
        </Stack>
      </Stack>
    </>;
  }