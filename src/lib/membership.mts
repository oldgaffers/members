import { gql, useQuery } from "@apollo/client"

export type SailingProfile = {
  text: string
  pictures: string[]
  published: boolean
  __typename?: string
}

export interface Member {
  id: number
  member?: number
  salutation?: string
  firstname: string
  lastname: string
  address?: string[]
  country?: string
  email?: string
  status?: string
  GDPR?: boolean
  smallboats?: boolean
  youngergaffers?: boolean
  primary?: boolean
  postcode?: string
  area?: string
  mobile?: string
  telephone?: string
  interests?: string[]
  skipper?: SailingProfile
  crewing?: SailingProfile
  __typename?: string
}

export function areaAbbreviation(value: string | undefined) {
  if (!value) {
    return '';
  }
  const abbrev = {
    'Bristol Channel': 'BC',
    'Dublin Bay': 'DB',
    'East Coast': 'EC',
    'North East': 'NE',
    'Northern Ireland': 'NI',
    'North Wales': 'NWa',
    'North West': 'NW',
    Scotland: 'SC',
    Solent: 'SO',
    'South West': 'SW',
    Overseas: 'OS',
    'The Americas': 'AM',
    'Continental Europe': 'EU',
    'Rest of World': 'RW',
  }[value];
  return abbrev;
}

const MEMBER_QUERY = gql(`query members($members: [Int]!) {
  members(members: $members) {
      salutation firstname lastname member id GDPR 
      smallboats status telephone mobile area town
      interests email primary
      postcode type payment address country yob start
  }
}`);

export function useGetMembership(memberNo: Number) {
  return useQuery(MEMBER_QUERY, { variables: { members: [memberNo] } });
}

function memberPredicate(id: number, member: Member, excludeNotPaid = true, excludeNoConsent = true): boolean {
  if (!member) {
    return false;
  }
  if (id !== member.id) {
    return false;
  }
  if (member.status === 'Left OGA') {
    return false;
  }
  if (excludeNotPaid && member.status === 'Not Paid') {
    return false;
  }
  if (excludeNoConsent) {
    return !!member.GDPR;
  }
  return true;
}

export default memberPredicate;
