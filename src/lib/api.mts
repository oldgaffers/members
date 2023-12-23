import { User } from "@auth0/auth0-react"

export type Boat = {
  home_location?: any
  area: any
  oga_no: number
  name: string
  home_port: string
  owners: any[]
  ownerships: any[]
  hire?: boolean
  crewing?: boolean
}

const boatRegisterHome = 'https://oldgaffers.github.io';

const api1 = 'https://5li1jytxma.execute-api.eu-west-1.amazonaws.com';

export function prefix(location: { origin: string; pathname: string }) {
  const origin = location.origin || window.location.origin;
  const pathname = location.pathname || window.location.pathname;
  let test = '';
  if (pathname && pathname.includes('test')) {
    test = 'test_';
  }
  const r = `${origin}/boat_register/${test}`;
  return r;
}

export function boatUrl(ogaNo: number, location: { origin: string; pathname: string }) {
  return `${prefix(location)}boat?oga_no=${ogaNo}`;
}

export async function geolocate(place: string) {
  const r = await fetch(`${api1}/default/public/place?name=${place}`)
  if (r.ok) {
    return r.json()
  }
  return undefined;
}


export async function postGeneralEnquiry(scope: string, subject: string, data: { GDPR?: boolean; id?: number; salutation?: string; firstname?: string; lastname?: string; status?: string; postcode?: string; area?: string; mobile?: string; telephone?: string; interests?: string[]; __typename?: string | undefined; user?: User | undefined; text?: any }) {
  return fetch(
    `${api1}/default/${scope}/${subject}`,
    {
      method: 'post',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    },
  );
}

export async function postScopedData(scope: string, subject: string, data: any, accessToken?: string) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(
    `${api1}/default/${scope}/${subject}`,
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    },
  );
}

export async function getScopedData(
  scope: string,
  subject: string,
  filters?: string | URLSearchParams | Record<string, string> | string[][] | undefined,
  accessToken?: string,
  ): Promise<object[]> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const r = await fetch(
    `${api1}/default/${scope}/${subject}?${new URLSearchParams(filters)}`,
    {
      headers,
    },
  );
  if (r.ok) {
    const d = await r.json();
    return d?.Items;
  }
  return [];
}

export async function getFilterable() {
  const r = await fetch(`${boatRegisterHome}/boatregister/filterable.json`);
  if (r.ok) {
    return r.json();
  }
  return [];
}

export async function getBoat(ogaNo: number, accessToken: string): Promise<Boat | undefined> {
  const r = await fetch(`${boatRegisterHome}/boatregister/page-data/boat/${ogaNo}/page-data.json`);
  if (r.ok) {
    const d = await r.json();
    const { boat } = d.result.pageContext;
    if (accessToken) {
      const extra = await getScopedData('public', 'crewing', { oga_no: `${ogaNo}` }, accessToken);
      if (extra.length > 0) {
        return { ...boat, ...extra[0] };
      }
    }
    return boat;
  }
  return undefined;
}

export async function geolocateGeonames(place: string) {
  const p = new URLSearchParams();
  p.append('username', 'oga_boatregister');
  p.append('country', 'uk');
  p.append('country', 'ie');
  p.append('name', place);
  const r = await fetch(`https://secure.geonames.org/searchJSON?${p}`);
  if (r.ok) {
    return r.json();
  }
}