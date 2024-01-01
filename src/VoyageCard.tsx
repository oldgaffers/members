import { Card, CardActions, CardContent, CardHeader, CardMedia, Typography } from "@mui/material";
import { LatLng } from "leaflet";
import VoyageMap from "./VoyageMap";
import { Member } from "./lib/membership.mts";

export interface Voyage {
    organiserGoldId: number
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
    voyage?: Voyage
}

export default function VoyageCard({ voyage }: VoyageCardProps) {
    if (voyage) {
        return <Card>
            <CardHeader title={`${voyage.title} on ${voyage.boat.name} (${voyage.boat.oga_no})`}/>
            <CardMedia>{(voyage.places?.length > 0) ? <VoyageMap places={voyage.places}/>: ''}</CardMedia>
            <CardContent>
                <Typography>Skippered by {voyage.skipper}</Typography>
                <Typography>Between {voyage.start} and {voyage.end}</Typography>
                <Typography>Type: {voyage.type}</Typography>
                <Typography>Covering around {voyage.distance} nm</Typography>
                <Typography>{voyage.specifics}</Typography>
            </CardContent>
            <CardActions></CardActions>
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

If you are interested in joining, please reply to this email.

You can find these details, plus a map of the journey at https://oga.org.uk/members_area/find_a_spot_on_a_boat/find_a_spot_on_a_boat.html.

Looking forward to hearing from you.

${organiser}
${from}
`;
}