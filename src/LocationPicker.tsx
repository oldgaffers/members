import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, Typography } from '@mui/material';
import 'dayjs/locale/en-gb';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
// import '@ogauk/react-tiny-editor/lib/index.css';
import L, { LatLng } from 'leaflet';

type LocationPickerProps = {
    open: boolean
    onClose: Function
    onCancel: Function
    data: LatLng[]
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
  
export default function LocationPicker({ open, data, onCancel, onClose }: LocationPickerProps) {
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