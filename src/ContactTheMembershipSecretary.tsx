import { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography,
} from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';
// import {type  User } from '@auth0/auth0-react';


type ContactTheMembershipSecretaryProps = {
  data: string
  onCancel: Function
  onSubmit: Function
  open: boolean
}

export default function ContactTheMembershipSecretary({
  data, onCancel, onSubmit, open,
}: ContactTheMembershipSecretaryProps) {
  const [text, setText] = useState<string>(data);

  console.log('DATA', data);
  console.log('TEXT', text);

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
                <ReactTinyEditor html={data} onChange={setText} />
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
