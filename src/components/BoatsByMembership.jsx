import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Switch, Typography } from '@mui/material';
import { boatUrl } from '../lib/api';
import { ownerList, ownerValueGetter } from '../lib/ownership.mjs';

export default function BoatsByMembership({
  boats, onChange,
}) {
  if (boats.length === 0) {
    return <Typography>You don't have any boats registered to your membership</Typography>;
  }

  return (
    <>
      <Typography variant="h6">
        Your
        {' '}
        {(boats.length > 1) ? 'boats are' : 'boat is'}
        :
      </Typography>
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
                <TableCell align="right">{ownerValueGetter({ value: row.owners})}</TableCell>
                <TableCell align="right"><Switch onChange={(e) => onChange(row, 'hire', e.target.checked)} checked={row.hire} /></TableCell>
                <TableCell align="right"><Switch onChange={(e) => onChange(row, 'crewing', e.target.checked)} checked={row.crewing} /></TableCell>
                <TableCell align="right">
                  <Button
                    padding="5px"
                    size="small"
                    component="a"
                    href={boatUrl(row.oga_no, {})}
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
    </>
  );
}
