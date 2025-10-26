import { useEffect, useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography,
} from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
import { Member } from './lib/membership.mts';
// import {type  User } from '@auth0/auth0-react';

function toHtml(d: Member | string | undefined) {
  if (!d) {
    return '';
  }
  if (typeof d === 'string') {
    return d;
  }
  const a = (d?.interests || []).join(', ');
  const additionalAreas = (a === '') ? 'None' : a;

  return `Dear OGA Membership Secretary,
<br />my Membership number is ${d.member} and my GOLD Id is ${d.id}.
<br />I would like my membership data to match the following:
<br />salutation: ${d.salutation}
<br />first name: ${d.firstname}
<br />last name: ${d.lastname}
<br />address ${(d?.address || []).join(', ')}
<br />post code: ${d.postcode}
<br />country: ${d.country}
<br />Yearbook permission: ${d.GDPR ? 'Yes' : 'No'}
<br />Telephone: ${d.telephone}
<br />Mobile: ${d.mobile}
<br />Email: ${d.email}
<br />Primary Area: ${d.area}
<br />Additional Areas: ${additionalAreas}
<br />Small Boats: ${d.smallboats ? 'Yes' : 'No'}
<br />Younger Members: ${d.youngermember ? 'Yes' : 'No'}
<br />
<br />kind regards ${d.firstname}
`;
}

type ContactTheMembershipSecretaryProps = {
  data: Member
  onCancel: Function
  onSubmit: Function
  open: boolean
}

export default function ContactTheMembershipSecretary({
  data, onCancel, onSubmit, open,
}: ContactTheMembershipSecretaryProps) {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    if (!open) {
      setText(toHtml(data));
    }
  }, [data, open]);

  const handleSubmit = () => {
    onSubmit(text);
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="dialog-update-member-details"
      maxWidth="md"
      fullWidth
    >
      <ScopedCssBaseline>
        <DialogTitle>Contact the Membership Secretary</DialogTitle>
        <DialogContent>
          <Stack>
            <Typography>Check and make any changes you want and then submit.</Typography>
            <Box sx={{ display: 'flex' }}>
              <Box sx={{
                m: 1, border: 1, paddingBottom: 1, height: '30rem', width: '100%',
              }}
              >
                <ReactTinyEditor html={text} onChange={setText} />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onCancel()}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </ScopedCssBaseline>
    </Dialog>
  );
}
