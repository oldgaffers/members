/* eslint-disable no-console */
import { PropsWithChildren, SetStateAction, useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  Alert, Box, Button, CircularProgress, Snackbar, Stack, Tab, Tabs, Typography,
} from '@mui/material';
import RoleRestricted from './RoleRestricted';
import MembersByMembership from './MembersByMembership';
import BoatsByMembership from './BoatsByMembership';
import MemberStatus from './MemberStatus';
import Interests from './MemberDetails';
import ContactTheMembershipSecretary from './ContactTheMembershipSecretary';
import { Boat, getBoat, getFilterable, postGeneralEnquiry, postScopedData } from './lib/api.mts';
import membersBoats from './lib/members_boats.mts';
import { Member } from './lib/membership.mts';
import Profile from './Profile';

const MEMBER_QUERY = gql(`query members($members: [Int]!) {
    members(members: $members) {
        salutation firstname lastname member id GDPR 
        smallboats status telephone mobile area town
        interests email primary profile crewingprofile
        postcode type payment address country yob start
    }
  }`);


const ADD_SKIPPER_PROFILE_MUTATION = gql`
mutation skipperProfileMutation($id: Int!, $text: String!) {
  addSkipperProfile(id: $id, text: $text) { ok }
}`;

const ADD_CREW_PROFILE_MUTATION = gql`
mutation crewProfileMutation($id: Int!, $text: String!) {
  addCrewProfile(id: $id, text: $text) { ok }
}`;

// TODO ReJoin

function recordToHtml(d: Member | undefined) {
  if (!d) {
    return '';
  }
  return `Dear OGA Membership Secretary,
<br />my Membership number is ${d.member} and my GOLD Id is ${d.id}.
<br />I would like my membership data to match the following:
<br />salutation: ${d.salutation}
<br />first name: ${d.firstname}
<br />last name: ${d.lastname}
<br />address ${(d?.address || []).join(', ')}
<br />post code: ${d.postcode}
<br />country: ${d.country}
<br />Yearbook permission: ${d.GDPR ? 'Yes' : 'No'}
<br />Telephone: ${d.telephone}
<br />Mobile: ${d.mobile}
<br />Email: ${d.email}
<br />Primary Area: ${d.area}
<br />Additional Areas: ${(d?.interests || []).join(', ')}
<br />Small Boats: ${d.smallboats ? 'Yes' : 'No'}
<br />Younger Gaffers: ${d.youngergaffers ? 'Yes' : 'No'}
<br />
<br />kind regards ${d.firstname}
`;
}

type CustomTabPanelProps = {
  value: number
  index: number
}

function CustomTabPanel(props: PropsWithChildren<CustomTabPanelProps>) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function MyDetails() {
  const [openContact, setOpenContact] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [myRecord, setMyRecord] = useState<Member | undefined>();
  const { user, getAccessTokenSilently } = useAuth0();
  const id = user?.['https://oga.org.uk/id'];
  const memberNo = user?.['https://oga.org.uk/member'];
  const memberResult = useQuery(MEMBER_QUERY, { variables: { members: [memberNo] } });
  const [tab, setTab] = useState(0);
  const [token, setToken] = useState<string|undefined>();
  
  const [addSkipperProfile, sp] = useMutation(ADD_SKIPPER_PROFILE_MUTATION);
  const [addCrewingProfile, cp] = useMutation(ADD_CREW_PROFILE_MUTATION);
  
  const handleTabChange = (_event: any, newValue: SetStateAction<number>) => {
    setTab(newValue);
  };

  const handleInterestChange = (data: Member) => {
    console.log('handleInterestChange', data);
    setMyRecord(data);
  };

  useEffect(() => {
    async function fetchData() {
      if (boats.length > 0) {
        return;
      }
      try {
        const r = await getFilterable();
        const myBoats = membersBoats(r, members);
        const tok = await getAccessTokenSilently();
        setToken(tok);
        const f: Boat[] = [];
        const f1 = await Promise.all(myBoats.map((b) => (getBoat(b.oga_no, tok))));
        f1.forEach((b) => {
          if (b) {
            f.push(b);
          }
        })
        const p = f.map((b: Boat) => {
          const n = myBoats.find((l) => l.oga_no === b.oga_no);
          // set options explicity so switches are always controlled
          return {
            ...b, owners: n?.owners, hire: b.hire || false, crewing: b.crewing || false,
          } as Boat;
        });
        p.sort((a, b) => a.oga_no - b.oga_no);
        setBoats(p);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [boats, members]);

  if (memberResult.loading) {
    return <CircularProgress />;
  }

  if (!memberResult.data) {
    return <CircularProgress />;
  }

  if (members.length === 0) {
    const m = memberResult?.data?.members;
    if (m) {
      setMembers(m);
      setMyRecord((m).find((i: { id: any; }) => i.id === id));
    }
  }

  const handleSubmitContact = (user: any, text: string) => {
    console.log('handleSubmitContact', user);
    console.log('handleSubmitContact', myRecord);
    const { firstname, lastname } = myRecord as Member; 
    setOpenContact(false);
    postGeneralEnquiry('member', 'profile', { firstname, lastname, id, text }, token)
      .then((response) => {
        console.log(response);
        setSnackBarOpen(true);
      })
      .catch((error) => {
        console.log("post", error);
        // TODO snackbar from response.data
      });
  };

  const postCrewingData = async (cd: { [x: number]: any; oga_no: any; }) => {
    const token = await getAccessTokenSilently();
    const response = await postScopedData('public', 'crewing', cd, token);
    if (response.ok) {
      return true;
    }
    throw response;
  };

  const onChange = (row: { oga_no: number; }, field: any, checked: any) => {
    console.log('onswitch', field, checked, row.oga_no);
    postCrewingData({ oga_no: row.oga_no, [field]: checked })
      .then(() => {
        const p = boats.map((b) => {
          if (b.oga_no === row.oga_no) {
            return { ...b, [field]: checked };
          }
          return b;
        });
        p.sort((a, b) => a.oga_no - b.oga_no);
        setBoats(p);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  if (!user) {
    return 'please log in';
  }

  if (!myRecord) {
    return <CircularProgress />;
  }

  if (sp.loading) {
    return 'Submitting...';
  }
  
  if (cp.loading) {
    return 'Submitting...';
  }

  return (
    <Stack spacing={1}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
          <Tab label="About You" />
          <Tab label="About Your Membership" />
          <Tab label="Your Boats" />
          <Tab label="Skipper Profile" />
          <Tab label="Crewing Profile" />
        </Tabs>
      </Box>
      <CustomTabPanel value={tab} index={0}>
        <Interests user={myRecord} members={members} onChange={handleInterestChange} />
        <Typography>
          Changes you make to your selections on this tab will not take effect until they have
          been updated in our central membership database by the membership secretary.
        </Typography>
        <Typography>
          Click the button below to send the changes there. You will get the opportunity to
          amend all the data on this page by editing the form before submission.
        </Typography>
        <Button
          size="small"
          endIcon={<EditIcon />}
          variant="contained"
          color="primary"
          onClick={() => setOpenContact(true)}
        >
          Contact the Membership Secretary
        </Button>
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        <MemberStatus key={memberNo} memberNo={memberNo} members={members} />
        <MembersByMembership members={members} boats={boats} />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={2}>
        <BoatsByMembership
          boats={boats}
          onChange={onChange}
        /> 
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={3}>
        <Profile
          member={myRecord}
          profile='skipper'
          user={user}
          onUpdate={(profile: any) => console.log(profile) /*addSkipperProfile({ variables: { id, profile } })*/}
        />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={4}>
        <Profile
          member={myRecord}
          profile='crewing' user={user}
          onUpdate={(profile: any) => console.log(profile)/*addCrewingProfile({ variables: { id, profile } })*/}
        />
      </CustomTabPanel>
      <ContactTheMembershipSecretary
        user={user}
        data={recordToHtml(myRecord)}
        onSubmit={handleSubmitContact}
        onCancel={() => setOpenContact(false)}
        open={openContact}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackBarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackBarOpen(false)}
      >
        <Alert severity='success'>Thanks, we'll get back to you.</Alert>
      </Snackbar>
    </Stack>
  );
}

export default function UpdateMyDetails() {
  return (
    <RoleRestricted role="member"><MyDetails /></RoleRestricted>
  );
}
