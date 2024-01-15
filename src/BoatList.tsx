import { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useDownloadFile } from "react-downloadfile-hook";
import { Autocomplete, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import BoatsAndOwners from './BoatsAndOwners';
import { Boat, boatsWithHomeLocation } from './lib/api.mts';
import memberPredicate from './lib/membership.mts';
import membersBoats from './lib/members_boats.mts';
import RoleRestricted from './RoleRestricted';
import { boats2xlsx } from './lib/xlsx.mjs';

export function useGetMembersBoats(membersResult: any) {

    const [boats, setBoats] = useState<Boat[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (boats.length > 0) {
                return;
            }
            if (membersResult.loading) {
                return;
            }
            if (membersResult.error) {
                return;
            }
            try {
                setBoats(await boatsWithHomeLocation());
            } catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [boats, membersResult]);

    if (boats.length === 0) {
        return { loading: true }
    }
    return { data: boats };

}

function Xlxs({ data }: { data: any }) {
    const { linkProps } = useDownloadFile({
        fileName: 'OGAYearbookBoats.xlsx',
        format: 'application/xlsx',
        data,
    });
    return <a {...linkProps}><Typography variant='button'>Export</Typography></a>
}

export default function BoatList({ places }: { places: any[] }) {

    const [distanceFrom, setDistanceFrom] = useState<string>();

    const membersResult = useQuery(gql`query members { members { 
           firstname lastname member id GDPR email area
         } }`);

    const boats = useGetMembersBoats(membersResult);

    if (membersResult.loading) {
        return <CircularProgress />;
    }

    if (membersResult.error) {
        return (<div>{JSON.stringify(membersResult.error)}</div>);
    }

    const { members } = membersResult.data;
    const ybmembers = members.filter((m: any) => memberPredicate(m.id, m, false, false));

    const wboats = membersBoats(boats.data, ybmembers);

    const placenames: string[] = places.map((place) => place.name);

    return <>
        <RoleRestricted role='editor'>
            <Xlxs data={boats2xlsx(wboats)} />
        </RoleRestricted>
        <Stack direction="row">
            <Typography marginTop={2} marginRight={1}>Choose from a range of locations to sort boats by proximity.</Typography>
            <Autocomplete
                disablePortal
                sx={{ width: 300 }}
                renderInput={(params) => <TextField name="type" {...params} label="Measure Distance From" />}
                options={placenames}
                onChange={(_e, value) => setDistanceFrom(value ?? undefined)}
            />
            <Typography
                marginLeft='1em'
                marginTop='auto'
                marginBottom='auto'
            >Location data for home ports is provided by GeoNames.org and Google.</Typography>
        </Stack>
        <Typography>Is Your Home Port wrongly placed or not found? Contact the Boat Register Editors.</Typography>
        <BoatsAndOwners boats={wboats} proximityTo={places.find((p) => p.name === distanceFrom)} />;
    </>
}