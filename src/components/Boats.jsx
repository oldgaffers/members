import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { SuggestLogin } from './loginbutton';
import RoleRestricted from './rolerestrictedcomponent';
import BoatsAndOwners from './BoatsAndOwners';
import { getFilterable } from './api';
import { CircularProgress } from '@mui/material';
import membersBoats from './membersBoats';
import { memberPredicate } from '../membership';

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
    return <>
        <SuggestLogin />
        <RoleRestricted role='member'><BoatList /></RoleRestricted>
    </>
        ;
}