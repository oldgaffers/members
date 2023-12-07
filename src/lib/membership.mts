type Member = {
  id: number
  status: string
  GDPR: boolean
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
