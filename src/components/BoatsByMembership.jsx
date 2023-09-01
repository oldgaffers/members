import React from 'react';
import BoatsAndOwners from './BoatsAndOwners';
import { Typography } from '@mui/material';

export default function BoatsByMembership({ boats, showContactButton, onSetHireOptions, onsetCrewingOptions}) {
    if (boats.length === 0) {
        return <Typography>You don't have any boats registered to your membership</Typography>
    }
    return <><Typography variant='h6'>
        Your entries in the online list of members boats {(boats.length > 1) ? 'are' : 'is'}:
    </Typography>
        <BoatsAndOwners
            boats={boats}
            components={{}}
            showContactButton={showContactButton}
            onSetHireOptions={onSetHireOptions}
            onsetCrewingOptions={onsetCrewingOptions}
        />
    </>;
}