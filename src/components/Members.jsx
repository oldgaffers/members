import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import {
  FormControlLabel, FormGroup, Switch, Typography,
} from '@mui/material';
import { gql, useQuery } from '@apollo/client';
import { useAuth0 } from '@auth0/auth0-react';
import * as postcodes from 'node-postcodes.io';
import { SuggestLogin } from './LoginButton';
import RoleRestricted from './RoleRestricted';
import memberPredicate from '../lib/membership';
import MembersAndBoats from './MembersAndBoats';
import membersBoats from '../lib/members_boats.mjs';
import { getFilterable } from '../lib/api';

async function getPostcodeData(members) {
  const pcs = [...(new Set(members.map((m) => m.postcode).filter((p) => p)))];
  pcs.sort();
  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < pcs.length; i += chunkSize) {
    const chunk = pcs.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  const settled = await Promise.allSettled(chunks.map(async (chunk) => {
    const { status, result } = await postcodes.lookup(chunk);
    if (status === 200) {
      return result;
    }
    return undefined;
  }));
  return settled.map((r) => r.value).flat();
}

function MembersList() {
  const [excludeNotPaid, setExcludeNotPaid] = useState(false);
  const [excludeNoConsent, setExcludeNoConsent] = useState(true);
  const [boats, setBoats] = useState(undefined);
  const [pc, setPc] = useState();
  const { user } = useAuth0();

  const roles = user['https://oga.org.uk/roles'];
  const memberNo = user['https://oga.org.uk/member'];
  const membersResult = useQuery(gql`query members { members { 
    salutation firstname lastname member id GDPR postcode
    status telephone mobile town area interests smallboats
   } }`);

  useEffect(() => {
    if (!boats) {
      getFilterable()
        .then((r) => {
          setBoats(r);
        }).catch((e) => console.log(e));
    }
  }, [boats]);

  useEffect(() => {
    if (membersResult.data && pc?.length === 0) {
      getPostcodeData(membersResult.data.members).then((r) => {
        setPc(r);
      });
    }
  }, [pc]);

  if (!boats) {
    return <CircularProgress />;
  }

  if (membersResult.loading) {
    return <CircularProgress />;
  }

  if (membersResult.error) {
    return (<div>{JSON.stringify(membersResult.error)}</div>);
  }

  const { members } = membersResult.data;
  const ybmembers = members
    .filter((m) => memberPredicate(m.id, m, excludeNotPaid, excludeNoConsent));

  if (!pc) {
    setPc([]);
  }

  const wboats = membersBoats(boats, ybmembers);

  const handleNotPaidSwitchChange = (event, newValue) => {
    setExcludeNotPaid(newValue);
  };

  const handleNoConsentSwitchChange = (event, newValue) => {
    setExcludeNoConsent(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Hi
          {' '}
          {user.name}
          {' '}
          (
          {memberNo}
          ).
        </Typography>
        <FormGroup>
          {roles.includes.editor ? <FormControlLabel control={<Switch onChange={handleNotPaidSwitchChange} checked={excludeNotPaid} />} label="Exclude not paid" /> : ''}
          {roles.includes.editor ? <FormControlLabel control={<Switch onChange={handleNoConsentSwitchChange} checked={excludeNoConsent} />} label="Exclude no Consent" /> : ''}
        </FormGroup>
      </Box>
      <MembersAndBoats members={ybmembers} boats={wboats} postcodes={pc} />
    </Box>
  );
}

export default function Members() {
  return (
    <>
      <SuggestLogin />
      <RoleRestricted role="member"><MembersList /></RoleRestricted>
    </>
  );
}
