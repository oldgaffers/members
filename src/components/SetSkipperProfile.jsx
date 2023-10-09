import React, { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import {
  Box,
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Stack, Typography,
} from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';

export default function SetSkipperProfile({
  onCancel, onSubmit, open, profile,
}) {
  const [text, setText] = useState(profile);

  return (
    <Dialog
      open={open}
      aria-labelledby="dialog-configure-crewing"
      maxWidth="md"
      fullWidth
    >
      <ScopedCssBaseline>
        <DialogTitle>Configure Crewing Opportunities</DialogTitle>
        <DialogContent>
          <Typography>
            Welcome to our newest feature.
          </Typography>
          <Typography>
            This feature is intended for skippers who regularly or occasionally need crew.
          </Typography>
          <Stack>
            <Typography>Create or Edit your Skipper&rsquo;s profile here.</Typography>
            <Box sx={{ display: 'flex' }}>
              <Box sx={{
                m: 1, border: 1, paddingBottom: 1, height: '15rem', width: '100%',
              }}
              >
                <ReactTinyEditor html={text} onChange={setText} />
              </Box>
            </Box>
          </Stack>
          <DialogContentText>
            Your skipper&rsquo;s profile will be visible on the boat register to members who view
            the records of boats you have announced.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSubmit(text)}>Submit</Button>
        </DialogActions>
      </ScopedCssBaseline>
    </Dialog>
  );
}
