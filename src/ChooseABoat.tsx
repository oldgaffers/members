import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Autocomplete, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { Boat, getFilterable, postGeneralEnquiry } from './lib/boatregister-api.mts';
import { Member } from './lib/membership.mts';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

export default function ChooseABoat({ member, boats, onClick }: { member: Member, boats: Boat[], onClick: Function }) {
  const [filterable, setFilterable] = useState<Boat[] | undefined>();
  const [year, setYear] = useState<Dayjs | null>(null);
  const [inputValue, setInputValue] = useState<string | null>(null);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (!filterable) {
      getFilterable()
        .then((r) => {
          setFilterable(r);
        }).catch((e) => console.log(e));
    }
  }, [filterable]);

  if (!filterable) {
    return <CircularProgress />;
  }

  if (!isAuthenticated) {
    return 'Please Login';
  }

  function handleClaimBoat() {
    const data: any = {
      subject: `claim boat ${inputValue}`,
      cc: [member.email],
      to: ['boatregister@oga.org.uk'],
      message: `Member ${member.member}, ${member.firstname} ${member.lastname} has owned boat ${inputValue} since ${year?.year()}.

            If this was you, you should get an email from the boat register editors.`
    }
    getAccessTokenSilently().then((token) => {
      postGeneralEnquiry('public', 'claim', data, token)
        .then((response) => {
          console.log(response)
          onClick();
        })
        .catch((error) => {
          console.log("post", error);
          // TODO snackbar from response.data
        });
    });

  };

  const ex = boats.map((b) => b.oga_no);

  const names = filterable.filter((b) => !ex.includes(b.oga_no)).map((b) => `${b.name} (${b.oga_no})`);

  return <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
    <Stack spacing={2} sx={{ width: 300, marginBottom: 2 }}>
    <Autocomplete
      options={names}
      inputValue={inputValue ?? ''}
      onInputChange={(_event, newInputValue: string) => {
        setInputValue(newInputValue);
      }} renderInput={(params) => <TextField name="type" {...params} label="Boat" />}
    />
    <DatePicker
      views={['year']} label="Year you acquired her" value={year} 
      onChange={(newValue) => setYear(newValue)}
    />
    <Button
      disabled={!inputValue || !year}
      variant='contained'
      onClick={handleClaimBoat}>
        Claim this boat
    </Button>
    </Stack>
  </LocalizationProvider>;
}