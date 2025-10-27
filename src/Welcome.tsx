import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import SendIcon from "@mui/icons-material/Send";
import MailIcon from "@mui/icons-material/Mail";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Stack, Typography } from "@mui/material";
import { postGeneralEnquiry } from "./lib/boatregister-api.mts";

type ContactDialogProps = {
    open: boolean
    title: string
    onSend: Function
    onCancel: Function
}

function ContactDialog({
    open,
    onSend,
    onCancel,
    title,
}: ContactDialogProps) {

    const onClickSend = () => {
        onSend();
    }

    return (
        <Dialog
            open={open}
            onClose={() => onCancel()}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="subtitle2">
                    We'll email the administrators and they will contact you
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()} color="primary">
                    Cancel
                </Button>
                <Button
                    endIcon={<SendIcon />}
                    onClick={onClickSend}
                    color="primary"
                >
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function Contact() {
    const [open, setOpen] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const { user, getAccessTokenSilently } = useAuth0();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    function handleSnackBarClose() {
        setSnackBarOpen(false);
    }

    const handleSend = () => {
        setOpen(false);
        const data: any = {
            subject: 'associate login with membership',
        };
        if (user) {
            data.cc = [user.email];
            data.to = ['boatregister@oga.org.uk'];
            data.message = `The person with the login details below has requested that their account
            be associated with an OGA membership.

            If this was you, you should get an email from an OGA officer.
${Object.entries(user).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
        }
        getAccessTokenSilently().then((token) => {
            postGeneralEnquiry('public', 'associate', data, token)
                .then((response) => {
                    console.log(response)
                    setSnackBarOpen(true);
                })
                .catch((error) => {
                    console.log("post", error);
                    // TODO snackbar from response.data
                });
        });
    };

    return (
        <>
            <Button sx={{ maxWidth: 500 }}
                size="small"
                endIcon={<MailIcon />}
                variant="contained"
                color="success"
                onClick={handleClickOpen}
            >
                Please associate my login with my membership
            </Button>
            <ContactDialog
                open={open}
                onCancel={handleCancel}
                onSend={handleSend}
                title='Associate login with Membership'
            />
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={snackBarOpen}
                autoHideDuration={2000}
                onClose={handleSnackBarClose}
            >
                <Alert severity="success">Thanks, we've forwarded your message by email.</Alert>
            </Snackbar>
        </>
    );
}

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
        <Stack marginTop={2} spacing={1}>
            <Typography>
                Sorry {user?.given_name ?? ''}, we didn't manage to associate your login with a member.
            </Typography>
            <Typography>
                If you have recently joined the OGA, please wait until the morning after you
                receive your welcome email from our Membership Secretary, and then log-out and
                back in again.
            </Typography>
            <Typography>
                If this is your first time logging in, and you used the same email for your login as the OGA has on
                record, and you have already been given a membership number, then please log-out now and log straight back in again.
            </Typography>
            <Typography>
                If this hasn't worked, don't worry.
                When you create a login, the system matches your email address with the one we have on record.
                If you used the same one, the above instructions almost always work.
                If your login uses a different email, we need to make the association for you.
            </Typography>
            <Typography>
                If you've tried logging out and back in again and you are still getting this message then click the button below and we'll contact you to sort it out.
            </Typography>
            <Contact />
            <Typography>&nbsp;</Typography>
        </Stack>
    );
}
