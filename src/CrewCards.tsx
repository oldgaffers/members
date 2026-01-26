import { Box, CircularProgress, Stack } from "@mui/material";
import CrewCard from "./CrewCard";
import { useMembers } from "./Members";
import { Member } from "./lib/membership.mts";

export type CrewCardsProps = {
  contactEnabled?: boolean
  inviteEnabled?: boolean
  onUpdateInvite?: Function
  invites?: Member[]
  useTestData?: boolean
}

const testdata = [
  {
    id: -1,
    firstname: 'James',
    lastname: 'Turner',
    crewing: { published: true, text: 'He\’s been all over the world and got cups for rowing at Oxford. His neice once tipped him the Black Spot', pictures: [] },
  },
  {
    id: -2,
    firstname: 'Missee',
    lastname: 'Lee',
    crewing: { published: true, text: 'She\'s really good at latin. Experienced at sailing Junk rigged vessels.', pictures: [] },
  },
  {
    id: -3,
    firstname: 'Jack',
    lastname: 'Sparrow',
    crewing: {
      published: true,
      text: 'He can be treacherous and survives mostly by using wit and negotiation rather than by force, opting to flee most dangerous situations and to fight only when necessary.',
      pictures: ['https://www.disneyfanatic.com/wp-content/uploads/2023/10/jim-carrey-replace-johnny-depp--620x330.jpg'],
    },
  },
  {
    id: -4,
    firstname: 'Peggy',
    lastname: 'Blacket',
    crewing: { published: true, text: 'You need her in your crew', pictures: [] },
  },
  {
    id: -5,
    firstname: 'Titty',
    lastname: 'Walker',
    crewing: {
      published: true, 
      text: 'Able Seaman of the Swallow.',
      pictures: []
    },
  },
  {
    id: -6,
    firstname: 'Dick',
    lastname: 'Callum',
    crewing: { published: true, text: 'Astronomer, scientist, naturalist and master of the Scarab.', pictures: [] },
  },
  {
    id: -7,
    firstname: 'Dorothea',
    lastname: 'Callum',
    crewing: { published: true, text: 'Sailing and adventure do not come naturally to her but her loyalty and bravery make her worth having on-board.', pictures: [] },
  }
];

export function CrewCards({
  contactEnabled=false,
  inviteEnabled=false,
  onUpdateInvite,
  invites=[],
  useTestData = false,
 }: CrewCardsProps) {
  const { loading, data } = useMembers(false, true, true);

  if (loading) {
    return <CircularProgress />;
  }

  const { members } = data as { members: Member[] };

  const membersPlusGuests = [...members];
  if (useTestData) {
    membersPlusGuests.push(...testdata);
  };

  return (
    <Box overflow='auto' minWidth='50vw' maxWidth='85vw' >
      <Stack direction='row'>{membersPlusGuests.map((m) => <CrewCard
        key={m.id}
        goldId={m.id}
        email={m.email||''}
        name={`${m.firstname} ${m.lastname}`}
        profile={m.crewing||{ published: false, text: '', pictures: [] }}
        contactEnabled={contactEnabled}
        inviteEnabled={inviteEnabled}
        invited={!!invites.find((invite) => invite.id === m.id)}
        onSaveInvited={(invited: boolean) => onUpdateInvite && onUpdateInvite(m, invited)}
      />)}</Stack>
    </Box>
  );
}
