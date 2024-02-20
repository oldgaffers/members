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

function Q(mylocation: any) {
  if (mylocation) {
    return gql`query members($start: Int!, $size: Int!, $sortdir: String!, $sortby: String!,
      $lat: Float, $lng: Float)
    { total members(lat: $lat, lng: $lng, start: $start, size: $size, sortby: $sortby, sortdir: $sortdir) { 
      salutation firstname lastname member id GDPR proximity
      status telephone mobile town area interests smallboats  
     } }`;
  }
  return gql`query members($start: Int!, $size: Int!, $sortdir: String!, $sortby: String!)
  { total members(start: $start, size: $size, sortby: $sortby, sortdir: $sortdir) { 
    salutation firstname lastname member id GDPR
    status telephone mobile town area interests smallboats  
   } }`;
}

export function useMembers(
  excludeNotPaid: boolean,
  excludeNoConsent: boolean,
  crew: boolean,
  start: number,
  size: number,
  sortdir: string,
  sortby: string,
  mylocation?: any,
) {
  const [filterable, setFilterable] = useState(undefined);
  const [pc, setPc] = useState<any[]>([]);
  // TODO server side filter
  const query = Q(mylocation);
  console.log('Q', query);
  const variables = {
    start, size, sortdir, sortby,
    lat: mylocation?.latitude,
    lng: mylocation?.longitude,
  };
  console.log('V', variables);
  const membersResult = useQuery(query, { variables });

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

  const { total, members } = membersResult?.data ?? { total: 0, members: [] };

  const filteredMembers = members
    .filter((m: Member) => memberPredicate(m.id, m, excludeNotPaid, excludeNoConsent)
      && (!crew || m.crewing?.published));

  const boats = membersBoats(filterable, filteredMembers);

  const data = { boats, postcodes: pc, total, members: filteredMembers };
  return { data };
}

interface MembersListForMemberProps {
  excludeNotPaid: boolean
  excludeNoConsent: boolean
  crew: boolean
  mylocation: any
}

function MembersListForMember({
  excludeNotPaid,
  excludeNoConsent,
  crew,
  mylocation,
}: MembersListForMemberProps) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
  const [sortModel, setSortModel] = useState([{ field: 'lastname', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState({
    items: [],
    logicOperator: 'and',
    quickFilterValues: [],
    quickFilterLogicOperator: 'and',
  });
  const { loading, data } = useMembers(
    excludeNotPaid,
    excludeNoConsent,
    crew,
    paginationModel.pageSize * paginationModel.page,
    paginationModel.pageSize,
    sortModel?.[0]?.sort ?? 'asc',
    sortModel?.[0]?.field ?? 'lastname',
    mylocation,
  );

  if (loading || !data) {
    return <CircularProgress />;
  }

  const { boats, total, members } = data;

  return (
    <MembersAndBoats
      onPaginationModelChange={setPaginationModel}
      paginationModel={paginationModel}
      onSortModelChange={setSortModel}
      sortModel={sortModel}
      filterModel={filterModel}
      onFilterModelChange={setFilterModel}
      rowCount={total}
      members={members}
      boats={boats}
    />
  );
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
    return <CircularProgress />;
  }

  if (!memberResult.data) {
    return <CircularProgress />;
  }

  const mylocation = memberResult.data;

  return (
    <Box sx={{ width: '90vw' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <FormGroup>
          {roles.includes('editor') ? <FormControlLabel control={<Switch onChange={handleNotPaidSwitchChange} checked={excludeNotPaid} />} label="Exclude not paid" /> : ''}
          {roles.includes('editor') ? <FormControlLabel control={<Switch onChange={handleNoConsentSwitchChange} checked={excludeNoConsent} />} label="Exclude no Consent" /> : ''}
        </FormGroup>
      </Box>
      <MembersListForMember 
        excludeNotPaid={excludeNotPaid}
        excludeNoConsent={excludeNoConsent}
        crew={crew}
        mylocation={mylocation}
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
