import React, { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { Stack } from '@mui/system';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material';

const areas = [
    { label: 'Bristol Channel', value: 'BC', funded: true },
    { label: 'Dublin Bay', value: 'DB', funded: true },
    { label: 'East Coast', value: 'EC', funded: true },
    { label: 'North East', value: 'NE', funded: true },
    { label: 'North Wales', value: 'NWa', funded: true },
    { label: 'North West', value: 'NW', funded: true },
    { label: 'Scotland', value: 'SC', funded: true },
    { label: 'Solent', value: 'SO', funded: true },
    { label: 'South West', value: 'SW', funded: true },
    { label: 'The Americas', value: 'AM', funded: false },
    { label: 'Continental Europe', value: 'EU', funded: false },
    { label: 'Rest of World', value: 'RW', funded: false },
];

export default function UpdateInterestsDialog({ user, onCancel, onSubmit, open }) {
    const [smallboats, setSmallboats] = useState(user?.smallboats || false);
    const [primary, setPrimary] = useState(user?.area);
    const [additional, setAdditional] = useState(user?.interests || []);

    const handleAreaChange = (event) => {
        const { name, value } = event.target;
        const abbr = name.split('-')[0]; // the area abbreviation
        const areaName = areas.find((area) => area.value === abbr).label;
        switch (value) {
            case 'P':
                if (primary && primary !== areaName) {
                    const v = areas.find((area) => area.label === primary).value;
                    const a = new Set(additional);
                    a.add(v);
                    a.delete(abbr)
                    setAdditional([...a]);
                }
                setPrimary(areaName);
                break;
            case 'S':
                if (primary && primary === areaName) {
                    setPrimary(undefined);
                }
                {
                    const a = new Set(additional);
                    a.add(abbr);
                    setAdditional([...a]);
                }
                break;
            default:
                if (primary && primary === areaName) {
                    setPrimary(undefined);
                }
                {
                    const a = new Set(additional);
                    a.delete(abbr);
                    setAdditional([...a]);
                }
        }
    }

    const val = (area) => {
        if (area.label === primary) {
            return 'P'
        }
        if (additional.includes(area.value)) {
            return 'S';
        }
        return 'N';
    }

    const handleSubmit = () => {
        onSubmit({ ...user, smallboats, interests: additional, area: primary })
    };

    return (
        <Dialog
            open={open}
            aria-labelledby="dialog-update-member-details"
            maxWidth='md'
            fullWidth
        >
            <ScopedCssBaseline>
                <DialogTitle>Update Preferences</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Set one primary area and any secondary areas you want to receive communications from.
                    </DialogContentText>
                    <Stack>
                        <FormGroup>
                            <FormControlLabel control={
                                <Checkbox checked={smallboats} onChange={(_, checked) => setSmallboats(checked)} />
                            } label="Small boats" />
                            <FormHelperText>If you check the small boats box, you will be told about events for small boats in all areas</FormHelperText>
                        </FormGroup>
                        <FormLabel sx={{ marginTop: 1 }}>Areas</FormLabel>
                        <FormHelperText>
                            Your primary area will receive a portion of your membership fee.
                            Some areas are not currently set up to be primary areas
                        </FormHelperText>
                        <Grid2 container>
                            {areas.map((area, index) =>
                                <Grid2 item xs={6} key={index}>
                                    <FormControl>
                                        <FormLabel id={area.value}>{area.label}</FormLabel>
                                        <RadioGroup
                                            value={val(area)}
                                            onChange={handleAreaChange}
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name={`${area.value}-group`}
                                        >
                                            <FormControlLabel disabled={!area.funded} value="P" control={<Radio />} label="Primary" />
                                            <FormControlLabel value="S" control={<Radio />} label="Secondary" />
                                            <FormControlLabel value="N" control={<Radio />} label="None" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid2>)}
                        </Grid2>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </ScopedCssBaseline>
        </Dialog>
    );
}
