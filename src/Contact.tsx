import { useState } from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import SendIcon from "@mui/icons-material/Send";
import MailIcon from "@mui/icons-material/Mail";
import { useAuth0 } from "@auth0/auth0-react";
import { postGeneralEnquiry } from "./lib/api.mts";
import { Alert } from "@mui/material";

type ContactProps = {
    memberGoldId: number
    text?: string
}

type ContactDialogProps = {
    open: boolean
    title: string
    topic: string
    user: any
    memberGoldId: number
    onSend: Function
    onCancel: Function
}

export function ContactDialog({
    open,
    user,
    memberGoldId,
    onSend,
    onCancel,
    title,
    topic
}: ContactDialogProps) {
    const [email, setEmail] = useState(user?.email || '');
    const [text, setText] = useState("");
    const [valid, setValid] = useState(!!email);

    const onClickSend = () => {
        onSend({ type: topic, text, email, member: memberGoldId });
    }

    const handleEmailChange = (e: { target: { value: any; reportValidity: () => boolean | ((prevState: boolean) => boolean); }; }) => {
        setEmail(e.target.value);
        setValid(e.target.reportValidity());
    };

    return (
        <Dialog
            open={open}
            onClose={() => onCancel()}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText variant="subtitle2">
                    We'll email them and ask them to contact you
                </DialogContentText>
                <TextField
                    value={email}
                    error={email === ""}
                    onChange={handleEmailChange}
                    autoFocus
                    margin="dense"
                    label="Email Address"
                    type="email"
                    fullWidth
                />
                <TextField
                    onChange={(e) => setText(e.target.value)}
                    margin="dense"
                    label="About your enquiry"
                    type="text"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()} color="primary">
                    Cancel
                </Button>
                <Button
                    endIcon={<SendIcon />}
                    onClick={onClickSend}
                    color="primary"
                    disabled={!valid}
                >
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function ContactHelper({ memberGoldId, text = 'Contact', onClose, open }: {
    memberGoldId: number
    text?: string
    onClose: any
    open: boolean
}) {
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const { user, getAccessTokenSilently } = useAuth0();

    function handleSnackBarClose() {
        setSnackBarOpen(false);
    }

    const handleSend = (params: object) => {
        onClose();
        const data: any = { ...params, memberGoldId };
        if (user?.name) {
            data.name = user.name;
        }
        getAccessTokenSilently().then((token) => {
            postGeneralEnquiry('public', 'contact', data, token)
            .then((_response) => {
                // console.log(response)
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
            <ContactDialog
                open={open}
                user={user}
                memberGoldId={memberGoldId}
                onCancel={onClose}
                onSend={handleSend}
                title={text}
                topic='contact'
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

export default function Contact({ memberGoldId, text = 'Contact' }: ContactProps) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <Button
                size="small"
                endIcon={<MailIcon />}
                variant="contained"
                color="success"
                onClick={handleClickOpen}
            >
                {text}
            </Button>
            <ContactHelper
                open={open}
                memberGoldId={memberGoldId}
                onClose={handleCancel}
                text={text}
            />
        </>
    );
}