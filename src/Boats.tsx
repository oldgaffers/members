import { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { CircularProgress } from '@mui/material';
import { SuggestLogin } from './LoginButton';
import RoleRestricted from './RoleRestricted';
import BoatsAndOwners from './BoatsAndOwners';
import { getFilterable } from './lib/api.mts';
import membersBoats from './lib/members_boats.mts';
import memberPredicate from './lib/membership.mts';

function BoatList() {
  const [boats, setBoats] = useState();

  const membersResult = useQuery(gql`query members { members { 
         firstname lastname member id GDPR email
       } }`);

  useEffect(() => {
    if (!boats) {
      getFilterable()
        .then((r) => {
          setBoats(r);
        }).catch((e) => console.log(e));
    }
  }, [boats]);

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
  const ybmembers = members.filter((m) => memberPredicate(m.id, m, false, false));

  const wboats = membersBoats(boats, ybmembers);

  return <BoatsAndOwners members={ybmembers} boats={wboats} />;
}

export default function Boats() {
  return (
    <>
      <SuggestLogin />
      <RoleRestricted role="member"><BoatList /></RoleRestricted>
    </>
  );
}
