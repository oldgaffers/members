import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Box, FormControlLabel, FormGroup, Switch,
} from '@mui/material';
import { gql, useQuery } from '@apollo/client';
import { useAuth0 } from '@auth0/auth0-react';
import * as postcodes from 'node-postcodes.io';
import RoleRestricted from './RoleRestricted';
import MembersAndBoats from './MembersAndBoats';
import memberPredicate, { Member } from './lib/membership.mts';
import membersBoats from './lib/members_boats.mts';
import { getFilterable } from './lib/api.mts';

async function getPostcodeData(members: Member[]) {
  const pcs: string[] = [...(new Set(members.map((m) => m.postcode).filter((p) => p)))];
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
  return settled.map((r: any) => r.value).flat();
}

export function useMembers(
  excludeNotPaid: boolean,
  excludeNoConsent: boolean, 
  crew: boolean,
  ) {
  const [filterable, setFilterable] = useState(undefined);
  const [pc, setPc] = useState<any[]>([]);

  const membersResult = useQuery(gql`query members { members { 
    salutation firstname lastname member id GDPR postcode
    status telephone mobile town area interests smallboats
    crewingprofile
   } }`);

  useEffect(() => {
    if (!filterable) {
      getFilterable()
        .then((r) => {
          setFilterable(r);
        }).catch((e) => console.log(e));
    }
  }, [filterable]);

  useEffect(() => {
    async function fetchPostcodeData() {
      if (membersResult.data && pc.length === 0) {
        setPc(await getPostcodeData(membersResult.data.members));
      }  
    };
    fetchPostcodeData();
  }, [pc, membersResult]);

  if (!filterable) {
    return { loading: true };
  }

  if (membersResult.loading) {
    return membersResult;
  }

  if (membersResult.error) {
    return membersResult;
  }

  if (!pc) {
    setPc([]);
  }

  const { members } = membersResult.data;

  const filteredMembers = members
    .filter((m: Member) => memberPredicate(m.id, m, excludeNotPaid, excludeNoConsent)
      && (m.crewingprofile || !crew));

  const boats = membersBoats(filterable, filteredMembers);

  const data = { boats, postcodes: pc, members: filteredMembers };
  return { data };
}

export function MembersList({ crew=false }) {
  const [excludeNotPaid, setExcludeNotPaid] = useState(false);
  const [excludeNoConsent, setExcludeNoConsent] = useState(true);
  const { user } = useAuth0();
  const roles = user?.['https://oga.org.uk/roles'] ?? [];

  const { loading, data } = useMembers(excludeNotPaid, excludeNoConsent, crew);

  if (loading) {
    return <CircularProgress />;
  }

  const { boats, postcodes, members } = data;

  const handleNotPaidSwitchChange = (_event: any, newValue: boolean | ((prevState: boolean) => boolean)) => {
    setExcludeNotPaid(newValue);
  };

  const handleNoConsentSwitchChange = (_event: any, newValue: boolean | ((prevState: boolean) => boolean)) => {
    setExcludeNoConsent(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <FormGroup>
          {roles.includes.editor ? <FormControlLabel control={<Switch onChange={handleNotPaidSwitchChange} checked={excludeNotPaid} />} label="Exclude not paid" /> : ''}
          {roles.includes.editor ? <FormControlLabel control={<Switch onChange={handleNoConsentSwitchChange} checked={excludeNoConsent} />} label="Exclude no Consent" /> : ''}
        </FormGroup>
      </Box>
      <MembersAndBoats members={members} boats={boats} postcodes={postcodes} />
    </Box>
  );
}

export default function Members() {
  return (
    <RoleRestricted role="member">
      <MembersList />
    </RoleRestricted>
  );
}
