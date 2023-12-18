import {
  Button, CircularProgress, Stack, Typography,
} from '@mui/material';
import RoleRestricted from './RoleRestricted';
import { useMembers } from './Members';
import MyCalendar from './Calendar';
import EventForm from './EventForm';
import { Member } from './lib/membership.mts';

export type CrewCardProps = {
  member: Member
  contactEnabled: boolean
  inviteEnabled: boolean
}

export type CrewCardsProps = {
  members: Member[]
  contactEnabled: boolean
  inviteEnabled: boolean
}

export function CrewCard({ member, contactEnabled, inviteEnabled }: CrewCardProps) {
  const { firstname, lastname, crewingprofile } = member;
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

export function CrewCards({ members, contactEnabled, inviteEnabled}: CrewCardsProps) {
  return (<>{members.map((m) => <CrewCard contactEnabled={contactEnabled} inviteEnabled={inviteEnabled} key={m.id} member={m} />)}</>);
}

export default function FindCrew() {
  const { loading, data } = useMembers(true, true, true);

  const handleCreate = (event: any) => {
    console.log('handleCreate', event);
  };
  
  if (loading || data === undefined) {
    return <CircularProgress />;
  }

  const { members } = data; // .filter((m) => true); // filter out current user and current participants

  return (
    <Stack spacing={1}>
      <EventForm onCreate={handleCreate} />
      <Typography>
        Opportunities can be public, visible to members or hidden.
      </Typography>
      <Typography>
        If you make an opportunity visible, then people will be able to contact you
        to express interest in crewing.
      </Typography>
      <Typography>
        If you hide the opportunity it will be included in the text of the
        email sent to members you want to invite.
      </Typography>
      <Typography>Here are the members who have created a crew profile.</Typography>
      <RoleRestricted role="member"><CrewCards inviteEnabled contactEnabled members={members} /></RoleRestricted>
      <Typography>
        Here is our current event list. When you submit your event it will be added
      </Typography>
      <MyCalendar />
      <Typography>
        We'd also like to support Area Events. Such an event can have multiple boats attending and multiple
        people attending, either as crew or on foot. Knowing who is on which boat would be useful.
      </Typography>
      <Typography>If you allow it people will be able sign-up for your event.</Typography>
      <Typography>An event might be a rally, a race, or a cruise in company.</Typography>
    </Stack>
  );
}
