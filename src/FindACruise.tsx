import { CircularProgress, Stack, Typography } from '@mui/material';
import { SuggestLogin } from './LoginButton.tsx';
import RoleRestricted from './RoleRestricted.tsx';
import { useMembers } from './Members.tsx';
import MyCalendar from './Calendar.tsx';
import { CrewCards } from './FindCrew.tsx';

export default function FindACruise() {
  const { loading, data } = useMembers(true, true, true);

  if (loading) {
    return <CircularProgress />;
  }

  const { members } = data;

  return (
    <Stack spacing={1}>
      <Typography>Looking for cruising or racing adventures?</Typography>
      <Typography>Create a crewing profile and browse our offers.</Typography>
      <Typography>
        Here is our current event list.
        Add to it, or add your boat or yourself to an existing event
      </Typography>
      <MyCalendar />
      <Typography>Here are the other members who have created a crew profile.</Typography>
      <RoleRestricted role="member">
        <CrewCards members={members} contactEnabled={true} inviteEnabled={false} />
      </RoleRestricted>
    </Stack>
  );
}
