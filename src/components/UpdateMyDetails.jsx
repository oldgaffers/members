/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
  Button, CircularProgress, List, ListItem, Snackbar, Typography,
} from '@mui/material';
import RoleRestricted from './RoleRestricted';
import { getFilterable, postGeneralEnquiry } from '../lib/api';
import { SuggestLogin } from './LoginButton';
import membersBoats from '../lib/members_boats.mjs';
import MembersByMembership from './MembersByMembership';
import BoatsByMembership from './BoatsByMembership';
import MemberStatus from './MemberStatus';
import UpdateInterestsDialog from './UpdateInterestsDialog';
import ContactTheMembershipSecretary from './ContactTheMembershipSecretary';
import SetSkipperProfile from './SetSkipperProfile';

const MEMBER_QUERY = gql(`query members($members: [Int]!) {
    members(members: $members) {
        salutation firstname lastname member id GDPR 
        smallboats status telephone mobile area town
        interests email primary profile
    }
  }`);

const ADD_PROFILE_MUTATION = gql`
  mutation profileMutation($id: Int!, $text: String!) {
    addProfile(id: $id, text: $text) { ok }
  }`;

// TODO ReJoin

function emailIndication(record) {
  if ((record?.email || '').includes('@')) {
    return `The OGA will email you at ${record.email}.`;
  }
  return 'You haven\'t provided an email address so you won\t get any emails.';
}

function Update({ openInterestDialog, openContactDialog, openSkipperProfileDialog }) {
  return (
    <Stack direction="row" spacing={2} sx={{ margin: 2 }}>
      <Button
        size="small"
        endIcon={<EditIcon />}
        variant="contained"
        color="primary"
        onClick={() => openInterestDialog(true)}
      >
        Update My Interests
      </Button>
      <Button
        size="small"
        endIcon={<EditIcon />}
        variant="contained"
        color="primary"
        onClick={() => openContactDialog(true)}
      >
        Contact the Membership Secretary
      </Button>
      <Button
        size="small"
        endIcon={<EditIcon />}
        variant="contained"
        color="primary"
        onClick={() => openSkipperProfileDialog(true)}
      >
        Set My Skipper Profile
      </Button>
    </Stack>
  );
}

function MyDetails() {
  const [openInterests, setOpenInterests] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [openSkipperProfile, setOpenSkipperProfile] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [boats, setBoats] = useState();
  const { user } = useAuth0();
  const id = user?.['https://oga.org.uk/id'];
  const memberNo = user?.['https://oga.org.uk/member'];
  const memberResult = useQuery(MEMBER_QUERY, { variables: { members: [memberNo] } });
  const [addProfile, { data, loading, error }] = useMutation(ADD_PROFILE_MUTATION);

  const handleSubmitInterests = (newData) => {
    setOpenInterests(false);
    postGeneralEnquiry('member', 'profile', { ...newData })
      .then((response) => {
        console.log(response);
        setSnackBarOpen(true);
      })
      .catch((error) => {
        console.log('post', error);
        // TODO snackbar from response.data
      });
  };

  const hco = () => alert('Crew');

  const hho = () => alert('hire');

  useEffect(() => {
    if (!boats) {
      getFilterable()
        .then((r) => {
          setBoats(r);
        }).catch((e) => console.log(e));
    }
  }, [boats]);

  if (memberResult.loading) {
    return <CircularProgress />;
  }

  if (!memberResult.data) {
    return <CircularProgress />;
  }
  const members = memberResult.data.members.filter((m) => m.member === memberNo);
  const myRecord = members.find((m) => m.id === id);
  const myBoats = membersBoats(boats, members);
  const primary = members.find((m) => m.primary);

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

  const handleSubmitSkipperProfile = (text) => {
    addProfile({ variables: { id: myRecord.id, text } });
  };

  if (loading) {
    if (openSkipperProfile) {
      setOpenSkipperProfile(false);
    }
    console.log('skipper profile loading');
    return 'Submitting...';
  }

  if (error) {
    console.log('skipper error', error.message);
    return `Submission error! ${error.message}`;
  }

  console.log('data from profile', data);

  return (
    <>
      <Typography variant="h6">
        Hi
        {' '}
        {myRecord.firstname}
        .
      </Typography>
      <List>
        <ListItem>
          your membership number is
          {' '}
          {memberNo}
        </ListItem>
        <ListItem>
          {emailIndication(myRecord)}
        </ListItem>
        <ListItem>
          {(myRecord.primary)
            ? `You are the 'primary' member in this membership.
                        Gaffers Log will be sent to you.`
            : `You are not the 'primary' member in this membership.
                        Gaffers Log will be sent to ${primary.firstname} ${primary.lastname}`}

        </ListItem>
      </List>
      <Stack direction="column">
        <MemberStatus key={memberNo} memberNo={memberNo} members={members} />
        <MembersByMembership members={members} boats={myBoats} />
        <BoatsByMembership
          boats={myBoats}
          onSetHireOptions={hho}
          onsetCrewingOptions={hco}
          showContactButton={false}
        />
        <Update
          openInterestDialog={setOpenInterests}
          openContactDialog={setOpenContact}
          openSkipperProfileDialog={setOpenSkipperProfile}
        />
      </Stack>
      <UpdateInterestsDialog
        user={myRecord}
        onSubmit={handleSubmitInterests}
        onCancel={() => setOpenInterests(false)}
        open={openInterests}
      />
      <ContactTheMembershipSecretary
        user={user}
        onSubmit={handleSubmitContact}
        onCancel={() => setOpenContact(false)}
        open={openContact}
      />
      <SetSkipperProfile
        profile={myRecord.profile}
        onSubmit={handleSubmitSkipperProfile}
        onCancel={() => setOpenSkipperProfile(false)}
        open={openSkipperProfile}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackBarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackBarOpen(false)}
        message="Thanks, we'll get back to you."
        severity="success"
      />
    </>
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
