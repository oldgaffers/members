import { useAuth0 } from "@auth0/auth0-react";
import { Stack, Typography } from "@mui/material";
import CheckMembership from "./CheckMembership";

export default function Welcome() {
    const { user } = useAuth0();
    if (!user) {
        return (
            <Stack spacing={1}>
                <Typography>This is the members area.</Typography>
                <Typography>If you are a member and have previously logged-in to either the members area or the Boat Register then please log-in to
                    check or update your details, find members or members boats or make use of our other services.
                </Typography>
                <Typography>
                    If you've never logged in, then click the red button below and follow the instructions.
                </Typography>
                <Typography>If you aren't a member, take a look at our <a href='/about/membership/membership.html'>join-up page</a></Typography>
            </Stack>
        );
    }
    if (user['https://oga.org.uk/id']) {
        return <Typography variant="h6">Hi{' '}{user.name}.</Typography>;
    }
    return (
        <Stack marginTop={2} marginBottom={2} spacing={2}>
            <Typography>
                Sorry {user?.given_name ?? ''}, we didn't manage to associate your login with a member.
            </Typography>
            <CheckMembership/>
        </Stack>
    );
}
