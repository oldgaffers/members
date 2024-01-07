import { useEffect, useState } from "react"; import { Box } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { useAuth0 } from "@auth0/auth0-react";
import VoyageCard from "./VoyageCard";
import { getScopedData } from "./lib/api.mts";

export function VoyageCards() {
    const { getAccessTokenSilently } = useAuth0();
    const [voyages, setVoyages] = useState<any[]>([]);
    const [token, setToken] = useState<string | undefined>();

    useEffect(() => {
        async function getToken() {
            if (!token) {
                const tok = await getAccessTokenSilently();
                setToken(tok);
            }
        }
        getToken();
    }, [token]);

    useEffect(() => {
        async function get() {
            const pub = await getScopedData('public', 'voyage');
            const priv: any[] = await getScopedData('member', 'voyage', undefined, token);
            const vis = priv.filter((v) => v.visibility !== 'hidden');
            setVoyages([...pub, ...vis]);
        }
        get();
    }, [token]);

    const sortedVoyages = [...voyages];
    sortedVoyages.sort((a, b) => a.start.localeCompare(b.start) );
    
    return (
        <Box overflow='auto' minWidth='50vw' maxWidth='85vw'>
            <Grid container spacing={2}>
                {sortedVoyages.map((voyage, index) =>
                    <Grid key={index} xs={4} minWidth={300}>
                        <VoyageCard key={index} voyage={voyage} />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
