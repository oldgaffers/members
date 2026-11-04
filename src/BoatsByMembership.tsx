import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Alert, Button, CircularProgress, Snackbar, Stack, Switch, Typography } from '@mui/material';
import { Boat, boatUrl, getScopedData } from './lib/boatregister-api.mts';
import { ownerList, ownerValueGetter } from './lib/ownership.mts';
import { useEffect, useState } from 'react';
import { Member } from './lib/membership.mts';
import ChooseABoat from './ChooseABoat';
import { browseTheRegisterLink } from './lib/links.mts';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth0 } from '@auth0/auth0-react';

const MEMBER_QUERY = gql(`query members($ids: [Int]!) {
    members(ids: $ids) {
     firstname lastname member id GDPR 
    }
  }`);

type BoatsByMembershipProps = {
  boats: Boat[]
  onChange: Function
  member: Member
}

function BoatsByMembershipHeader({ boats }: { boats: Boat[] }) {
  if (boats.length === 0) {
    return <>
      <Typography>You don't have any boats registered to your membership.</Typography>
    </>;
  }
  return <Typography variant="h6">
    The following
    {' '}
    {(boats.length > 1) ? 'boats are ' : 'boat is '}
    registered against your membership:
  </Typography>
}

function BoatsByMembershipFooter({ boats, member }: { boats: Boat[], member: Member }) {
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  function handleSnackBarClose() {
    setSnackBarOpen(false);
  }

  return <Stack sx={{ marginTop: 1 }} spacing={1}>
    <Typography variant='h6'>If you have {(boats.length === 0) ? 'a boat ' : 'other boats '}
      you can get them added.
    </Typography>
    <Typography variant='h6'>
      If your boat is already on the register you can claim ownership here.</Typography>
    <ChooseABoat member={member} boats={boats} onClick={() => setSnackBarOpen(true)} />
    <Typography variant='h6'>If your boat isn't on the list, then you add it on the <a href={browseTheRegisterLink}>boat register</a>.</Typography>
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={snackBarOpen}
      autoHideDuration={2000}
      onClose={handleSnackBarClose}
    >
      <Alert severity="success">Thanks, we've forwarded your message by email.</Alert>
    </Snackbar>
  </Stack>;
}

function BoatByMembership({ boat, onChange }: { boat: Boat, onChange: Function }) {
  const { getAccessTokenSilently } = useAuth0();
  const [extra, setExtra] = useState<any>({});

  useEffect(() => {
    getAccessTokenSilently().then((token) => {
      getScopedData('public', 'crewing', { oga_no: `${boat.oga_no}` }, token).then((extra) => {
        if (extra.length > 0) {
          setExtra(extra[0]);
        }
      });
    });
  }, [getAccessTokenSilently, setExtra, boat.oga_no]);

    return (
      <TableRow key={boat.oga_no}>
        <TableCell component="th" scope="row">
          {boat.name}
        </TableCell>
        <TableCell align="right">{boat.oga_no}</TableCell>
        <TableCell align="right">{ownerList(boat.owners)}</TableCell>
        <TableCell align="right">{ownerValueGetter(boat.owners)}</TableCell>
        <TableCell align="right"><Switch onChange={(e) => onChange(boat, 'hire', e.target.checked)} checked={extra.hire} /></TableCell>
        <TableCell align="right"><Switch onChange={(e) => onChange(boat, 'crewing', e.target.checked)} checked={extra.crewing} /></TableCell>
        <TableCell align="right">
          <Button
            sx={{ padding: "5px" }}
            size="small"
            component="a"
            href={boatUrl(boat.oga_no, {
              origin: '',
              pathname: ''
            })}
            variant="contained"
            color="primary"
          >
            More..
          </Button>
        </TableCell>
      </TableRow>
    );
  }

function BoatsWithOwners({ boats, member, otherOwners, onChange }: { boats: Boat[], member: Member, otherOwners: number[], onChange: Function }) {
      const memberResult = useQuery(MEMBER_QUERY, { variables: { ids: otherOwners } });

      if (memberResult.loading) {
        return <CircularProgress />;
      }

      if (!memberResult.data) {
        return <CircularProgress />;
      }
      const members: Member[] = (memberResult.data as { members: Member[] }).members;
      if (members === null) {
        console.log('members is null');
        return <CircularProgress />;
      }

      const b = boats.map((boat) => {
        const owners = boat.owners.map((ownerId) => {
          if (ownerId === member.id) {
            return member;
          }
          const owner = members.find((m: Member) => m.id === ownerId);
          return owner || { firstname: 'Unknown', lastname: 'Unknown', id: ownerId, GDPR: false } as Member;
        });
        return { ...boat, owners };
      });
      return (
        <>
          <BoatsByMembershipHeader boats={boats} />
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Boat</TableCell>
                  <TableCell align="right">No.</TableCell>
                  <TableCell align="right">Owner(s)</TableCell>
                  <TableCell align="right">Owner(s) Visible to Members</TableCell>
                  <TableCell align="right">For&nbsp;Hire*</TableCell>
                  <TableCell align="right">Crew&nbsp;Wanted*</TableCell>
                  <TableCell align="right">View in the Boat Register</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {b.map((row) => (<BoatByMembership key={row.oga_no} boat={row} onChange={onChange} />))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography>* changes you make here have immediate effect,
            they don't need to be approved by the boat register editors.
            If you want to set more text about the crewing opportunities you are offering or the conditions of hire,
            do it using the edit form on the boat's detail page on the boat register.
          </Typography>
          <BoatsByMembershipFooter member={member} boats={boats} />
        </>
      );
    }

export default function BoatsByMembership({
      boats, onChange, member,
    }: BoatsByMembershipProps) {
    const owners = [...boats.reduce((acc, boat) => {
      boat.owners.forEach((owner) => {
        if (owner !== member.id) {
          acc.add(owner);
        }
      });
      return acc;
    }, new Set<number>())];
    return <BoatsWithOwners boats={boats} member={member} otherOwners={owners} onChange={onChange} />;
  }
