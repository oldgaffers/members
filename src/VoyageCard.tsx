import { Card, CardActions, CardContent, CardHeader, CardMedia, Typography } from "@mui/material";
import { LatLng } from "leaflet";
import VoyageMap from "./VoyageMap";

export interface Voyage {
    organiserGoldId: number
    title: string
    skipper: string
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
