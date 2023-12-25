import { useAuth0 } from "@auth0/auth0-react";
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
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

export function CrewCards({ members, contactEnabled, inviteEnabled }: CrewCardsProps) {
  console.log('CrewCards', members);
  const m = [...members];
  m.push(...[
    {
      id: -1,
      firstname: 'James',
      lastname: 'Turner',
      crewingprofile: 'AkA Captain Flint',
    },
    {
      id: -2,
      firstname: 'Missee',
      lastname: 'Lee',
      crewingprofile: 'She\'s really good at latin. Experienced at sailing Junk rigged vessels.',
    },
    {
      id: -3,
      firstname: 'Jack',
      lastname: 'Sparrow',
      crewingprofile: 'He can be treacherous and survives mostly by using wit and negotiation rather than by force, opting to flee most dangerous situations and to fight only when necessary.',
      pictures: ['https://www.disneyfanatic.com/wp-content/uploads/2023/10/jim-carrey-replace-johnny-depp--620x330.jpg']
    },
    {
      id: -4,
      firstname: 'Peggy',
      lastname: 'Blacket',
      crewingprofile: 'You need her in your crew',
    },
    {
      id: -5,
      firstname: 'Titty',
      lastname: 'Walker',
      crewingprofile: 'Able Seaman of the Swallow.',
    },
    {
      id: -6,
      firstname: 'Dick',
      lastname: 'Callum',
      crewingprofile: 'Astronomer, scientist, naturalist and master of the Scarab.',
    },
    {
      id: -7,
      firstname: 'Dorothea',
      lastname: 'Callum',
      crewingprofile: 'Sailing and adventure do not come naturally to her but her loyalty and bravery make her worth having on-board.',
    }
  ]);
  return (
    <Box overflow='auto' width='90vw'>
      <Stack direction='row'>{m.map((m) => <CrewCard key={m.id} contactEnabled={contactEnabled} inviteEnabled={inviteEnabled} member={m} />)}</Stack>
    </Box>
  );
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
