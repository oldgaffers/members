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
        Here is our current list of voyages. This is a work in-progress. You'll soon be able to click on a voyage
        to find out more.
      </Typography>
      <AYearOfEvents />
      <Typography>
        Here are the other members who have created a crew profile.
        You will notice that some of these are not current members of the association.
        They are here to test the functionality for us.
      </Typography>
      <RoleRestricted role="member">
        <CrewCards contactEnabled={true} inviteEnabled={false} />
      </RoleRestricted>
    </Stack>
  );
}
