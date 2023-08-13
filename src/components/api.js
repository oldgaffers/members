import axios from "axios";

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
  return axios.post(
    `https://5li1jytxma.execute-api.eu-west-1.amazonaws.com/default/${scope}/${subject}`,
    data,
    {
      headers: { 'content-type': 'application/json' }
    }
  );
}

export async function getFilterable() {
  return axios(`${boatRegisterHome}/boatregister/filterable.json`);
}
