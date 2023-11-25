import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import React from 'react';
import { SuggestLogin } from './LoginButton';
import RoleRestricted from './RoleRestricted';
import { useMembers } from './Members';

export function CrewCard({ member }) {
  const {
    firstname, lastname, telephone, mobile, crewingprofile,
  } = member;
  return (
    <Stack direction="row" spacing={2}>
      <Typography>
        {firstname}
        {' '}
        {lastname}
      </Typography>
      <Typography
        component="div"
        dangerouslySetInnerHTML={{ __html: crewingprofile.trim() }}
      />
      <Button>Add to Invite</Button>
      <Button>Contact</Button>
    </Stack>
  );
}

export function CrewCards({ members }) {
  return (<>{members.map((m) => <CrewCard key={m.id} member={m} />)}</>);
}

export default function FindCrew() {
  const { loading, error, data } = useMembers(true, true, true);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (<div>{JSON.stringify(error)}</div>);
  }

  const { members } = data;

  return (
    <Stack spacing={1}>
      <SuggestLogin />
      <Typography>Looking for crew for your your cruising or racing adventures?</Typography>
      <Typography>Create a crewing opportunity here.</Typography>
      <Typography>Specify dates and locations and link to the boat.</Typography>
      <Typography>
        Opportunities can be public, visible to members or hidden.
      </Typography>
      <Typography>
        If you make an opportunity visible, then people will be able to contact you
        to express interest in crewing.
      </Typography>
      <Typography>
        If you hide the opportunity it will be included in the text of the
        email sent to members you want to invite.
      </Typography>
      <Typography>Here are the members who have created a crew profile.</Typography>
      <RoleRestricted role="member"><CrewCards members={members} /></RoleRestricted>
    </Stack>
  );
}
