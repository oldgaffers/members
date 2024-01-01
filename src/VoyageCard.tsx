import { Alert, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Typography } from "@mui/material";
import { LatLng } from "leaflet";
import VoyageMap from "./VoyageMap";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { postGeneralEnquiry } from "./lib/api.mts";

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

function InterestDialog({open, onSubmit, onCancel, voyage}: { open: boolean, onCancel: any, onSubmit: any, voyage: Voyage }) {
    return <Dialog open={open}>
        <DialogTitle>{voyage.title} on {voyage.boat.name} ({voyage.boat.oga_no})</DialogTitle>
        <DialogContent>
        <DialogContentText>
            Would you like us to email the organiser and ask them to contact you?
        </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onSubmit}>Yes</Button>
            <Button onClick={onCancel}>No</Button>
        </DialogActions>
    </Dialog>;
}

// TODO make skipper profile accessible

export default function VoyageCard({ voyage }: VoyageCardProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);

    const title = `${voyage.title} on ${voyage.boat.name} (${voyage.boat.oga_no})`;

    const { user } = useAuth0();

    const me = user ?? {};

    const myemail = `${me.name} <${me.email}>`;

    function handleSubmit() {
        setOpen(false);
        const data: any = {
            to: [voyage.organiserEmail],
            cc: [myemail],
            subject: 'Crewing interest from an OGA Member for your ${vo}',
            message: `Hello from the OGA,
OGA Member ${user?.name} has expressed interest in your voyage.
They can be contacted with a 'reply all' to this email.
If they have a crewing profile you will find it in the membership area.
Their OGA Membership number is ${me['https://oga.org.uk/member']}`,
         };
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
            <CardHeader title={title}/>
            <CardMedia>{(voyage.places?.length > 0) ? <VoyageMap places={voyage.places}/>: ''}</CardMedia>
            <CardContent>
                <Typography>Skippered by {voyage.skipper}</Typography>
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
            <InterestDialog open={open} onSubmit={handleSubmit} onCancel={() => setOpen(false)} voyage={voyage} />
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