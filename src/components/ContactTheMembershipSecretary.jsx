import React, { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import {
  Box,
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormLabel, Stack, Typography,
} from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';

export default function ContactTheMembershipSecretary({
  user, data, onCancel, onSubmit, open,
}) {
  const [text, setText] = useState(data);

  const handleSubmit = () => {
    onSubmit(user, text);
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
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </ScopedCssBaseline>
    </Dialog>
  );
}
