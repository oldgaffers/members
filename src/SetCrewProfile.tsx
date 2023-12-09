import { useState } from 'react';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import {
  Box,
  Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Stack, Typography,
} from '@mui/material';
import { ReactReallyTinyEditor as ReactTinyEditor } from '@ogauk/react-tiny-editor';

type SetCrewProfileProps = {
  open: boolean
  profile: string
  onCancel: Function
  onSubmit: Function
}

export default function SetCrewProfile({
  onCancel, onSubmit, open, profile,
}: SetCrewProfileProps) {
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
            This feature is intended for members who would like to crew on members boats.
          </Typography>
          <Stack>
            <Typography>Create or Edit your crew profile here.</Typography>
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
            Your Crew&rsquo;s profile will be visible in the new 'Find Crew' menu in the member&rsquo;s area.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onCancel()}>Cancel</Button>
          <Button onClick={() => onSubmit(text)}>Submit</Button>
        </DialogActions>
      </ScopedCssBaseline>
    </Dialog>
  );
}
