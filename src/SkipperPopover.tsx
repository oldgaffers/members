import { CircularProgress, Paper, Popover, Typography } from "@mui/material";
import { Voyage } from "./VoyageCard";
import { gql, useQuery } from "@apollo/client";

interface SkipperPopoverProps {
    open: boolean
    onClose: (event: any) => void
    anchorEl: HTMLElement | undefined
    voyage: Voyage
}

const SKIPPER_QUERY = gql(`query members($id: Int!) {
    members(id: $id) {
      firstname lastname
      skipper { text published }
    }
  }`);

interface ProfileTextProps {
    organiser: { firstname: string, lastname: string, skipper: { text: string, published: boolean } }
    skipper: string
}

function ProfileText({skipper, organiser}: ProfileTextProps) {
    const oname = `${organiser?.firstname ?? ''} ${organiser?.lastname ?? ''}`
    if (oname === skipper && organiser?.skipper?.published) {
        return <Paper dangerouslySetInnerHTML={{ __html: organiser?.skipper?.text?.trim() ?? '' }} />;
    }
    return <Typography>We don't have any details about {skipper ?? '?'}</Typography>;
}

export default function SkipperPopover({ voyage, open, onClose, anchorEl }: SkipperPopoverProps) {
    const { loading, data } = useQuery(SKIPPER_QUERY, { variables: { id: voyage.organiserGoldId } });
    const organiser = data?.members?.[0];

    return <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
    >
        <Typography sx={{ p: 2 }}>{
            loading ? <CircularProgress/> : <ProfileText skipper={voyage.skipper} organiser={organiser} />
        }</Typography>
    </Popover>;
}