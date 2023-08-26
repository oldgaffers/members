import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { postGeneralEnquiry } from '../lib/api';

export default function UpdateConsent({ member }) {
    const [open, setOpen] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const { GDPR } = member;
    let text = 'Give Consent';
    let longtext = 'I consent to the indicated details being shared with other members in the members area of the OGA website and printed in the OGA Yearbook';
    if (GDPR) {
        text = 'Withdraw Consent';
        longtext = 'Your request will be processed shortly. You can still find out about events on the website';
    }
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        const newData = { ...member, GDPR: !member.GDPR };
        delete newData.__typename
        // console.log('newData', newData);
        postGeneralEnquiry('member', 'profile', newData)
            .then((response) => {
                setSnackBarOpen(true);
            })
            .catch((error) => {
                // console.log("post", error);
                // TODO snackbar from response.data
            });
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button size='small' variant='contained' color='primary' onClick={handleClickOpen}>
                {text}
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{text}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {longtext}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleClose}>Send</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={snackBarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackBarOpen(false)}
                message="Thanks, we'll get back to you."
                severity="success"
            />
        </div>
    );
}
