import { Alert, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, Snackbar, Stack, TextField, Typography } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { LatLng } from "leaflet";
import VoyageMap from "./VoyageMap";
import { SetStateAction, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { postGeneralEnquiry } from "./lib/boatregister-api.mts";
import SkipperPopover from "./SkipperPopover";
import Disclaimer from "./Disclaimer";

export interface Voyage {
    organiserGoldId: number
    organiserEmail: string
    title: string
    skipper: string
    crew?: any[]
    boat: {
        name: string
        oga_no: number
    }
    type: string
    visibility: string
    distance: string
    start: string
    end: string
    places: LatLng[]
    specifics: string
}

interface VoyageCardProps {
    voyage: Voyage
}

function interestEmail(from: string, fromEmail: string, user: any, voyage: Voyage) {

    const contact = `${from} <${fromEmail}>`;

    if (user) {
        return {
            to: [voyage.organiserEmail],
            cc: [contact],
            subject: `Crewing interest from an OGA Member for your ${voyage.title}`,
            message: `Hello from the OGA,
OGA Member ${from} has expressed interest in your voyage.
They can be contacted with a 'reply all' to this email.
If they have a crewing profile you will find it in the membership area.
Their OGA Membership number is ${user['https://oga.org.uk/member']}`,
        };
    }
    return {
        to: [voyage.organiserEmail],
        subject: `Crewing interest for your ${voyage.title}`,
        message: `Hello from the OGA,
Someone viewing the Boat Register has expressed interest in your voyage.
They can be contacted by email at ${contact}.`,
    };
}

interface EntryFieldsProps {
    from: string
    fromEmail: string
    onChangeName: (s: string) => void
    onChangeEmail: (s: string) => void
}

function EntryFields({ from, fromEmail, onChangeName, onChangeEmail }: EntryFieldsProps) {
    if (from.trim() !== '' && fromEmail.includes('@')) {
        return '';
    }
    return <Stack direction='column'>
        <TextField
            onChange={(e) => onChangeEmail(e.target.value)}
            margin="dense"
            label="Your Email"
            type="text"
            value={fromEmail}
        />
        <TextField
            onChange={(e) => onChangeName(e.target.value)}
            margin="dense"
            label="Your Name"
            type="text"
            value={from}
        />
    </Stack>;
}

interface InterestDialogProps {
    from: string
    fromEmail: string
    open: boolean
    onSubmit: (name: string, email: string) => void
    onCancel: () => void
    voyage: Voyage
}

function InterestDialog({ from, fromEmail, open, onSubmit, onCancel, voyage }: InterestDialogProps) {
    const [name, setName] = useState(from);
    const [email, setEmail] = useState(fromEmail);
    const [oldEnough, setOldEnough] = useState(false);

    const bad =  (!oldEnough) || name ===  undefined || name.trim() === '' || email === undefined || !email.includes('@')

    return <Dialog open={open}>
        <DialogTitle>{voyage.title} on {voyage.boat.name} ({voyage.boat.oga_no})</DialogTitle>
        <DialogContent>
            <EntryFields from={name} fromEmail={email} onChangeEmail={setEmail} onChangeName={setName} />
            <DialogContentText>
                <Disclaimer />
                Would you like us to email the organiser and ask them to contact you?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <FormControlLabel
                control={<Checkbox
                    checked={oldEnough}
                    onChange={(e) => setOldEnough(e.target.checked)}
                />}
                label="I confirm I am over 18 years old"
            />
            <Button disabled={bad} onClick={() => onSubmit(name, email)}>Yes</Button>
            <Button onClick={onCancel}>No</Button>
        </DialogActions>
    </Dialog>;
}


export default function VoyageCard({ voyage }: VoyageCardProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<HTMLSpanElement>();
    const handleSkipperClick = (event: { currentTarget: SetStateAction<HTMLSpanElement | undefined>; }) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSkipperPopoverClose = () => {
        setAnchorEl(undefined);
    };

    const skipperPopoverOpen = Boolean(anchorEl);

    const title = `${voyage.title} on ${voyage.boat.name} (${voyage.boat.oga_no})`;

    const { user } = useAuth0();

    function handleSubmit(from: string, fromEmail: string) {
        setOpen(false);
        const data = interestEmail(from, fromEmail, user, voyage);
        postGeneralEnquiry('public', 'contact', data)
            .then((response) => {
                console.log(response)
                setSnackBarOpen(true);
            })
            .catch((error) => {
                console.log("post", error);
                // TODO snackbar from response.data
            });
    }

    if (voyage) {
        return <Card>
            <CardHeader title={title} />
            <CardMedia>{(voyage.places?.length > 0) ? <VoyageMap places={voyage.places} /> : ''}</CardMedia>
            <CardContent>
                <Typography>Skippered by {voyage.skipper}<IconButton onClick={handleSkipperClick}><InfoIcon /></IconButton>
                </Typography>
                <Typography>Between {voyage.start} and {voyage.end}</Typography>
                <Typography>Type: {voyage.type}</Typography>
                <Typography>Covering around {voyage.distance} nm</Typography>
                <Typography
                    component='div'
                    dangerouslySetInnerHTML={{ __html: voyage.specifics.trim() }}
                ></Typography>
            </CardContent>
            <CardActions>
                <Button onClick={() => setOpen(true)}>I'm Interested</Button>
            </CardActions>
            <InterestDialog
                open={open}
                from={user?.name ?? ''}
                fromEmail={user?.email ?? ''}
                onSubmit={handleSubmit}
                onCancel={() => setOpen(false)}
                voyage={voyage}
            />
            <SkipperPopover voyage={voyage} open={skipperPopoverOpen} onClose={handleSkipperPopoverClose} anchorEl={anchorEl} />
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={snackBarOpen}
                autoHideDuration={2000}
                onClose={() => setSnackBarOpen(false)}
            >
                <Alert severity="success">Thanks, we've let them know.</Alert>
            </Snackbar>
        </Card>;
    }
    return "nothing to see here";
}

function skipperIfDifferent(skipper: string, organiser: string) {
    if (skipper === organiser) {
        return 'I will be the skipper';
    }
    return `
The skipper will be ${skipper}.`;
}

export function voyageInvitationBody(voyage: Voyage, organiser: string, from: string) {
    return `Hello,
I am planning a trip on ${voyage.boat.name} (${voyage.boat.oga_no}) between the dates ${voyage.start} and ${voyage.end}.

The details are:

${skipperIfDifferent(voyage.skipper, organiser)}
Title: ${voyage.title}
Type: ${voyage.type}
Covering around ${voyage.distance} nm

${voyage.specifics}

If you are interested in joining me, please email me at the address below.

You can find these details, together with other OGA member's voyages at:
https://oga.org.uk/members_area/find_a_spot_on_a_boat/find_a_spot_on_a_boat.html.

Looking forward to hearing from you.

${organiser}
${from}
`;
}