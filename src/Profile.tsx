import { useEffect, useRef, useState } from "react";
import { CircularProgress, FormControlLabel, LinearProgress, Stack, Switch, Typography } from "@mui/material";
import CrewCard from "./CrewCard";
import { Member, SailingProfile } from "./lib/membership.mts";
import { useAuth0 } from "@auth0/auth0-react";
import { DocumentNode, gql, useMutation, useQuery } from "@apollo/client";

const mutations: Record<string, DocumentNode> = {
  'skipper': gql`
mutation sp($id: Int!, $profile: ProfileInput!) {
  addSkipperProfile(id: $id, profile: $profile) { ok member { id skipper { text published pictures } } }
}`,
  'crewing': gql`
mutation crewProfileMutation($id: Int!, $profile: ProfileInput!) {
  addCrewingProfile(id: $id, profile: $profile) { ok member { id crewing { text published pictures } } }
}`
};

const MEMBER_QUERY = gql(`query members($id: Int!) {
  members(id: $id) {
    firstname lastname email
    skipper { text published pictures }
    crewing { text published pictures }
  }
}`);

export default function Profile({ profileName }: { profileName: string }) {
  const { user } = useAuth0();
  const id = user?.['https://oga.org.uk/id'];
  const [profile, setProfile] = useState<SailingProfile>({ pictures: [], published: false, text: '' });
  const [saving, setSaving] = useState<boolean>(false);
  const [member, setMember] = useState<Member | undefined>();
  const { loading, data } = useQuery(MEMBER_QUERY, { variables: { id } });
  const [addProfile] = useMutation(mutations[profileName]);
  const initialised = useRef<boolean>(false);

  function addPicture(picture: string) {
    const p = profile.pictures ?? [];
    p.unshift(picture);
    setProfile({ ...profile, pictures: p });
  }

  useEffect(() => {
    if (initialised.current) {
      const { __typename, ...p } = profile; // TODO use removeTypenameFromVariables
      setSaving(true);
      const r = addProfile({ variables: { id, profile: p } });
      r.then((re) => {
        console.log('saved', re);
        /*
        if (profileName === 'skipper') {
          setProfile(re.data.addSkipperProfile.member.skipper);
        } else {
          setProfile(re.data.addCrewingProfile.member.crewing);
        }
        */
        setSaving(false);
      });
    } else {
      initialised.current = true;
    }
    return () => { initialised.current = false; };
  }, [profile]);

  function handleSave(newText: string) {
    setProfile({ ...profile, text: newText });
  }

  function handleAddImage(url: string) {
    addPicture(url);
  }

  function handleUseAvatar(useAvatar: boolean) {
    if (user?.picture) {
      if (useAvatar && user.picture) {
        addPicture(user.picture);
      } else {
        const p = (profile.pictures ?? []).filter((p) => p !== user.picture);
        setProfile({ ...profile, pictures: p });
      }
    }
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (data && !member) {
    const m = data.members[0];
    setMember(m);
    const p = (profileName == 'skipper') ? m.skipper : m.crewing;
    if (JSON.stringify(p) !== JSON.stringify(profile)) {
      setProfile(p);
    }
  }

  return <>
    <Typography>This is your {profileName} profile card</Typography>
    <Stack direction='row' spacing={2} >
      <CrewCard
        name={`${member?.firstname} ${member?.lastname}`}
        goldId={id}
        email={member?.email ?? ''}
        profile={profile}
        editEnabled={true}
        onSaveProfile={handleSave}
        onAddImage={handleAddImage}
        onDeleteImage={() => setProfile({ ...profile, pictures: [] })}
        onUseAvatar={(value: boolean) => handleUseAvatar(value)}
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
    {saving ? <LinearProgress /> : ''}
  </>;
}