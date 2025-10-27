import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Autocomplete, Button, CircularProgress, TextField } from '@mui/material';
import { Boat, getFilterable, postGeneralEnquiry } from './lib/boatregister-api.mts';
import { Member } from './lib/membership.mts';
import { G } from '@react-pdf/renderer';

export default function ChooseABoat({ member, boats, onClick }: { member: Member, boats: Boat[], onClick: Function }) {
  const [filterable, setFilterable] = useState<Boat[] | undefined>();
  const [year, setYear] = useState<string>();
  const [inputValue, setInputValue] = useState<string>();
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
      message: `Member ${member.member}, ${member.firstname} ${member.lastname} has owned boat ${inputValue} since ${year}

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

  return <>
    <Autocomplete
      options={names}
      inputValue={inputValue ?? ''}
      onInputChange={(_event, newInputValue: string) => {
        setInputValue(newInputValue);
      }} renderInput={(params) => <TextField name="type" {...params} label="Boat" />}
    />
    <TextField onChange={(e) => setYear(e.target.value)} label='Year you acquired her'></TextField>
    <Button sx={{ width: 150 }} onClick={handleClaimBoat}>Claim this boat</Button>
  </>;
}