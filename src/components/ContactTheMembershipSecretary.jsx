import React, { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { Stack } from '@mui/system';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, TextField, Typography } from '@mui/material';

export default function ContactTheMembershipSecretary({ user, onCancel, onSubmit, open }) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        onSubmit(user, text)
    };

    return (
        <Dialog
            open={open}
            aria-labelledby="dialog-update-member-details"
            maxWidth='md'
            fullWidth
        >
            <ScopedCssBaseline>
                <DialogTitle>Contact the Membership Secretary</DialogTitle>
                <DialogContent>
                    <Stack>
                        <FormLabel><Typography>If anything needs changing, just ask here.</Typography></FormLabel>
                        <TextField multiline rows={3} label="changes" variant="outlined" onChange={(event) => setText(event.target.value)} />
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
