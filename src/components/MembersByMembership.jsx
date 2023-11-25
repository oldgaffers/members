import React from 'react';

import { Typography } from '@mui/material';
import MembersAndBoats from './MembersAndBoats';

export default function MembersByMembership({ members, boats }) {
  const yeses = members.filter((m) => m.GDPR);
  const nos = members.filter((m) => !m.GDPR);
  if (yeses.length === members.length) {
    return (
      <>
        <Typography sx={{ marginTop: '2px' }} variant="h6">
          Your
          {' '}
          {(members.length > 1) ? 'entries' : 'entry'}
          {' '}
          in the online member list are:
        </Typography>
        <MembersAndBoats members={members} boats={boats} components={{}} />
      </>
    );
  }
  if (nos.length === members.length) {
    return (
      <>
        <Typography sx={{ marginTop: '2px' }} variant="h6">
          Your
          {' '}
          {(members.length > 1) ? 'entries' : 'entry'}
          {' '}
          in the online member list would be:
        </Typography>
        <MembersAndBoats members={members} boats={boats} components={{}} />
      </>
    );
  }
  return (
    <>
      <Typography sx={{ marginTop: '2px' }} variant="h6">
        Your
        {' '}
        {(members.length > 1) ? 'entries' : 'entry'}
        {' '}
        in the online member list are:
      </Typography>
      <MembersAndBoats members={yeses} boats={boats} components={{}} />
      <Typography sx={{ marginTop: '2px' }} variant="h6">
        You could add:
      </Typography>
      <MembersAndBoats members={nos} boats={boats} components={{}} />
    </>
  );
}
