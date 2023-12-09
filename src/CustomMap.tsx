import * as L from 'leaflet';
import { useState, useEffect, Key } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer';
import { TileLayer } from 'react-leaflet/TileLayer';
import { Marker } from 'react-leaflet/Marker';
import { Popup } from 'react-leaflet/Popup';
import { Stack } from '@mui/system';
import { Typography } from '@mui/material';
import { getScopedData } from './lib/api.mts';
import 'leaflet/dist/leaflet.css';

interface BoatLocation {
    latitude: number
    longitude: number
    timestamp: string
    source: string
}

function gaffer(colour: string) {
    return L.icon({
        iconUrl: `https://oldgaffers.github.io/boatregister//images/gaffer-${colour}.png`,
        shadowUrl: 'https://oldgaffers.github.io/boatregister//images/shadow-gaffer.png',
        iconSize: [32, 37], // size of the icon
        shadowSize: [51, 37], // size of the shadow
        iconAnchor: [16, 34], // point of the icon which will correspond to marker's location
        shadowAnchor: [16, 34],  // the same for the shadow
        popupAnchor: [16, 18] // point from which the popup should open relative to the iconAnchor
    });
}

const customIcons: Record<string, L.Icon> = {

    gafferBlue: gaffer('blue'),

    gafferOrange: gaffer('orange'),

    blackDiamond: L.icon({
        iconUrl: `https://oldgaffers.github.io/boatregister//images/diamond.png`,
        shadowUrl: 'https://oldgaffers.github.io/boatregister//images/shadow-gaffer.png',
        iconSize: [32, 32], // size of the icon
        shadowSize: [51, 37], // size of the shadow
        iconAnchor: [16, 34], // point of the icon which will correspond to marker's location
        shadowAnchor: [16, 34],  // the same for the shadow
        popupAnchor: [16, 18] // point from which the popup should open relative to the iconAnchor
    }),

    whiteDiamond: L.icon({
        iconUrl: `https://oldgaffers.github.io/boatregister//images/diamond-white.png`,
        shadowUrl: 'https://oldgaffers.github.io/boatregister//images/shadow-gaffer.png',
        iconSize: [32, 32], // size of the icon
        shadowSize: [51, 37], // size of the shadow
        iconAnchor: [16, 34], // point of the icon which will correspond to marker's location
        shadowAnchor: [16, 34],  // the same for the shadow
        popupAnchor: [16, 18] // point from which the popup should open relative to the iconAnchor
    }),

    gaffling: L.icon({
        iconUrl: `https://oldgaffers.github.io/boatregister//images/gaffling.png`,
        shadowUrl: 'https://oldgaffers.github.io/boatregister//images/shadow-gaffer.png',
        iconSize: [32, 32], // size of the icon
        shadowSize: [51, 37], // size of the shadow
        iconAnchor: [16, 34], // point of the icon which will correspond to marker's location
        shadowAnchor: [16, 34],  // the same for the shadow
        popupAnchor: [16, 18] // point from which the popup should open relative to the iconAnchor
    }),

    lug: L.icon({
        iconUrl: `https://oldgaffers.github.io/boatregister//images/lug.png`,
        shadowUrl: 'https://oldgaffers.github.io/boatregister//images/shadow-gaffer.png',
        iconSize: [32, 32], // size of the icon
        shadowSize: [51, 37], // size of the shadow
        iconAnchor: [16, 34], // point of the icon which will correspond to marker's location
        shadowAnchor: [16, 34],  // the same for the shadow
        popupAnchor: [16, 18] // point from which the popup should open relative to the iconAnchor
    }),
};

function BoatMarker({ boat }: { boat: { location: BoatLocation, oga_no: number, name: string} }) {

    const { latitude, longitude, timestamp, source } = boat.location;
    const age = (new Date()).getTime() - (new Date(timestamp)).getTime()
    const d = age.toLocaleString();
    const title = `${boat.name} ${d} ago from ${source || 'whatsapp'}`;
    return <Marker
        key={boat.oga_no}
        position={[latitude, longitude]}
        icon={customIcons.gafferBlue}
        title={title}
        eventHandlers={{
            click: () => {
                console.log('marker clicked')
            },
        }}
    >
        <Popup maxWidth={200}>
            <Typography>{boat.name}(${boat.oga_no}</Typography>
        </Popup>
    </Marker>;
}

function BoatMarkers({ entries }: { entries: any[] }) {
    // const map = useMap()
    // const oms = new OverlappingMarkerSpiderfier(map);

    const visible = (entries || []).filter((boat) => {
        if (boat.location) {
            const up = new Date(boat.location.timestamp).getTime();
            const n = new Date().getTime();
            const days_old = Math.floor((n - up) / 86400000);
            console.log(days_old);
            if (days_old > 6) {
                return false;
            }
            return boat.visible;
        }
        return false;
    });

    return <>
        {visible.map((boat) => <BoatMarker boat={boat} />)}
    </>;
}

type CustomMapProps = {
    scope: string
    markers?: any[]
    center?: L.LatLngExpression
    height: number
}

export default function CustomMap(props: CustomMapProps) {
    const [data, setData] = useState<object[]>();
    const center = props.center ?? [55.0, -2.0];
    useEffect(() => {
        const getData = async () => {
            const p = await getScopedData(props.scope, 'location');
            setData(p);
        }
        if (!data) {
            getData();
        }
    }, [data, props.scope]);

    return (
        <Stack>
            <MapContainer style={{ height: props.height }} center={center} zoom={6} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {(props.markers ?? []).map((port, index: Key) => <Marker
                    key={index}
                    position={[port.latitude, port.longitude]}
                    icon={customIcons[port.icon]}
                    title={port.name}
                ></Marker>)}

                <BoatMarkers entries={data ?? []} />

            </MapContainer>
            <a href="https://www.flaticon.com/free-icons/diamond" title="diamond icons">Diamond icons created by prettycons - Flaticon</a>
        </Stack>
    );
}
