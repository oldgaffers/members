import { PropsWithChildren } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Typography } from "@mui/material";
import LoginButton from "./LoginButton";

type RoleRestrictedProps = {
    role: string
    hide?: boolean
}

export default function RoleRestricted({ role = 'members', children, hide = true }: PropsWithChildren<RoleRestrictedProps>) {
    const { user, isAuthenticated } = useAuth0();
    if (!isAuthenticated) {
        return (<div><Typography>Please login</Typography><LoginButton /></div>);
    }
    const roles = (user?.['https://oga.org.uk/roles']) || [];
    if (roles.includes(role)) {
        return (<>{children}</>);
    }
    if (hide) {
        return '';
    }
    return (<div>
        <Typography>This content is for {role} only. </Typography>
        {(roles.length > 0)
            ? <Typography>Your roles are: {roles.join(', ')}. </Typography>
            : <Typography>You have a login but either you are not a member or have recently joined and our records are not up to date.</Typography>
        }
    </div>);
}