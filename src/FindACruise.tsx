import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Stack, Typography } from '@mui/material';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import RoleRestricted from './RoleRestricted.tsx';
import { CrewCards } from './CrewCards.tsx';
import AYearOfEvents from './AYearOfEvents.tsx';
import { VoyageCards } from './VoyageCards.tsx';
import LoginButton from './LoginButton.tsx';
import { useAuth0 } from '@auth0/auth0-react';
import Welcome from './Welcome.tsx';

function Intro() {
  const { user } = useAuth0();
  const roles = user?.['https://oga.org.uk/roles'] ?? [];
  if (roles.includes('member')) {
    return <>
      <Typography>Go to your member page to create your crewing profile.</Typography>
      <Typography variant='h6'>
        Here is our current list of voyages.
      </Typography><Typography>
        Click on a voyage
        to find out more.
      </Typography>
    </>;
  }
  return <>
    <Typography variant='h6'>
      Here is our current list of public voyages.
    </Typography><Typography>
      Click on a voyage
      to find out more.
    </Typography>
    <Typography>Logged in members will get to see more voyages</Typography>
  </>;

}

export default function FindACruise() {
  return (
    <Stack spacing={1}>
      <Box width={100} minWidth={200}>
      <LoginButton />
      <Welcome />
      </Box>
      <Typography>Looking for cruising or racing adventures?</Typography>
      <Intro />
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
      <RoleRestricted role="member">
        <CrewCards contactEnabled={true} inviteEnabled={false} />
      </RoleRestricted>
    </Stack>
  );
}
