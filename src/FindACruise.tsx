import {
  Button, CircularProgress, Stack, Typography,
} from '@mui/material';
import { SuggestLogin } from './LoginButton.tsx';
import RoleRestricted from './RoleRestricted.tsx';
import { useMembers } from './Members.tsx';
import MyCalendar from './Calendar.tsx';

export function CrewCard({ member, contactEnabled, inviteEnabled }) {
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
      <Button disabled={!inviteEnabled}>Add to Invite</Button>
      <Button disabled={!contactEnabled}>Contact</Button>
    </Stack>
  );
}

export function CrewCards({ members, contactEnabled, inviteEnabled}) {
  return (<>{members.map((m) => <CrewCard contactEnabled inviteEnabled key={m.id} member={m} />)}</>);
}

export default function FindACruise() {
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
      <Typography>Looking for cruising or racing adventures?</Typography>
      <Typography>Create a crewing profile and browse our offers.</Typography>
      <Typography>
        Here is our current event list.
        Add to it, or add your boat or yourself to an existing event
      </Typography>
      <MyCalendar />
      <Typography>Here are the other members who have created a crew profile.</Typography>
      <RoleRestricted role="member"><CrewCards members={members} contactEnabled /></RoleRestricted>
    </Stack>
  );
}
