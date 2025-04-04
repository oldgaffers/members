import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, FormControlLabel, FormGroup, Switch } from '@mui/material';
import { gql, useQuery } from '@apollo/client';
import { useAuth0 } from '@auth0/auth0-react';
import * as postcodes from 'node-postcodes.io';
import RoleRestricted from './RoleRestricted';
import MembersAndBoats from './MembersAndBoats';
import memberPredicate, { Member, useGetMembership } from './lib/membership.mts';
import membersBoats from './lib/members_boats.mts';
import { getFilterable } from './lib/api.mts';
import LoginButton from './LoginButton';
import Welcome from './Welcome';
// import { PDFDownloadLink } from '@react-pdf/renderer';
// import { DownLoadLink, MembersListDoc } from './MembersPDF';

function membersWithLocation(location: { latitude: any; longitude: any; }) {
  return useQuery(gql`query members($lat: Float, $lng: Float)
  { members(lat: $lat, lng: $lng) { 
    salutation firstname lastname member id GDPR proximity
    status telephone mobile town area interests smallboats younger_member  
    crewing { text pictures published}
   } }`,
   {
    variables: {
      lat: location.latitude,
      lng: location.longitude,
    }
   }
   );
}

function membersWithoutLocation() {
  return useQuery(gql`query members
  { members { 
    salutation firstname lastname member id GDPR
    status telephone mobile town area interests smallboats younger_member
    crewing { text pictures published}
   } }`
   );
}

export function useMembers(
  excludeNotPaid: boolean,
  excludeNoConsent: boolean,
  crew: boolean,
  mylocation?: any,
) {
  const [filterable, setFilterable] = useState(undefined);
  const [pc, setPc] = useState<any[]>([]);

  // TODO server side paginate

  const membersResult = mylocation ? membersWithLocation(mylocation) : membersWithoutLocation();

  useEffect(() => {
    if (!filterable) {
      getFilterable()
        .then((r) => {
          setFilterable(r);
        }).catch((e) => console.log(e));
    }
  }, [filterable]);

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
      && (!crew || m.crewing?.published));

  const boats = membersBoats(filterable, filteredMembers);

  const data = { boats, postcodes: pc, members: filteredMembers };
  return { data };
}

interface MembersListForMemberProps {
  excludeNotPaid: boolean
  excludeNoConsent: boolean
  crew: boolean
  mylocation: any
  roles: any
}

function MembersListForMember({
  excludeNotPaid,
  excludeNoConsent,
  crew,
  mylocation,
}: MembersListForMemberProps) {
  console.log('MembersListForMember');
  const { loading, data } = useMembers(excludeNotPaid, excludeNoConsent, crew, mylocation);

  if (loading) {
    console.log('MembersListForMember loading');
    return <CircularProgress />;
  }

  if (!data) {
    console.log('MembersListForMember no data');
    return <CircularProgress />;
  }

  const { boats, members } = data;

  /*
  return (<>
    <FormGroup>
        {roles.includes('officer') ? 
    (<PDFDownloadLink
      document={<MembersListDoc
      members={members} boats={boats}/>} fileName="oga_yearbook.pdf"
    >
        <DownLoadLink loading={loading}/>
        </PDFDownloadLink>)
        : ''}
        </FormGroup>
    <MembersAndBoats
      members={members}
      boats={boats}
    />
    </>
  );
  */
  return (<MembersAndBoats members={members} boats={boats}/>);
}

function useGetMemberwithLocation(memberNo: number, id: number) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  const memberResult = useGetMembership(memberNo);

  useEffect(() => {
    async function fetchPostcodeData() {
      if (memberResult.data) {
        const me = memberResult?.data?.members?.find((m: { id: any; }) => m.id === id);
        const { result } = await postcodes.lookup([me.postcode]);
        if (result[0].result) {
          const m = { ...me, ...result[0].result};
          setData(m);
          setLoading(false);
        }
      }
    };
    fetchPostcodeData();
  }, [memberResult, memberNo, id]);
  return { loading, data };
}

export function MembersList({ crew = false }) {
  const { user } = useAuth0();
  const id = user?.['https://oga.org.uk/id'];
  const memberNo = user?.['https://oga.org.uk/member'];
  const roles = user?.['https://oga.org.uk/roles'] ?? [];
  const [excludeNotPaid, setExcludeNotPaid] = useState(false);
  const [excludeNoConsent, setExcludeNoConsent] = useState(true);
  const memberResult = useGetMemberwithLocation(memberNo, id);
  const handleNotPaidSwitchChange = (_event: any, newValue: boolean | ((prevState: boolean) => boolean)) => {
    setExcludeNotPaid(newValue);
  };

  const handleNoConsentSwitchChange = (_event: any, newValue: boolean | ((prevState: boolean) => boolean)) => {
    setExcludeNoConsent(newValue);
  };

  if (memberResult.loading) {
    console.log('MembersList loading');
    return <CircularProgress />;
  }

  if (!memberResult.data) {
    console.log('MembersList no data');
    return <CircularProgress />;
  }

  const mylocation = memberResult.data;

  return (
    <Box sx={{ width: '90vw' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <FormGroup>
          {roles.includes('officer') ? <FormControlLabel control={<Switch onChange={handleNotPaidSwitchChange} checked={excludeNotPaid} />} label="Exclude not paid" /> : ''}
          {roles.includes('officer') ? <FormControlLabel control={<Switch onChange={handleNoConsentSwitchChange} checked={excludeNoConsent} />} label="Exclude no Consent" /> : ''}
        </FormGroup>
      </Box>
      <MembersListForMember 
        excludeNotPaid={excludeNotPaid}
        excludeNoConsent={excludeNoConsent}
        crew={crew}
        mylocation={mylocation}
        roles={roles}
      />
    </Box>
  );
}

export default function Members() {
  return (
    <>
      <LoginButton />
      <Welcome />
      <RoleRestricted role="member">
        <MembersList />
      </RoleRestricted>
    </>
  );
}
