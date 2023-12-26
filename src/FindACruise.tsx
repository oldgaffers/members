import { Stack, Typography } from '@mui/material';
import RoleRestricted from './RoleRestricted.tsx';
import { CrewCards } from './CrewCards.tsx';
import AYearOfEvents from './AYearOfEvents.tsx';

export default function FindACruise() {
  return (
    <Stack spacing={1}>
      <Typography>Looking for cruising or racing adventures?</Typography>
      <Typography>Go to your member page to create your crewing profile.</Typography>
      <Typography>
        Here is our current list of voyages.
      </Typography>
      <AYearOfEvents />
      <Typography>Here are the other members who have created a crew profile.</Typography>
      <RoleRestricted role="member">
        <CrewCards contactEnabled={true} inviteEnabled={false} />
      </RoleRestricted>
    </Stack>
  );
}
