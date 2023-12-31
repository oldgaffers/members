import { useState } from 'react';
import 'dayjs/locale/en-gb';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L, { LatLng } from 'leaflet';

export const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], // size of the icon
    shadowSize: [41, 41], // size of the shadow
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    shadowAnchor: [16, 34],  // the same for the shadow
    popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
});

function MapComponent({ data }: { data: LatLng[] }) {
    const [markers, setMarkers] = useState<LatLng[]>(data);
    const [hack, setHack] = useState<{ x: number, y: number }>();
    const bounds = L.latLngBounds(data[0], data[0]);
    data.slice(1).forEach((d) => bounds.extend(d));

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

    map.fitBounds(bounds);

    return (<>{markers?.map((m) => <Marker key={JSON.stringify(m)} position={m} icon={defaultIcon}>
        <Popup>
            we might want to say something here
        </Popup>
    </Marker>)}</>);
}

export default function VoyageMap({ places }: { places: LatLng[] }) {
    return (
        <MapContainer
            style={{ height: 300 }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapComponent data={places} />
        </MapContainer>
    );
}