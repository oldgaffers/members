/* eslint-disable no-console */
import { PropsWithChildren, SetStateAction, useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, gql } from '@apollo/client';
import {
  Alert,
  Box, Button, CircularProgress, FormControlLabel, LinearProgress, Snackbar, Stack, Switch, Tab, Tabs, Typography,
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
import CrewCard from './CrewCard';
import Photodrop from './PhotoDrop';
import { postPhotos } from './lib/postphotos';

const MEMBER_QUERY = gql(`query members($members: [Int]!) {
    members(members: $members) {
        salutation firstname lastname member id GDPR 
        smallboats status telephone mobile area town
        interests email primary profile crewingprofile
        postcode type payment address country yob start
    }
  }`);

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
// const [progress, setProgress] = useState<number>(0);

/*
    function upload(files: File[]) {
        console.log(files);
        postPhotos(files, '', member.email, undefined, setProgress).then(
            () => console.log('uploaded')
        );
    }
*/

const testData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
  },
];

function Profile({ member, profile, user }: { member: Member, profile: string, user: any }) {
  const [useAvatar, setUseAvatar] = useState<boolean>(!!user.picture);
  const [publish, setPublish] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  function handleSave(profile: string, text: string, pictures: File[]) {
    console.log('handleSave', profile, text, pictures);
  }

  const m = { ...member, pictures: [] as string[] };
  if (useAvatar) {
    m.pictures.push(user.picture);
  }
  m.pictures.push(...testData.map((d) => d.img));

  function onDrop(files: File[]) {
    console.log('ondrop', files);
    setUploading(true);
    postPhotos(files, '', member.email, undefined, setProgress).then(
      () => {
        console.log('uploaded');
        setUploading(false);
      }
  );
  }

  return <>
    <Typography>This is your {profile} profile card</Typography>
    <Stack direction='row' spacing={2} >
      <CrewCard member={m} profile={profile} editEnabled={true} onSave={handleSave} />
      <Stack>
        <Typography>You can customise your card by adding and removing pictures and editing the text.
          Your profile can be saved but won't be visible until it is published.
          If you have a profile picture associated with your login, you can use that, or you can add additional pictures.
          You can favourite a single picture to represent you on the card or have a selection as a gallery.
        </Typography>
        <FormControlLabel control={<Switch checked={useAvatar} onChange={(e) => setUseAvatar(e.target.checked)} />} label="Use my login picture" />
        <Photodrop onDrop={onDrop} preview={false} />
        {uploading ? <LinearProgress value={progress}/> : ''}
        <Typography>Edit the text by clicking on the edit button above the text. Save the changes or cancel using the tick and cross
          buttons that appear during editing.</Typography>
          <FormControlLabel control={<Switch checked={publish} onChange={(e) => setPublish(e.target.checked)} />} label="Published" />
      </Stack>
    </Stack>
  </>;
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
        const token = await getAccessTokenSilently();
        const f: Boat[] = [];
        const f1 = await Promise.all(myBoats.map((b) => (getBoat(b.oga_no, token))));
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

  const handleSubmitContact = (text: any) => {
    setOpenContact(false);
    postGeneralEnquiry('member', 'profile', { user, text })
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
        <Profile member={myRecord} profile='profile' user={user} />
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={4}>
        <Profile member={myRecord} profile='crewingprofile' user={user} />
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
