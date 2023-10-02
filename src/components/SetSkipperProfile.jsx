import React, { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormLabel, Stack, Typography,
} from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';

export default function SetSkipperProfile({
  onCancel, onSubmit, open,
}) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit(text);
  };

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
            <FormLabel>
              <Typography>Create or Edit your Skipper&rsquo;s profile here.</Typography>
            </FormLabel>
            <ReactTinyEditor
              html="A <strong>test</strong> message"
              onChange={setText}
            />
          </Stack>
          <DialogContentText>
            Your skipper&rsquo;s profile will be visible on the boat register to members who view
            the records of boats you have announced.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </ScopedCssBaseline>
    </Dialog>
  );
}
