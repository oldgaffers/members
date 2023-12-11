import { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Autocomplete, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import BoatsAndOwners from './BoatsAndOwners';
import { Boat, geolocate, getFilterable, getScopedData } from './lib/api.mts';
import memberPredicate from './lib/membership.mts';
import membersBoats from './lib/members_boats.mts';

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
                const r = await getFilterable();
                const extra = await getScopedData('public', 'crewing');

                const b = r.filter((b1: Boat) => b1).map((b2: Boat) => {
                    const be = extra.find((b3: any) => b3.oga_no === b2.oga_no);
                    return { ...b2, ...be };
                });
                const hp: string[] = [...new Set(b.filter((i: Boat) => i.home_port).map((i: Boat) => i.home_port))] as string[];
                const settled = await Promise.allSettled(hp.map(async (place) => ({ place, geoname: await geolocate(place) })));
                const e = settled.map((s) => (s as PromiseFulfilledResult<any>).value);
                const found = e.filter((o) => o.geoname);
                const m = Object.fromEntries(found.map((f) => [f.place, f.geoname]));
                b.forEach((boat: Boat) => {
                    if (m[boat.home_port]) {
                        boat.home_location = m[boat.home_port];
                    }
                });
                setBoats(b);
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
    <Stack direction="row">
        <Typography marginTop={2} marginRight={1}>Choose from a range of locations to sort boats by proximity.</Typography>
        <Autocomplete
            disablePortal
            sx={{ width: 300 }}
            renderInput={(params) => <TextField name="type" {...params} label="Measure Distance From" />}
            options={placenames}
            onChange={(_e, value) => setDistanceFrom(value ?? undefined)}
        />
        <Typography>Location data for home ports is provided by GeoNames.org.</Typography>
        </Stack>
        <BoatsAndOwners boats={wboats} proximityTo={places.find((p) => p.name === distanceFrom)} />;
    </>
}