const boatRegisterHome = "https://oldgaffers.github.io";

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
export function boatUrl(oga_no, location ) {
  return `${prefix(location)}boat?oga_no=${oga_no}`;
}

export async function postGeneralEnquiry(scope, subject, data) {
  return fetch(
    `https://5li1jytxma.execute-api.eu-west-1.amazonaws.com/default/${scope}/${subject}`,
    {
      method: 'post',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
    }
  );
}

export async function getFilterable() {
  return (await fetch(`${boatRegisterHome}/boatregister/filterable.json`)).json();
}
