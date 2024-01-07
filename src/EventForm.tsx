import { createRef, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Autocomplete, Box, Button, CircularProgress,
  FormControl, FormHelperText,
  Input, InputLabel,
  TextField, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/en-gb';
import { LatLng } from 'leaflet';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
// import '@ogauk/react-tiny-editor/lib/index.css';
import membersBoats from './lib/members_boats.mts';
import { Boat, getFilterable } from './lib/api.mts';
import LocationPicker from './LocationPicker';
import { CrewCards } from './CrewCards'
import { Voyage } from './VoyageCard';
import { Member } from './lib/membership.mts';

type EventFormProps = {
  onCreate: Function
}

const useGetMyBoats = (members: any[] | undefined): { data?: Boat[], loading?: boolean } => {
  const [b, setB] = useState<Boat[]>([]);

  useEffect(() => {
    const get = async () => {
      const r = await getFilterable();
      const myBoats = membersBoats(r, members);
      setB(myBoats);
    };
    get();
  }, []);
  if (b) {
    return { data: b };
  }
  return { loading: true };
};

export default function EventForm({ onCreate }: EventFormProps) {
  const ref = createRef<HTMLFormElement>();
  const [invites, setInvites] = useState<Member[]>([]);
  const [specifics, setSpecifics] = useState('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [places, setPlaces] = useState<LatLng[]>([]);
  const [open, setOpen] = useState(false);
  const { user } = useAuth0();
  const q = Object.entries(user ?? {}).map(([k, v]) => [k.replace('https://oga.org.uk/', ''), v]);
  const member = Object.fromEntries(q);
  const { loading, data } = useGetMyBoats([member]);

  function commitEnd(value: Date) {
    const d = value.toISOString().slice(0, 10);
    // console.log('end', d);
    setEnd(d);
  }

  function commitStart(value: Date) {
    const d = value.toISOString().slice(0, 10);
    // console.log('start', d);
    setStart(d);
  }

  const boats = data?.map((b) => `${b.name} (${b.oga_no})`) ?? [];

  const handleCreate = () => {
    const form = ref.current;
    if (form) {
      const boat: any = { name: form.boat.value };
      boats.forEach((b, index) => {
        if (b === boat.name) {
          const { name, oga_no } = data?.[index] ?? {};
          boat.name = name;
          boat.oga_no = oga_no;
        }
      });
      const voyage: Voyage = {
        organiserGoldId: user?.['https://oga.org.uk/id'],
        organiserEmail: user?.email ?? '',
        title: form.eventTitle.value,
        skipper: form.skipper.value,
        boat,
        type: form.type.value,
        visibility: form.visibility.value,
        distance: form.distance.value,
        start,
        end,
        places,
        specifics,
      };
      onCreate(voyage, [...invites]);
    }
  };

  const handleClose = (p: LatLng[]) => {
    setOpen(false);
    setPlaces(p)
  };

  const placesToVisit = () => {
    switch (places.length) {
      case 0:
        return 'Tell us where you will be going'
      case 1:
        return 'You\'ve added one place to your voyage';
      default:
        return `You've added ${places?.length} places to your voyage`;
    }
  };

  function handleSaveInvited(m: Member, invited: boolean) {
    const others = invites.filter((invite) => invite.id !== m.id);
    if (invited) {
      others.push(m);
    }
    setInvites(others);
  }

  const ready = start && end;

  if (loading || !data || data.length < 1) {
    return <CircularProgress />;
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box
        ref={ref}
        width="100%"
        border={1}
        component="form"
        sx={{
          '& > :not(style)': { m: 1 },
        }}
        noValidate
        autoComplete="off"
      >
        <Typography variant="h6">Create your voyage invitation here</Typography>
        <Grid container spacing={3}>
          <Grid>
            <Typography></Typography>
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <InputLabel htmlFor="component-title">Title</InputLabel>
              <Input name="eventTitle" id="component-title" defaultValue="My Summer Cruise" />
              <FormHelperText>
                Must be different from any other of your voyages
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <InputLabel htmlFor="component-skipper">Skipper</InputLabel>
              <Input
                name="skipper"
                id="component-skipper"
                defaultValue={user?.name ?? ''}
                aria-describedby="component-skipper-text"
              />
              <FormHelperText id="component-skipper-text">
                Normally you
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <FormControl>
              <Autocomplete
                disablePortal
                freeSolo
                id="component-boat"
                defaultValue={boats.find(() => true)}
                options={boats}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField name="boat" {...params} label="Boat" />}
              />
              <FormHelperText>
                You can type any boat name here
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <FormControl>
              <Autocomplete
                disablePortal
                id="component-visibility"
                defaultValue="members only"
                options={['hidden', 'members only', 'public',
                ]}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField name="visibility" {...params} label="Visibility" />}

              />
              <FormHelperText>
                specify who can see your event*
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <DatePicker label="Start" onChange={(value) => commitStart(value as Date)} />
              <FormHelperText>first day on board</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <DatePicker label="End" onChange={(value) => commitEnd(value as Date)} />
              <FormHelperText>last day on board</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <Autocomplete
              defaultValue="round trip cruise"
              disablePortal
              id="component-event-type"
              options={[
                'race', 'round trip cruise', 'delivery trip', 'leg of a longer cruise', 'rally', 'cruise in company',
              ]}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField name="type" {...params} label="Type of Sailing" />}
            />
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <InputLabel htmlFor="component-distance">Distance</InputLabel>
              <Input
                name="distance"
                id="component-miles"
                defaultValue="30"
                aria-describedby="component-miles-text"
              />
              <FormHelperText id="component-miles-text">
                expected distance to be covered in nm
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={12}>
            <Typography component="span" marginRight={1}>
              {placesToVisit()}
            </Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>Choose on a Map</Button>
          </Grid>
          <Grid xs={12}>
            <FormControl variant="standard">
              <Typography>Specifics</Typography>
              <Box
                id="component-specifics"
                aria-describedby="component-specifics-text"
                sx={{ display: 'flex' }}
              >
                <Box sx={{
                  m: 1, border: 1, paddingBottom: 1, height: '20rem', width: '100%',
                }}
                >
                  <ReactTinyEditor html={specifics} onChange={setSpecifics} />
                </Box>
              </Box>
              <FormHelperText id="component-specifics-text">
                Describe this sailing activity in more detail, for example
                your expectations of crew, level of skill, suitability for
                beginers and/or younger Gaffers, cost sharing arrangements,
                and any other need-to-know
                information
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid>
            <Typography>
              Here are the members who have created a crew profile.
              If you check the invite box they will be emailed the details of your event and encouraged
              to get back to you.
            </Typography>
            <CrewCards inviteEnabled contactEnabled invites={invites} onUpdateInvite={handleSaveInvited} />
          </Grid>
          <Grid>
            * If you make an opportunity visible, then people will be able to contact you
            and express interest in crewing.
            If you hide it, only it will still be used in the email sent to members you want to invite.
          </Grid>
          <Grid xs={12}>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!ready}
            >{ready ? '' : 'Set the start and end dates to '}Create an Entry</Button>
          </Grid>
        </Grid>
      </Box>
      <LocationPicker data={places ?? []} open={open} onCancel={() => setOpen(false)} onClose={handleClose} />
    </LocalizationProvider>
  );
}
