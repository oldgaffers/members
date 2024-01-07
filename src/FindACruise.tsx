import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Stack, Typography } from '@mui/material';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import RoleRestricted from './RoleRestricted.tsx';
import { CrewCards } from './CrewCards.tsx';
import AYearOfEvents from './AYearOfEvents.tsx';
import { VoyageCards } from './VoyageCards.tsx';
import LoginButton from './LoginButton.tsx';

export default function FindACruise() {
  return (
    <Stack spacing={1}>
      <LoginButton />
      <Typography>Looking for cruising or racing adventures?</Typography>
      <Typography>Go to your member page to create your crewing profile.</Typography>
      <Typography variant='h6'>
        Here is our current list of voyages.
      </Typography><Typography>
        Click on a voyage
        to find out more.
      </Typography>
      <AYearOfEvents />
      <Box border={1}>
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandCircleDownIcon />}>
            <Typography>click the arrow to see all the voyages as cards</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <VoyageCards />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Divider />
      <Typography variant='h6'>
        Here are the other members who have created a crew profile.
      </Typography>
      <Typography>
        You will notice that some of these are not current members of the association.
        They are here to test the functionality for us.
      </Typography>
      <RoleRestricted role="member">
        <CrewCards contactEnabled={true} inviteEnabled={false} />
      </RoleRestricted>
    </Stack>
  );
}
