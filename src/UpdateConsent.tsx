import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { postGeneralEnquiry } from './lib/api.mts';
import { type Member } from './lib/membership.mts';

type UpdateConsentProps = {
    member: Member
}

export default function UpdateConsent({ member }: UpdateConsentProps) {
    const { getAccessTokenSilently } = useAuth0();
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
        const gdpr = !member.GDPR
        const { firstname, lastname, id } = member;
        const text = `Dear OGA Membership Secretary,
  <br />my Membership number is ${member.member} and my GOLD Id is ${member.id}.
  <br />I would like my membership data to match the following:
  <br />Yearbook permission: ${gdpr}
  <br />kind regards ${member.firstname}
  `;
        getAccessTokenSilently().then((token) => {
            postGeneralEnquiry('member', 'profile', { firstname, lastname, id, text }, token)
                .then((response) => {
                    console.log("post", response);
                    setSnackBarOpen(true);
                })
                .catch((error) => {
                    console.log("post", error);
                    // TODO snackbar from response.data
                });
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
            >
                <Alert severity="success">Thanks, we'll get back to you.</Alert>
            </Snackbar>
        </div>
    );
}
