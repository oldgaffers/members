import React, { createRef, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import {
  Autocomplete, Button, CircularProgress, Dialog, Stack, TextField, Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/en-gb';
import MapPicker from 'react-google-map-picker';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import membersBoats from '../lib/members_boats.mjs';
import { getFilterable } from '../lib/api';

const defaultLocation = { lat: 52.68, lng: -1.24 };
const DefaultZoom = 6;

function LocationPicker({ open, onSetLocation }) {
  const [zoom, setZoom] = useState(DefaultZoom);

  const handleChangeLocation = (lat, lng) => {
    onSetLocation({ lat, lng });
  };

  const handleChangeZoom = (newZoom) => {
    setZoom(newZoom);
  };

  return (
    <Dialog open={open} fullWidth>
      <MapPicker
        defaultLocation={defaultLocation}
        zoom={zoom}
        mapTypeId="roadmap"
        style={{ height: '700px' }}
        onChangeLocation={handleChangeLocation}
        onChangeZoom={handleChangeZoom}
        apiKey="AIzaSyD6iwyQdIfntf6stnm-3gySJ-nOe75-IvI"
      />
    </Dialog>
  );
}

const useGetMyBoats = (members) => {
  const [b, setB] = useState();

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

export default function EventForm({ onCreate }) {
  const ref = createRef();
  const [location, setLocation] = useState(defaultLocation);
  const [specifics, setSpecifics] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [open, setOpen] = useState(false);
  const { user } = useAuth0();
  const q = Object.entries(user).map(([k, v]) => [k.replace('https://oga.org.uk/', ''), v]);
  const member = Object.fromEntries(q);
  const { loading, data } = useGetMyBoats([member]);

  const handleCreate = () => {
    const form = ref.current;
    const event = {
      title: form.title.value,
      skipper: form.skipper.value,
      boat: form.boat.value,
      type: form.type.value,
      visibility: form.visibility.value,
      distance: form.distance.value,
      start,
      end,
      location,
      specifics,
    };
    onCreate(event);
  };

  const handleSetLocation = (loc) => {
    setOpen(false);
    setLocation(loc);
  };

  if (loading) {
    return <CircularProgress />;
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box
        ref={ref}
        width="80%"
        border={1}
        component="form"
        sx={{
          '& > :not(style)': { m: 1 },
        }}
        noValidate
        autoComplete="off"
      >
        <Typography variant="h6">Looking for crew for your your cruising or racing adventures? Create Your Sailing Event Here</Typography>
        <Grid container spacing={3}>
          <Grid xs="auto">
            <FormControl variant="standard">
              <InputLabel htmlFor="component-title">Title</InputLabel>
              <Input name="title" id="component-title" defaultValue="My Summer Cruise" />
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <InputLabel htmlFor="component-skipper">Skipper</InputLabel>
              <Input
                name="skipper"
                id="component-skipper"
                defaultValue={user.name}
                aria-describedby="component-skipper-text"
              />
              <FormHelperText id="component-skipper-text">
                Normally you
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <Autocomplete
              disablePortal
              id="component-boat"
              defaultValue={data[0].name}
              options={data.map((b) => ({ id: b.oga_no, label: b.name }))}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField name="boat" {...params} label="Boat" />}
            />
          </Grid>
          <Grid xs="auto">
            <Autocomplete
              disablePortal
              id="component-visibility"
              defaultValue="members only"
              options={[
                { id: 1, label: 'hidden' },
                { id: 2, label: 'members only' },
                { id: 3, label: 'public' },
              ]}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField name="visibility" {...params} label="Visibility" />}
            />
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <DatePicker label="Start" id="component-start" onChange={(value) => setStart(value)} />
              <FormHelperText>first day on board</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <FormControl variant="standard">
              <DatePicker label="End" id="component-end" onChange={(value) => setEnd(value)} />
              <FormHelperText>last day on board</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs="auto">
            <Autocomplete
              defaultValue="round trip cruise"
              disablePortal
              id="component-event-type"
              options={[
                { id: 1, label: 'race' },
                { id: 2, label: 'round trip cruise' },
                { id: 3, label: 'delivery trip' },
                { id: 4, label: 'leg of a longer cruise' },
                { id: 6, label: 'rally' },
                { id: 6, label: 'cruise in company' },
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
            <Typography component="span">
              Location:
              {' '}
              {location.lat}
              ,
              {' '}
              {location.lng}
&nbsp;
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
          <Grid xs="auto">
            <Button variant="contained" onClick={handleCreate}>Create an Entry</Button>
          </Grid>
        </Grid>
      </Box>
      <LocationPicker open={open} onSetLocation={handleSetLocation} />
    </LocalizationProvider>
  );
}
