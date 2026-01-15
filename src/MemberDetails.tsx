import { Stack } from '@mui/system';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box, Checkbox, FormControlLabel, FormGroup, FormLabel, MenuItem, Select, Typography,
} from '@mui/material';
import { emailIndication, infoOrEmpty, membershipType } from './lib/utils.mts';
import { Member } from './lib/membership.mts';

const areas = [
  { label: 'Bristol Channel', value: 'BC', funded: true },
  { label: 'Dublin Bay', value: 'DB', funded: true },
  { label: 'East Coast', value: 'EC', funded: true },
  { label: 'North East', value: 'NE', funded: true },
  { label: 'North Wales', value: 'NWa', funded: true },
  { label: 'North West', value: 'NW', funded: true },
  { label: 'Scotland', value: 'SC', funded: true },
  { label: 'Solent', value: 'SO', funded: true },
  { label: 'South West', value: 'SW', funded: true },
  { label: 'The Americas', value: 'AM', funded: false },
  { label: 'Continental Europe', value: 'EU', funded: false },
  { label: 'Rest of World', value: 'RW', funded: false },
];

type InterestsProps = {
  user: any
  members: Member[]
  onChange: Function
}

function MembershipStart({ user }: { user: any }) {
  if (user?.start) {
    return `You have been a member since ${user.start}.`;
  }
  return "We don't have a record of when you joined.";
}

function unfunded(areas: { label: string; value: string; funded: boolean; }[]) {
  const most = areas.filter((a) => !a.funded);
  if (most.length === 1) return most[0].label;
  const last = most.pop();
  const front = most.map((a) => a.label).join(', ');
  return [front, last?.label].join(' and ');
}

function GaffersLog({ member, members }: { member: Member; members: Member[] }) {

  const thePrimaryMember = () => {
    const p = members.find((m) => m.primary);
    if (p) {
      return `${p.firstname} ${p.lastname}`;
    }
    return 'none of the members in this membership seem to be the primary member';
  }

  if (member.status === 'Not Renewing') {
    return <Typography>
      As you are not renewing your membership, you will not receive further issues of Gaffers Log.
    </Typography>
  }
  if (member.primary) {
    return <Typography>
      You are the 'primary' member in this membership.
      Gaffers Log will be sent to you.
    </Typography>
  }
  return <Typography>
    You are not the 'primary' member in this membership.
    Gaffers Log will be sent to {thePrimaryMember()}
  </Typography>
}

export default function Interests({ user, members, onChange }: InterestsProps) {

  const handleCheckChange = (a: unknown, checked: boolean) => {
    const s = new Set(user.interests);
    if (checked) {
      s.add(a);
    } else {
      s.delete(a);
    }
    onChange({ ...user, interests: [...s] });
  };

  const handleChangePrimaryArea = (_a: any, { props }: any) => {
    onChange({ ...user, area: props.value });
  };

  return (
    <Stack spacing={1}>
      <Typography>
        Hi {user.firstname}, your membership number is
        {' '}
        {user.member}
        .{' '}
        <MembershipStart user={user} />
      </Typography>
      <Typography>
        {emailIndication(user)}
      </Typography>
      <GaffersLog member={user} members={members} />
      <Typography>
        Your postal address is recorded as
      </Typography>
      <Stack paddingLeft={2}>
        <Typography>
          {user.salutation}
          {' '}
          {user.firstname}
          {' '}
          {user.lastname}
        </Typography>
        {user.address.filter((line: string) => line.trim() !== '').map((line: any) => (
          <Typography key={line}>
            {line}
            ,
          </Typography>
        ))}
        <Typography>
          {user.town}
          ,
        </Typography>
        <Typography>
          {user.postcode}
          ,
        </Typography>
        <Typography>{user.country}</Typography>
      </Stack>
      <Typography>{infoOrEmpty('landline', user.telephone)}</Typography>
      <Typography>{infoOrEmpty('mobile number', user.mobile)}</Typography>
      <Typography>{membershipType(user)}</Typography>
      <FormGroup>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox checked={user.smallboats} onChange={(_, checked) => onChange({ ...user, smallboats: checked })} />
            }
            label="Small boats"
          />
          <Box>
            <Typography variant="body2">
              If you check the small boats box,
              you will be told about events for small boats in all areas
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Checkbox checked={user.youngermember} onChange={(_, checked) => onChange({ ...user, youngermember: checked })} />
            }
            label="Younger Members"
          />
          <Box>
            <Typography variant="body2">
              Younger Members is an interest section for members between 18 and 35.
              We also have a Junior Membership category with reduced fees for people under 25
              who want to be members in their own right.
            </Typography>
            <Typography variant="body2">
              Younger Members might be junior members, family members or full members.
            </Typography>
            <Typography variant="body2">
              A Facebook group has been set up for Younger Members to join and meet fellow
              members as well as have honest peer to peer discussions –
              just search on Facebook for 'OGA Younger Members'.
            </Typography>
            <Typography variant="body2">
              The Younger Members area of the website can be found under the Areas menu.
            </Typography>
          </Box>
          <Box>
            <FormControlLabel
              label="Primary Area: "
              labelPlacement="start"
              control={(
                <Select
                  value={user.area}
                  label="Primary Area"
                  onChange={handleChangePrimaryArea}
                >
                  {areas
                    .map((area) => (<MenuItem key={area.label} value={area.label}>{area.label}</MenuItem>))}
                </Select>
              )}
            />
          </Box>
          <Box>
            <Typography>
              Your primary area will receive a portion of your membership fee.
            </Typography>
            <Typography>
              If your primary area is not a funded area, then your full fee will be held centrally.
            </Typography>
            <Typography>
              The unfunded areas are currently
              {unfunded(areas)}
            </Typography>
          </Box>
        </Box>
      </FormGroup>
      <FormGroup>
        <FormLabel sx={{ marginTop: 1 }}>Areas</FormLabel>
        <Typography>You will receive updates for checked areas</Typography>
        <Grid container>
          {areas.map((area) => (
            <Grid xs={3} key={area.label}>
              <FormControlLabel
                label={area.label}
                control={(
                  <Checkbox
                    checked={user.interests.includes(area.value) || area.label === user.area}
                    disabled={area.label === user.area}
                    onChange={(event) => handleCheckChange(area.value, event.target.checked)}
                  />
                )}
              />
            </Grid>
          ))}
        </Grid>
      </FormGroup>
    </Stack>
  );
}
