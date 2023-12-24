import { useAuth0 } from "@auth0/auth0-react";
import { CircularProgress, Stack, Typography } from '@mui/material';
import RoleRestricted from './RoleRestricted';
import { useMembers } from './Members';
// import MyCalendar from './Calendar';
import EventForm from './EventForm';
import { Member } from './lib/membership.mts';
import { postScopedData } from './lib/api.mts';
import AYearOfEvents from "./AYearOfEvents";
import CrewCard from "./CrewCard";

export type CrewCardsProps = {
  members: Member[]
  contactEnabled: boolean
  inviteEnabled: boolean
}

export function CrewCards({ members, contactEnabled, inviteEnabled}: CrewCardsProps) {
  console.log('CrewCards', members);
  return (<>{members.map((m) => <CrewCard contactEnabled={contactEnabled} inviteEnabled={inviteEnabled} key={m.id} member={m} />)}</>);
}

export default function FindCrew() {
  const { loading, data } = useMembers(false, true, true); // don't exclude not paid at this time of the year
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
  
  if (loading || data === undefined) {
    return <CircularProgress />;
  }

  const { members } = data; // .filter((m) => true); // filter out current user and current participants
  return (
    <Stack spacing={1}>
      <Typography>Here are the members who have created a crew profile.</Typography>
      <RoleRestricted role="member"><CrewCards inviteEnabled contactEnabled members={members} /></RoleRestricted>
      <Typography>
        Here is our current event list. When you submit your event it will be added
      </Typography>
      { /*<MyCalendar /> */}
      <AYearOfEvents />
      <EventForm onCreate={handleCreate} />
      <Typography>
        We'd also like to support Area Events. Such an event can have multiple boats attending and multiple
        people attending, either as crew or on foot. Knowing who is on which boat would be useful.
      </Typography>
      <Typography>If you allow it people will be able sign-up for your event.</Typography>
      <Typography>An event might be a rally, a race, or a cruise in company.</Typography>
    </Stack>
  );
}
