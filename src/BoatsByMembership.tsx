import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Alert, Autocomplete, Button, CircularProgress, Snackbar, Stack, Switch, TextField, Typography } from '@mui/material';
import { Boat, boatUrl, postGeneralEnquiry } from './lib/boatregister-api.mts';
import { ownerList, ownerValueGetter } from './lib/ownership.mts';
import { useEffect, useState } from 'react';
import { Member } from './lib/membership.mts';
import ChooseABoat from './ChooseABoat';

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
      <Typography variant='h6'>If you have {(boats.length === 0)? 'a boat ' : 'other boats '}
      you can get them added.
      </Typography>
      <Typography variant='h6'>
      If your boat is already on the register you can claim ownership here.</Typography>
      <ChooseABoat boats={boats} onClick={() => setSnackBarOpen(true)} />
      <Typography variant='h6'>If your boat isn't on the list, then you add it on the <a href='/browse_the_register/index.html'>boat register</a>.</Typography>
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

export default function BoatsByMembership({
  boats, onChange, member,
}: BoatsByMembershipProps) {
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
            {boats.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.oga_no}</TableCell>
                <TableCell align="right">{ownerList(row.owners)}</TableCell>
                <TableCell align="right">{ownerValueGetter({ value: row.owners })}</TableCell>
                <TableCell align="right"><Switch onChange={(e) => onChange(row, 'hire', e.target.checked)} checked={row.hire} /></TableCell>
                <TableCell align="right"><Switch onChange={(e) => onChange(row, 'crewing', e.target.checked)} checked={row.crewing} /></TableCell>
                <TableCell align="right">
                  <Button
                    sx={{ padding: "5px" }}
                    size="small"
                    component="a"
                    href={boatUrl(row.oga_no, {
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
            ))}
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
