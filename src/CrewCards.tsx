import { Box, CircularProgress, Stack } from "@mui/material";
import CrewCard from "./CrewCard";
import { useMembers } from "./Members";

export type CrewCardsProps = {
  contactEnabled?: boolean
  inviteEnabled?: boolean
  onUpdateInvite?: Function
  invites?: number[]
}

const testdata = [
  {
    id: -1,
    firstname: 'James',
    lastname: 'Turner',
    crewingprofile: 'He\’s been all over the world and got cups for rowing at Oxford. His neice once tipped him the Black Spot',
  },
  {
    id: -2,
    firstname: 'Missee',
    lastname: 'Lee',
    crewingprofile: 'She\'s really good at latin. Experienced at sailing Junk rigged vessels.',
  },
  {
    id: -3,
    firstname: 'Jack',
    lastname: 'Sparrow',
    crewingprofile: 'He can be treacherous and survives mostly by using wit and negotiation rather than by force, opting to flee most dangerous situations and to fight only when necessary.',
    pictures: ['https://www.disneyfanatic.com/wp-content/uploads/2023/10/jim-carrey-replace-johnny-depp--620x330.jpg']
  },
  {
    id: -4,
    firstname: 'Peggy',
    lastname: 'Blacket',
    crewingprofile: 'You need her in your crew',
  },
  {
    id: -5,
    firstname: 'Titty',
    lastname: 'Walker',
    crewingprofile: 'Able Seaman of the Swallow.',
  },
  {
    id: -6,
    firstname: 'Dick',
    lastname: 'Callum',
    crewingprofile: 'Astronomer, scientist, naturalist and master of the Scarab.',
  },
  {
    id: -7,
    firstname: 'Dorothea',
    lastname: 'Callum',
    crewingprofile: 'Sailing and adventure do not come naturally to her but her loyalty and bravery make her worth having on-board.',
  }
];

export function CrewCards({
  contactEnabled=false,
  inviteEnabled=false,
  onUpdateInvite,
  invites=[] }: CrewCardsProps) {
  const { loading, data } = useMembers(false, true, true);

  if (loading) {
    return <CircularProgress />;
  }

  const { members } = data;
  const m = [...members, ...testdata];

  return (
    <Box overflow='auto' minWidth='50vw' maxWidth='85vw' >
      <Stack direction='row'>{m.map((m) => <CrewCard
        key={m.id}
        contactEnabled={contactEnabled}
        inviteEnabled={inviteEnabled}
        member={m}
        invited={invites.includes(m.id)}
        onSaveInvited={(invited: boolean) => onUpdateInvite && onUpdateInvite(m.id, invited)}
      />)}</Stack>
    </Box>
  );
}
