export function emailIndication(record: { email: any; }) {
  if ((record?.email || '').includes('@')) {
    return `The OGA will email you at ${record.email}.`;
  }
  return 'You haven\'t provided an email address so you won\t get any emails.';
}

export function infoOrEmpty(field: string, value: string) {
  if (value.trim() === '') {
    return `We don't have a ${field} on record.`;
  }
  return `Your ${field} is recorded as ${value.trim()}.`;
}

export function membershipType(user: { type: string; yob: number; payment: any; }) {
  if (user.type === 'Honorary') return 'You are an Elder Gaffer or other honorary member';
  if (user.type === 'Junior') {
    const firstYearForJuniors = new Date().getFullYear() - 25;
    if (user.yob < firstYearForJuniors) {
      return `Your membership type is Junior and you pay by ${user.payment}`
      + ` but we have your year of birth recorded as ${user.yob}`
      + ' so you should change to Single or Family membership.';
    }
  }
  return `Your membership type is ${user.type} and you pay by ${user.payment}.`;
}
