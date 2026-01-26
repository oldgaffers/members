/* eslint-disable no-console */
import { PropsWithChildren, SetStateAction, useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth0 } from '@auth0/auth0-react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import {
  Alert, Box, Button, CircularProgress, Snackbar, Stack, Tab, Tabs, Typography,
} from '@mui/material';
import RoleRestricted from './RoleRestricted';
import MembersByMembership from './MembersByMembership';
import BoatsByMembership from './BoatsByMembership';
import MemberStatus from './MemberStatus';
import Interests from './MemberDetails';
import ContactTheMembershipSecretary from './ContactTheMembershipSecretary';
import { Boat, getBoat, getFilterable, postGeneralEnquiry, postScopedData } from './lib/boatregister-api.mts';
import membersBoats from './lib/members_boats.mts';
import { Member } from './lib/membership.mts';
import Profile from './Profile';
import LoginButton from './LoginButton';
import Welcome from './Welcome';

const MEMBER_QUERY = gql(`query members($members: [Int]!) {
    members(members: $members) {
        salutation firstname lastname member id GDPR 
        smallboats youngermember status
        telephone mobile area town
        interests email primary
        postcode type payment address country yob start
    }
  }`);

// TODO ReJoin

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

function toHtml(d: Member | string | undefined) {
  if (!d) {
    return '';
  }
  if (typeof d === 'string') {
    return d;
  }
  const a = (d?.interests || []).join(', ');
  const additionalAreas = (a === '') ? 'None' : a;

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
<br />Additional Areas: ${additionalAreas}
<br />Small Boats: ${d.smallboats ? 'Yes' : 'No'}
<br />Younger Members: ${d.youngermember ? 'Yes' : 'No'}
<br />
<br />kind regards ${d.firstname}
`;
}

async function fetchBoatData(members: Member[], token: string) {
        const r = await getFilterable();
        const owned = membersBoats(r, members);
        const details = await Promise.all(owned.map((b) => getBoat(b.oga_no, token)));
        const got = details.filter((b): b is Boat => !!b);
        const p = got.map((b) => {
          const { owners } = owned.find((l) => l.oga_no === b.oga_no) || {};
          // set options explicity so switches are always controlled
          return { ...b, owners, hire: !!b.hire, crewing: !!b.crewing } as Boat;
        });
        p.sort((a, b) => a.oga_no - b.oga_no);
        return p;
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

  useEffect(() => {
    if (!token) getAccessTokenSilently().then((tok) => setToken(tok));
  }, [token, getAccessTokenSilently]);

  useEffect(() => {
    if (boats.length > 0) return;
    if (!token) return;
    fetchBoatData(members, token).then((b) => setBoats(b));
  }, [boats, members, token]);

  if (memberResult.loading) {
    return <CircularProgress />;
  }

  if (!memberResult.data) {
    return <CircularProgress />;
  }

  if (members.length === 0) {
    if (memberResult?.data) {
      const m: Member[] = (memberResult.data as { members: Member[] }).members;
      setMembers(m);
      setMyRecord((m).find((i: { id: any; }) => i.id === id));
    }
  }

  const handleTabChange = (_event: any, newValue: SetStateAction<number>) => {
    setTab(newValue);
  };

  const handleSubmitContact = (text: string) => {
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

  const handleBoatChange = (row: { oga_no: number; }, field: any, checked: any) => {
    // console.log('onswitch', field, checked, row.oga_no);
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

  return (
    <Stack spacing={1} width='90vw'>
      <Box sx={{ border: 5, borderColor: '#DEEAFD', background: '#DEEAFD' }}>
        <Tabs
          // disable the tab indicator because it doesn't work well with wrapped container
          TabIndicatorProps={{ sx: { display: 'none' } }}
          value={tab}
          onChange={handleTabChange}
          aria-label="membership detail tabs"
          sx={{
            '& .MuiTabs-flexContainer': {
              flexWrap: 'wrap',
            },
            '& .MuiTab-textColorPrimary': {
              color: 'white',
            },
            '& .MuiTab-root': {
              background: '#173161',
              color: 'white',
              margin: '1px',
            },
            '& .Mui-selected': {
              background: 'red',
              color: 'white!important'
            },
          }}
        >
          <Tab label="About You" />
          <Tab label="About Your Membership" />
          <Tab label="Your Boats" />
          <Tab label="Skipper Profile" />
          <Tab label="Crewing Profile" />
        </Tabs>
      </Box>
      <CustomTabPanel value={tab} index={0}>
        <Interests user={myRecord} members={members} onChange={(data: Member) => setMyRecord(data)} />
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
        <MemberStatus key={memberNo} firstname={myRecord.firstname} memberNo={memberNo} members={members} />
        <MembersByMembership members={members} boats={boats} />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={2}>
        <BoatsByMembership
          boats={boats}
          onChange={handleBoatChange}
          member={myRecord}
        /> 
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={3}>
      <Profile profileName='skipper' />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={4}>
        <Profile profileName='crewing' />
      </CustomTabPanel>
      <ContactTheMembershipSecretary
        data={toHtml(myRecord)}
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
  const { user } = useAuth0();
  if (user?.['https://oga.org.uk/member']) {
    return (
      <>
      <RoleRestricted role="member"><MyDetails /></RoleRestricted>
      <LoginButton />
      </>
    );
  }
  return (<>
    <Welcome />
    <LoginButton/>
  </>);
}
