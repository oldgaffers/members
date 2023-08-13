import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';
import { gql, useQuery } from '@apollo/client';
import { SuggestLogin } from './loginbutton';
import RoleRestricted from './rolerestrictedcomponent';
import { memberPredicate } from '../membership';
import { useAuth0 } from '@auth0/auth0-react';
import MembersAndBoats from './MembersAndBoats';
import membersBoats from './membersBoats';

function MembersList() {
  const [excludeNotPaid, setExcludeNotPaid] = useState(false);
  const [excludeNoConsent, setExcludeNoConsent] = useState(true);
  const { user } = useAuth0();

  const roles = user['https://oga.org.uk/roles'];
  const memberNo = user['https://oga.org.uk/member'];

  const membersResult = useQuery(gql`query members { members { 
    salutation firstname lastname member id GDPR 
    status telephone mobile town area interests smallboats
   } }`);

  const boats = [];
  if (membersResult.loading) {
    return <CircularProgress />;
  }

  if (membersResult.error) {
    return (<div>{JSON.stringify(membersResult.error)}</div>);
  }

  const { members } = membersResult.data;
  const ybmembers = members.filter((m) => memberPredicate(m.id, m, excludeNotPaid, excludeNoConsent));

  const wboats = membersBoats(boats, ybmembers);

  const handleNotPaidSwitchChange = (event, newValue) => {
    setExcludeNotPaid(newValue);
  }

  const handleNoConsentSwitchChange = (event, newValue) => {
    setExcludeNoConsent(newValue);
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant='h6'>Hi {user.name} ({memberNo}).</Typography>
        <FormGroup>
          {roles.includes['editor'] ? <FormControlLabel control={<Switch onChange={handleNotPaidSwitchChange} checked={excludeNotPaid} />} label="Exclude not paid" /> : ''}
          {roles.includes['editor'] ? <FormControlLabel control={<Switch onChange={handleNoConsentSwitchChange} checked={excludeNoConsent} />} label="Exclude no Consent" /> : ''}
        </FormGroup>
      </Box>
      <MembersAndBoats members={ybmembers} boats={wboats} />
    </Box>
  );
}

export default function Members() {
  return <>
    <SuggestLogin />
    <RoleRestricted role='member'><MembersList /></RoleRestricted>
  </>
    ;
}