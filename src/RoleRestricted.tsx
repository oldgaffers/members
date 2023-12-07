import { PropsWithChildren } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Typography } from "@mui/material";

type RoleRestrictedProps = {
    role: string
    hide?: boolean
}

export default function RoleRestricted({ role, children, hide=true }: PropsWithChildren<RoleRestrictedProps>) {
    const { user, isAuthenticated } = useAuth0();
    if (role) {
        if (!isAuthenticated) {
            if (hide) {
                return '';
            }
            return (<Typography>This page is for {role} only. Please Login</Typography>);
        }
        const roles = (user?.['https://oga.org.uk/roles']) || [];
        if (!roles.includes(role)) {
            if (hide) {
                return '';
            }
            return (<Typography>This page is for {role} only.</Typography>);
        }
    
        return (<>{children}</>);    
    }
    if (isAuthenticated) {
        return '';
    }
    return (<>{children}</>);    
}