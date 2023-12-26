import { useAuth0 } from "@auth0/auth0-react";
import { Stack, Typography } from '@mui/material';
// import MyCalendar from './Calendar';
import EventForm from './EventForm';
import { postScopedData } from './lib/api.mts';
import AYearOfEvents from "./AYearOfEvents";
import RoleRestricted from "./RoleRestricted";

export default function FindCrew() {
  const { getAccessTokenSilently } = useAuth0();
  const handleCreate = (event: any) => {
    // console.log('handleCreate', event);
    if (event.visibility === 'public') {
      postScopedData('public', 'voyage', event).then(
        (answer: any) => console.log(answer),
        (reason: any) => console.log('BAD', reason),
      );
    } else {
      getAccessTokenSilently().then((token: string) => {
        postScopedData('member', 'voyage', event, token)
          .then(
            (response: any) => {
              if (response.ok) {
                console.log('ok');
              } else {
                console.log(response);
              }
            },
            (reason: any) => console.log('BAD', reason),
          );
      });
    }
  };

  return (
    <RoleRestricted role='member'>
      <Stack spacing={1}>
        <Typography>Looking for crew for your your cruising or racing adventures?</Typography>
        <Typography>
          Here is our list of voyages. When you create your voyage it will be added.
        </Typography>
        { /*<MyCalendar /> */}
        <AYearOfEvents />
        <EventForm onCreate={handleCreate} />
      </Stack>
    </RoleRestricted>
  );
}
