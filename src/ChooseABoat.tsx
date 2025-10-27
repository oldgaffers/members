function ChooseABoat({ boats, onClick }: { boats: Boat[], onClick: Function }) {
  const [filterable, setFilterable] = useState<Boat[] | undefined>();
  const [year, setYear] = useState<string>();
  const [inputValue, setInputValue] = useState<string>();

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

  const ex = boats.map((b) => b.oga_no);

  const names = filterable.filter((b) => !ex.includes(b.oga_no)).map((b) => `${b.name} (${b.oga_no})`);

  return <>
    <Autocomplete
      options={names}
      inputValue={inputValue ?? ''}
      onInputChange={(_event, newInputValue: string) => {
        setInputValue(newInputValue);
      }}      renderInput={(params) => <TextField  name="type" {...params} label="Boat" />}
    />
    <TextField onChange={(e) => setYear(e.target.value)} label='Year you acquired her'></TextField>
    <Button sx={{ width: 150  }} onClick={() => onClick(inputValue, year)}>Claim this boat</Button>
  </>;
}