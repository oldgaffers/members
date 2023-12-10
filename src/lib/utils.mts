import distance from '@turf/distance';
import { ParsedPhoneNumber, parsePhoneNumber } from 'awesome-phonenumber';
import { Member } from './membership.mts';

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

function fettlePhone(n: string, area: string) {
  if (!n) {
    return undefined;
  }
  if (n.trim() === '') {
    return undefined;
  }
  if (n.startsWith('+')) {
    return parsePhoneNumber(n);
  } if (n.startsWith('00')) {
    return parsePhoneNumber(n.replace('00', '+'));
  } if (area === 'Dublin Bay') {
    const pn = parsePhoneNumber(n, { regionCode: 'IE' });
    if (pn.valid) {
      return pn;
    }
    return parsePhoneNumber(n, { regionCode: 'GB' });
  } if (area === 'Overseas') {
    return parsePhoneNumber(`+${n}`);
  }
  return parsePhoneNumber(n, { regionCode: 'GB' });
}

function formatPhone(pn: ParsedPhoneNumber | undefined) {
  if (pn) {
    if (pn.valid) {
      if (pn.countryCode === 44) {
        return pn.number.national;
      }
      return pn.number.international;
    }
  }
  return undefined;
}

export function phoneGetter({ row }: { row: Member }) {
  const mobile = formatPhone(fettlePhone(row.mobile, row.area));
  const landline = formatPhone(fettlePhone(row.telephone, row.area));
  const n = [];
  if (mobile) {
    n.push(mobile);
  }
  if (landline) {
    n.push(landline);
  }
  if (n.length > 0) {
    return n.join(' / ');
  }
  if (row.mobile === '' && row.telephone === '') {
    return '';
  }
  if (row.mobile.includes('@')) {
    return row.mobile;
  }
  if (row.telephone.includes('@')) {
    return row.telephone;
  }
  return `*** M: ${row.mobile} T: ${row.telephone} ***`;
}

const UNKNOWN_DISTANCE = 99999;

export function distanceInNM(a: any, b: any) {
  if (!a) {
    return UNKNOWN_DISTANCE;
  }
  if (!b) {
    return UNKNOWN_DISTANCE;
  }
  const from = [a.longitude ?? a.lng, a.latitude ?? a.lat];  
  const to = [b.longitude ?? b.lng, b.latitude ?? b.lat];  
  const d = 0.53996 * distance(from, to, { units: 'kilometers' }); // nautical miles
  if (d > 1000) {
    console.log('BIG', a, b);
  }
  return Math.floor(d);
}

export function distanceFormatter(params: { value: number; }) {
  if (params.value === UNKNOWN_DISTANCE) {
    return '?';
  }
  return `${params.value} nm`;
}