/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, gql } from '@apollo/client';
import {
  Box, Button, CircularProgress, Snackbar, Stack, Tab, Tabs, Typography,
} from '@mui/material';
import RoleRestricted from './RoleRestricted';
import {
  getBoat, getFilterable, postGeneralEnquiry, postScopedData,
} from '../lib/api';
import { SuggestLogin } from './LoginButton';
import membersBoats from '../lib/members_boats.mjs';
import MembersByMembership from './MembersByMembership';
import BoatsByMembership from './BoatsByMembership';
import MemberStatus from './MemberStatus';
import Interests from './MemberDetails';
import ContactTheMembershipSecretary from './ContactTheMembershipSecretary';
import Crewing from './Crewing';

const MEMBER_QUERY = gql(`query members($members: [Int]!) {
    members(members: $members) {
        salutation firstname lastname member id GDPR 
        smallboats status telephone mobile area town
        interests email primary profile crewingprofile
        postcode type payment address country yob start
    }
  }`);

// TODO ReJoin

function recordToHtml(d) {
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

function CustomTabPanel(props) {
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
  const [members, setMembers] = useState([]);
  const [boats, setBoats] = useState([]);
  const [myRecord, setMyRecord] = useState([]);
  const { user, getAccessTokenSilently } = useAuth0();
  const id = user?.['https://oga.org.uk/id'];
  const memberNo = user?.['https://oga.org.uk/member'];
  const memberResult = useQuery(MEMBER_QUERY, { variables: { members: [memberNo] } });
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleInterestChange = (data) => {
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
        const token = await getAccessTokenSilently();
        const f = await Promise.all(myBoats.map((b) => getBoat(b.oga_no, token)));
        const p = f.map((b) => {
          const n = myBoats.find((l) => l.oga_no === b.oga_no);
          // set options explicity so switches are always controlled
          return {
            ...b, owners: n.owners, hire: b.hire || false, crewing: b.crewing || false,
          };
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
      setMyRecord((m).find((i) => i.id === id));
    }
  }

  const handleSubmitContact = (text) => {
    setOpenContact(false);
    postGeneralEnquiry('member', 'profile', { user, text })
      .then((response) => {
        setSnackBarOpen(true);
      })
      .catch((error) => {
        // console.log("post", error);
        // TODO snackbar from response.data
      });
  };

  const postCrewingData = async (cd) => {
    const token = await getAccessTokenSilently();
    const response = await postScopedData('public', 'crewing', cd, token);
    if (response.ok) {
      return true;
    }
    throw response;
  };

  const onChange = (row, field, checked) => {
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

  return (
    <Stack spacing={1}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
          <Tab label="About You" />
          <Tab label="About Your Membership" />
          <Tab label="Your Boats" />
          <Tab label="Crewing" />
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
        <Crewing user={myRecord} />
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
        message="Thanks, we'll get back to you."
        severity="success"
      />
    </Stack>
  );
}

export default function UpdateMyDetails() {
  return (
    <>
      <SuggestLogin />
      <RoleRestricted role="member"><MyDetails /></RoleRestricted>
    </>
  );
}
