const boatRegisterHome = 'https://oldgaffers.github.io';

const api1 = 'https://5li1jytxma.execute-api.eu-west-1.amazonaws.com';

export function prefix(location) {
  const origin = location.origin || window.location.origin;
  const pathname = location.pathname || window.location.pathname;
  let test = '';
  if (pathname && pathname.includes('test')) {
    test = 'test_';
  }
  const r = `${origin}/boat_register/${test}`;
  return r;
}
export function boatUrl(ogaNo, location) {
  return `${prefix(location)}boat?oga_no=${ogaNo}`;
}

export async function postGeneralEnquiry(scope, subject, data) {
  return fetch(
    `${api1}/default/${scope}/${subject}`,
    {
      method: 'post',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    },
  );
}

export async function postScopedData(scope, subject, data, accessToken) {
  const headers = {
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

export async function getScopedData(scope, subject, filters, accessToken) {
  const headers = {
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
    return r.json();
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

export async function getBoat(ogaNo, accessToken) {
  const r = await fetch(`${boatRegisterHome}/boatregister/page-data/boat/${ogaNo}/page-data.json`);
  if (r.ok) {
    const d = await r.json();
    const { boat } = d.result.pageContext;
    if (accessToken) {
      const extra = await getScopedData('public', 'crewing', { oga_no: ogaNo }, accessToken);
      if (extra.Count > 0) {
        return { ...boat, ...extra.Items[0] };
      }
    }
    return boat;
  }
  return undefined;
}
