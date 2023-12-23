import { createRef, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import {
  Autocomplete, Button, CircularProgress, Dialog, DialogActions, TextField, Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/en-gb';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
// import '@ogauk/react-tiny-editor/lib/index.css';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import membersBoats from './lib/members_boats.mts';
import { Boat, getFilterable } from './lib/api.mts';
import L, { LatLng } from 'leaflet';

type LocationPickerProps = {
  open: boolean
  onClose: Function
  onCancel: Function
  data: LatLng[]
}

type EventFormProps = {
  onCreate: Function
}

const defaultLocation = { lat: 54.5, lng: -3 };

// https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png
// https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png
// https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], // size of the icon
  shadowSize: [41, 41], // size of the shadow
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  shadowAnchor: [16, 34],  // the same for the shadow
  popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
});

function MapComponent({ data, onChangeMarkers }: { data: LatLng[], onChangeMarkers: Function }) {
  const [markers, setMarkers] = useState<LatLng[]>(data);
  const [hack, setHack] = useState<{ x: number, y: number }>();

  useEffect(() => {
    onChangeMarkers(markers);
  }, [markers]);

  const map = useMapEvents({
    click: (a) => {
      map.locate();
      // console.log('clicked', a.latlng);
      // console.log('hack', hack);
      if (hack) {
        setHack(undefined);
      } else {
        if (markers) {
          setMarkers([...markers, a.latlng])
        } else {
          setMarkers([a.latlng]);
        }
      }
    },
    locationfound: (location) => {
      console.log('location found:', location);
    },
  })

  const removeMarker = (pos: LatLng) => {
    const others = markers?.filter((m) => !pos.equals(m)) ?? [];
    setMarkers(others);
  };

  return (<>{markers?.map((m) => <Marker key={JSON.stringify(m)} position={m} icon={defaultIcon}>
    <Popup>
      <Button onClick={(e) => {
        // console.log(e);
        setHack({ x: e.pageX, y: e.pageY });
        removeMarker(m);
      }}
      >Remove marker</Button>
    </Popup>
  </Marker>)}</>);
}

function LocationPicker({ open, data, onCancel, onClose }: LocationPickerProps) {
  const [markers, setMarkers] = useState<LatLng[]>(data);

  return (
    <Dialog open={open} fullWidth>
      <Typography variant='h5' align='center'>Tell us where you are going</Typography>
      <MapContainer
        style={{ height: 700 }}
        center={[defaultLocation.lat, defaultLocation.lng]}
        zoom={6}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapComponent data={markers} onChangeMarkers={(m: LatLng[]) => setMarkers(m)} />
      </MapContainer>
      <Typography marginLeft={1}>Click on the map to add places you may visit, including your home port.</Typography>
      <Typography marginLeft={1}>Click on a marker if you want to remove it.</Typography>
      <Typography marginLeft={1}>You can pan and zoom the map to make things easier.</Typography>
      <DialogActions>
        <Button onClick={() => onCancel()}>Cancel</Button>
        <Button onClick={() => onClose(markers)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
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
  const [specifics, setSpecifics] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [places, setPlaces] = useState<LatLng[]>();
  const [open, setOpen] = useState(false);
  const { user } = useAuth0();
  const q = Object.entries(user ?? {}).map(([k, v]) => [k.replace('https://oga.org.uk/', ''), v]);
  const member = Object.fromEntries(q);
  const { loading, data } = useGetMyBoats([member]);

  function commitEnd(value: Date) {
    const d = value.toISOString().slice(0, 10);
    console.log('end', d);
    setEnd(d);
  }

  function commitStart(value: Date) {
    const d = value.toISOString().slice(0, 10);
    console.log('start', d);
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
      const event = {
        member: user?.['https://oga.org.uk/id'],
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
      onCreate(event);
    }
  };

  const handleClose = (p: LatLng[]) => {
    setOpen(false);
    setPlaces(p)
  };

  const placesToVisit = () => {
    switch (places?.length) {
      case undefined:
      case 0:
        return 'Tell us where you will be going'
      case 1:
        return 'You\'ve added one place to your voyage';
      default:
        return `You've added ${places?.length} places to your voyage`;
    }
  };

  if (loading || !data || data.length < 1) {
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
        <Typography variant="h6">Looking for crew for your your cruising or racing adventures? Create your voyage invitation here</Typography>
        <Grid container spacing={3}>
          <Grid xs="auto">
            <FormControl variant="standard">
              <InputLabel htmlFor="component-title">Title</InputLabel>
              <Input name="eventTitle" id="component-title" defaultValue="My Summer Cruise" />
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
            <Autocomplete
              disablePortal
              freeSolo
              id="component-boat"
              defaultValue={boats.find(() => true)}
              options={boats}
              sx={{ width: 300 }}
              renderInput={(params) => <TextField name="boat" {...params} label="Boat" />}
            />
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
          * If you make an opportunity visible, then people will be able to contact you
                  and express interest in crewing.
                  If you hide it, only it will still be used in the email sent to members you want to invite.
          </Grid>
          <Grid xs="auto">
            <Button variant="contained" onClick={handleCreate}>Create an Entry</Button>
          </Grid>
        </Grid>
      </Box>
      <LocationPicker data={places ?? []} open={open} onCancel={() => setOpen(false)} onClose={handleClose} />
    </LocalizationProvider>
  );
}
