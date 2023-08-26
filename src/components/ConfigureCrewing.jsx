import React, { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { Stack } from '@mui/system';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormLabel, Typography } from '@mui/material';
import TextEdit from './TextEdit';

export default function ConfigureCrewing({ user, onCancel, onSubmit, open }) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        console.log('N', text);
        // onSubmit(user, node.innerHtml)
    };

    return (
        <Dialog
            open={open}
            aria-labelledby="dialog-configure-crewing"
            maxWidth='md'
            fullWidth
        >
            <ScopedCssBaseline>
                <DialogTitle>Configure Crewing Opportunities</DialogTitle>
                <DialogContent>
                        <Typography>
                        Welcome to our newest feature.
                        </Typography>
                        <Typography>
                        This feature is intended for skippers who regularly or occasionally need crew.
                        </Typography>
                        <Typography>
                        It can also be used to announce boats that can be hired.
                        The first use of this is for the East Coast Gaffling 4.1 boats which are available for hire by members.
                        It could also be used by members who operate commercially.
                        </Typography>
                    <Stack>
                        <FormLabel><Typography>Create or Edit your Skipper's profile here.</Typography></FormLabel>
                        <TextEdit text={'Hello'} onChange={setText}/>
                    </Stack>
                    <DialogContentText>
                        Your skipper's profile will be visible on the boat register to members who view
                        the records of boats you have announced.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </ScopedCssBaseline>
        </Dialog>
    );
}
