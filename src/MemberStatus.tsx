import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import UpdateConsent from './UpdateConsent';
import { Member } from './lib/membership.mts';

type MemberStatusProps = {
    firstname: string
    memberNo: number
    members: Member[]
}

function printedYearbookStatus({ GDPR, status }: Member) {
    if (status === 'Not renewing') {
        return 'Not in Yearbook - will be leaving the OGA';
    }
    if (status === 'Left OGA') {
        return 'Not in Yearbook - left OGA';
    }
    if (status === 'Deceased') {
        return 'Not in Yearbook - sadly departed';
    }
    if (GDPR) {
        return 'will be in the next printed Yearbook';
    }
    return 'Not in Yearbook - consent not given';
}

function membersAreaStatus({ GDPR, status }: Member) {
    if (status === 'Left OGA') {
        return 'Not listed in the members area - left OGA';
    }
    if (status === 'Deceased') {
        return 'Not listed in the members area - sadly departed';
    }
    if (GDPR) {
        return 'shown';
    }
    return 'Not shown - consent not given';
}

export default function MemberStatus({ firstname, memberNo, members }: MemberStatusProps) {
    if (members.length === 1) {
        if (members[0].status === 'Deceased') {
            return <Typography>
                Our records indicate that {firstname} has died.
                If you are acting on their behalf, please contact the membership secretary.
            </Typography>
        }
        if (members[0].status === 'Not renewing') {
            return <Typography>
                Our records indicate you are not intending to renew. We are sorry to see you go!
            </Typography>
        }
        if (members[0].status === 'Left OGA') {
            return <Typography>
                Our records indicate you are no-longer a member. If you want to be in the Yearbook,
                please rejoin.
            </Typography>
        }
        if (members[0].GDPR) {
            return <Typography> Your Yearbook entry will be as shown below.</Typography>;
        }
        return <Typography>
          Your Yearbook entry would be as shown below, but you would
          have to contact the membership secretary to give consent.
        </Typography>;
    } else {
        return <>
            <Typography variant='h6'>
                {firstname}, membership {memberNo} includes the following people:
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Members Area</TableCell>
                        <TableCell>Yearbook</TableCell>
                        <TableCell>Give/Withdraw Consent</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        members.map((member, i) => (
                            <TableRow key={i}>
                                <TableCell>{member.salutation} {member.firstname} {member.lastname}</TableCell>
                                <TableCell>
                                    <Typography>{membersAreaStatus(member)}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{printedYearbookStatus(member)}</Typography>
                                </TableCell>
                                <TableCell>
                                    <UpdateConsent member={member} />
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </>;
    }
}
