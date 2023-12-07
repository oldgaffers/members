import { useState } from 'react';
import {
  Box, Button, Stack, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { gql, useMutation } from '@apollo/client';
import SetSkipperProfile from './SetSkipperProfile';
import SetCrewProfile from './SetCrewProfile';

const ADD_SKIPPER_PROFILE_MUTATION = gql`
  mutation skipperProfileMutation($id: Int!, $text: String!) {
    addSkipperProfile(id: $id, text: $text) { ok }
  }`;

const ADD_CREW_PROFILE_MUTATION = gql`
  mutation crewProfileMutation($id: Int!, $text: String!) {
    addCrewProfile(id: $id, text: $text) { ok }
  }`;

export default function Crewing({ user }) {
  const [openSkipperProfile, setOpenSkipperProfile] = useState(false);
  const [openCrewProfile, setOpenCrewProfile] = useState(false);

  const [addProfile, { loading, error }] = useMutation(ADD_SKIPPER_PROFILE_MUTATION);
  const [addCrewProfile, cp] = useMutation(ADD_CREW_PROFILE_MUTATION);

  if (loading) {
    if (openSkipperProfile) {
      setOpenSkipperProfile(false);
    }
    return 'Submitting...';
  }

  if (cp.loading) {
    if (openCrewProfile) {
      setOpenCrewProfile(false);
    }
    return 'Submitting...';
  }

  const handleSubmitSkipperProfile = (text) => {
    addProfile({ variables: { id: user.id, text } });
  };

  const handleSubmitCrewProfile = (text) => {
    addCrewProfile({ variables: { id: user.id, text } });
  };

  if (error) {
    return `Submission error! ${error.message}`;
  }

  return (
    <Stack spacing={1}>
      <Typography>
        Members can now create profiles describing
        their experience and aspirations as skippers and as crew.
      </Typography>
      <Typography>
        Create a skipper profile if you want to offer crewing opportunities to other members.
        Your skippers profile will
        be visible in the 'Boats to Sail' area of the Boat Register
        for boats that you own and have marked as
        available to crew on or hire. Set this option in the 'Your Boats' tab on this page.
      </Typography>
      <Box>
        <Button
          size="small"
          endIcon={<EditIcon />}
          variant="contained"
          color="primary"
          onClick={() => setOpenSkipperProfile(true)}
        >
          Set My Skipper Profile
        </Button>
      </Box>
      <Typography>
        Create a crewing profile if you are interested in crewing on other OGA boats.
        Your crewing profile will be visible to members
        on the new 'Find Crew' menu in the members area.
      </Typography>
      <Box>
        <Button
          size="small"
          endIcon={<EditIcon />}
          variant="contained"
          color="primary"
          onClick={() => setOpenCrewProfile(true)}
        >
          Set My Crew Profile
        </Button>
      </Box>
      <SetSkipperProfile
        profile={user.profile}
        onSubmit={handleSubmitSkipperProfile}
        onCancel={() => setOpenSkipperProfile(false)}
        open={openSkipperProfile}
      />
      <SetCrewProfile
        profile={user.crewingprofile || ''}
        onSubmit={handleSubmitCrewProfile}
        onCancel={() => setOpenCrewProfile(false)}
        open={openCrewProfile}
      />
    </Stack>

  );
}
