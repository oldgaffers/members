export type Member = {
  id: number
  member: number
  salutation: string
  firstname: string
  lastname: string
  address: string[]
  country: string
  email: string
  status: string
  GDPR: boolean
  smallboats: boolean
  youngergaffers: boolean
  primary: boolean
  postcode: string
  area: string
  mobile: string
  telephone: string
  interests: string[]
  profile: string
  crewingprofile: string
  __typename?: string
}

function memberPredicate(id: number, member: Member, excludeNotPaid = true, excludeNoConsent = true) {
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
    return member.GDPR;
  }
  return true;
}

export default memberPredicate;
