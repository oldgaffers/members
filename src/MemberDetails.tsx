import { Stack } from '@mui/system';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box, Checkbox, FormControlLabel, FormGroup, FormLabel, MenuItem, Select, Typography,
} from '@mui/material';
import { emailIndication, infoOrEmpty, membershipType } from './lib/utils.mts';
import { Member } from './lib/membership.mts';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

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

export default function Interests({ user, members, onChange }: InterestsProps) {

  const handleCheckChange = (a: unknown, checked: boolean) => {
    const s = new Set(user.interests);
    if (checked) {
      s.add(a);
    } else {
      s.delete(a);
    }
    onChange({...user, interests: [...s]});
  };

  const handleChangePrimaryArea = (_a: any, { props }: any) => {
    onChange({...user, area: props.value});
  };

  const thePrimaryMember = () => {
    const p = members.find((m) => m.primary);
    if (p) {
      return `${p.firstname} ${p.lastname}`;
    }
    return 'none of the members in this membership seem to be the primary member';
  }

  return (
    <Stack spacing={1}>
      <Typography>
        Your membership !number is
        {' '}
        {user.member}
        .
        You have been a member since
        {' '}
        {user.start}
        .
      </Typography>
      <Typography>
        {emailIndication(user)}
      </Typography>
      <Typography>
        {(user.primary)
          ? `You are the 'primary' member in this membership.
                          Gaffers Log will be sent to you.`
          : `You are not the 'primary' member in this membership.
                          Gaffers Log will be sent to ${thePrimaryMember()}`}

      </Typography>
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
        {user.address.filter((line: string) => line.trim() !== '').map((line: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined) => (
          <Typography>
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
        <Typography>
          If you check the Younger Gaffers box,
          you will be told about activities for younger members in all areas.
        </Typography>
        <FormControlLabel
          control={
            <Checkbox checked={user.younggaffer} onChange={(_, checked) => onChange({...user, youngaffer: checked})} />
                    }
          label="Younger Gaffers"
        />
        <Typography variant="body2">
          Younger Gaffers is a new interest section, not a membership category.
          Junior Membership is available to people under 25
          who want to be members in their own right.
        </Typography>
        <Typography variant="body2">
          Younger Gaffers might be junior members, family members or full members.
        </Typography>
        <Typography variant="body2">
          A Facebook group has been set up for Younger Gaffers to join and meet fellow
          members as well as have honest peer to peer discussions –
          just search for 'OGA Younger Members'.
        </Typography>
        <Typography>
          If you check the small boats box,
          you will be told about events for small boats in all areas
        </Typography>
        <FormControlLabel
          control={
            <Checkbox checked={user.smallboats} onChange={(_, checked) => onChange({...user, smallboats: checked})} />
                    }
          label="Small boats"
        />
      </FormGroup>
      <FormGroup>
        <FormLabel sx={{ marginTop: 1 }}>Primary Area</FormLabel>
        <Typography>
          Your primary area will receive a portion of your membership fee.
        </Typography>
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
                  .map((area) => (<MenuItem value={area.label}>{area.label}</MenuItem>))}
              </Select>
)}
          />
        </Box>
        <Typography>
          If your primary area is not a funded area, then your full fee will be held centrally.
        </Typography>
        <Typography>
          The unfunded areas are currently
          {areas.filter((a) => !a.funded).map((a) => a.label).join(', ')}
        </Typography>
      </FormGroup>
      <FormGroup>
        <FormLabel sx={{ marginTop: 1 }}>Areas</FormLabel>
        <Typography>You will receive updates for checked areas</Typography>
        <Grid container>
          {areas.map((area) => (
            <Grid item xs={3} key={area.label}>
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
