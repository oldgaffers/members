import { User, useAuth0 } from "@auth0/auth0-react";
import { Stack, Typography } from '@mui/material';
// import MyCalendar from './Calendar';
import EventForm from './EventForm';
import { postGeneralEnquiry, postScopedData } from './lib/api.mts';
import AYearOfEvents from "./AYearOfEvents";
import RoleRestricted from "./RoleRestricted";
import { Voyage, voyageInvitationBody } from "./VoyageCard";
import { Member } from "./lib/membership.mts";
import LoginButton from "./LoginButton";
import Welcome from "./Welcome";

// compose the email
// send the email with the members as bcc and the organiser as from
// return the crews object which will include that they have been invited
// in the future, we need to support non-member crew.
async function processCrewInvitations(voyage: Voyage, invited: Member[], organiser: User): Promise<any[]> {
  const organiserName = `${organiser.given_name} ${organiser.family_name}`;
  const message = voyageInvitationBody(voyage, organiserName, organiser.email ?? '');
  const invitedEmails = invited.map((m) => `${m.firstname} ${m.lastname} <${m.email}>`);
  const data = {
    'reply-to': `${organiserName} <${organiser.email}>`,
    bcc: invitedEmails,
    subject: 'Crewing invitation from an OGA Member',
    message,
  };
  await postGeneralEnquiry('public', 'crew', data);
  const id = new Date().toISOString();
  return invited.map((m) => ({  // we can add or remove fields here.
    invited: id,
    firstname: m.firstname,
    lastname: m.lastname,
    id: m.id,
    member: m.member,
    email: m.email,
  }));
}

async function createOrUpdateVoyage(voyage: Voyage, getAccessTokenSilently: Function) {
  if (voyage.visibility === 'public') {
    postScopedData('public', 'voyage', voyage).then(
      (answer: any) => console.log(answer),
      (reason: any) => console.log('BAD', reason),
    );
  } else {
    getAccessTokenSilently().then((token: string) => {
      postScopedData('member', 'voyage', voyage, token)
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
}

export default function FindCrew() {
  const { user, getAccessTokenSilently } = useAuth0();
  const handleCreate = (voyage: Voyage, invites: Member[]) => {
    // console.log('handleCreate', voyage, invites);
    if (user) {
      processCrewInvitations(voyage, invites, user).then((crew: any) => {
        createOrUpdateVoyage({ ...voyage, crew }, getAccessTokenSilently);
      });
    }
  };

  return (
    <>
    <LoginButton />
    <Welcome />
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
    </>
  );
}
