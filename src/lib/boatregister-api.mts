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
const api = 'https://3q9wa2j7s1.execute-api.eu-west-1.amazonaws.com';
const stage = 'default';

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
  const r = await fetch(`${api}/${stage}/public/place?name=${place}`);
  if (r.ok) {
    return r.json()
  }
  return undefined;
}

export async function boatsWithHomeLocation(): Promise<Boat[]> {
  const r = await getFilterable();
  const extra = await getScopedData('public', 'crewing');

  const b = r.filter((b1: Boat) => b1).map((b2: Boat) => {
      const be = extra.find((b3: any) => b3.oga_no === b2.oga_no);
      return { ...b2, ...be };
  });
  const hp: string[] = [...new Set(b.filter((i: Boat) => i.home_port).map((i: Boat) => i.home_port))] as string[];
  const settled = await Promise.allSettled(hp.map(async (place) => ({ place, geoname: await geolocate(place) })));
  const ra = settled.map((s) => (s as PromiseFulfilledResult<any>).value);
  const maybeFound = ra.filter((o: any) => o.geoname);
  
  // TODO
  // const notFound = maybeFound.filter((o: any) => o.geoname?.message === 'not found').map((o) => o.place);
  // const tryAgain = [...new Set(notFound.map((p) => p.replace(/ .*/, '')))];
  // const settled2 = await Promise.allSettled(tryAgain.map(async (place) => ({ place, geoname: await geolocate(place) })));
  // const rb = settled2.map((s) => (s as PromiseFulfilledResult<any>).value).filter((o: any) => o.geoname?.lng);
  const found = maybeFound.filter((o: any) => o.geoname?.message !== 'not found');
  const m = Object.fromEntries(found.map((f: any) => [f.place, f.geoname]));
  b.forEach((boat: Boat) => {
      if (m[boat.home_port]) {
          boat.home_location = m[boat.home_port];
      }
  });
  return b;
}

export async function postGeneralEnquiry(scope: string, subject: string, data: any, token?: string) {
  const headers: any = { 'content-type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(
    `${api}/${stage}/${scope}/${subject}`,
    {
      method: 'post',
      body: JSON.stringify(data),
      headers,
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
    `${api}/${stage}/${scope}/${subject}`,
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
    `${api}/${stage}/${scope}/${subject}?${new URLSearchParams(filters)}`,
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

export async function getUploadCredentials() {
  return (await fetch(`${api}/${stage}/upload_credentials`)).json();
}