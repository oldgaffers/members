import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, CircularProgress, List, ListItem, Stack, Typography } from "@mui/material";
import { getIsMember } from './lib/boatregister-api.mts';
import Contact from './Associate';

export default function CheckMembership() {
    const { user, getAccessTokenSilently } = useAuth0();
    const [found, setFound] = useState<any>();
    useEffect(() => {
        if (user?.email && !found) {
            getAccessTokenSilently().then((accessToken) => {
                getIsMember(user.email || '', accessToken).then((data) => {
                    setFound(data);
                });
            });
        }
    }, [user, found]);

    if (!found) {
        return (
            <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress />
                <Typography>Please wait while we check</Typography>
            </Stack>
        );
    }
    if (found.email) {
        return (
            <>
                <Typography variant="body1">
                    Good news! We have found your membership record.
                    We are currently updating our records to link your login with your membership.
                    Please log out and log in again
                    <Box fontWeight='fontWeightBold' display='inline'> in a few minutes </Box>
                    to refresh your account.
                </Typography >
            </>
        );
    }
    return (
        <Stack>
            <Typography>
                Sorry, we have checked and we couldn't find a membership record for you.
            </Typography>
            <Typography>Perhaps</Typography>
            <List>
                <ListItem>different email addresses when you joined and when you created a login</ListItem>
                <ListItem>You haven't yet joined, <a href="/about/membership/membership.html">Join Here</a></ListItem>
                <ListItem>Our records are in error</ListItem>
            </List>
            <Typography>Click the button below and we'll contact you to sort it out.</Typography>
            <Contact />
        </Stack >
    );
}