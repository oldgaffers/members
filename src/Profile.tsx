import { useEffect, useState } from "react";
import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import CrewCard from "./CrewCard";
import { Member, SailingProfile } from "./lib/membership.mts";
import { User } from "@auth0/auth0-react";

interface ProfileProps {
  member: Member,
  profileName: string,
  user: User
  onUpdate: Function
}

export default function Profile({ member, profileName, user, onUpdate }: ProfileProps) {
  const initialProfile: SailingProfile = ((profileName === 'skipper') ? member.skipper : member.crewing) ?? {
    published: false,
    text: '',
    pictures: [],
  };
  const [useAvatar, setUseAvatar] = useState<boolean>(false);
  const [profile, setProfile] = useState<SailingProfile>(initialProfile);

  function addPicture(picture: string) {
    console.log('addPicture', picture);
    const p = profile.pictures ?? [];
    p.unshift(picture);
    setProfile({ ...profile, pictures: p});
  }

  useEffect(() => {
    // this if prevents onUpdate being called on first render
    if (JSON.stringify(profile) !== JSON.stringify(initialProfile)) {
      onUpdate(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (useAvatar && user.picture) {
      addPicture(user.picture);
    } else {
      const p = (profile.pictures ?? []).filter((p) => p !== user.picture);
      setProfile({ ...profile, pictures: p });
    }
  }, [useAvatar]);

  function handleSave(newText: string) {
    setProfile({ ...profile, text: newText });
  }

  function handleAddImage(url: string) {
    addPicture(url);
  }

  return <>
    <Typography>This is your {profileName} profile card</Typography>
    <Stack direction='row' spacing={2} >
      <CrewCard
        name={`${member.firstname} ${member.lastname}`}
        goldId={member.id}
        email={member.email ?? ''}
        profile={profile}
        editEnabled={true}
        onSaveProfile={handleSave}
        onAddImage={handleAddImage}
        onDeleteImage={() => setProfile({ ...profile, pictures: []})}
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
        <FormControlLabel control={<Switch checked={profile.published} onChange={(e) => setProfile({ ...profile, published: e.target.checked })} />} label="Published" />
      </Stack>
    </Stack>
  </>;
}