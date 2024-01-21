import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import SendIcon from "@mui/icons-material/Send";
import MailIcon from "@mui/icons-material/Mail";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Stack, Typography } from "@mui/material";
import { postGeneralEnquiry } from "./lib/api.mts";

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
    const { user } = useAuth0();

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
            data.cc = [user.email]
            data.to = ['boatregister@oga.org.uk']
            data.message = Object.entries(user).map(([k, v]) => `${k}: ${v}`).join('\n');
        }
        postGeneralEnquiry('public', 'associate', data)
            .then((response) => {
                console.log(response)
                setSnackBarOpen(true);
            })
            .catch((error) => {
                console.log("post", error);
                // TODO snackbar from response.data
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
        return (
            <Typography variant="h6">
                Hi{' '}
                {user.name}
                . Here are your membership details.
            </Typography>
        );
    }
    return (
        <Stack marginTop={2} spacing={1}>
            <Typography>
                Sorry {user.given_name}, we can't associate your login with a member.
                When you create a login, the system matches your email address with the one we have on record.
                If you used the same one, it just works. If you use a different one we need to make the association for you.
            </Typography>
            <Typography component='div'>
                <ul>
                    <li>If you've recently joined the OGA, it might be just that our systems haven't caught up yet:</li>
                    <ul>
                        <li>Please wait until at least the morning after you received your membership number.</li>
                    </ul>
                    <li>If you've just created your login:</li>
                    <ul>
                        <li>Try logging out and back in again. Sometimes it just takes a little while</li>
                        <li>If you might have used a different email address then click the button below and we'll contact you to sort it out.</li>
                    </ul>
                </ul>
            </Typography>
            <Contact />
        </Stack>
    );
}
