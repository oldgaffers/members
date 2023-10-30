import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid';
import { parsePhoneNumber } from 'awesome-phonenumber';
import distance from '@turf/distance';
import Contact from './Contact';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

function nameGetter({ row }) {
  return `${row.salutation} ${row.firstname}`;
}

function fettlePhone(n, area) {
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

function formatPhone(pn) {
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

function phoneGetter({ row }) {
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

function areaAbbreviation(value) {
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

function areaFormatter({ value }) {
  const [area, ...others] = value.split(',');
  if (others.length > 0) {
    return (
      <>
        <Typography variant="body2" fontWeight="bold">{area}</Typography>
        <Typography variant="body2">
          ,
          {others.join(',')}
        </Typography>
      </>
    );
  }
  return (<Typography variant="body2">{value}</Typography>);
}

export default function MembersAndBoats({
  members = [],
  boats = [],
  postcodes = [],
  components = { Toolbar: CustomToolbar },
}) {
  const { user } = useAuth0();
  const id = user['https://oga.org.uk/id'];
  const me = members.find((m) => m.id === id);
  // console.log('YearbookBoats', members, boats);
  const r = postcodes.find((pc) => pc.query === me.postcode);
  const mylocation = r?.result;

  function boatGetter({ row }) {
    const { id } = row;
    const theirBoats = boats.filter((b) => b.owners?.find((o) => o?.id === id));
    return theirBoats.map((b) => b.name).sort().join(', ');
  }

  function renderBoat(params) {
    return (<Typography variant="body2" fontStyle="italic">{params.value}</Typography>);
  }

  function boatFormatter(params) {
    return params.value;
  }

  function renderLastname(params) {
    return (<Typography variant="body2" fontWeight="bold">{params.value}</Typography>);
  }

  function lastnameFormatter(params) {
    return params.value;
  }

  function smallboatsFormatter(params) {
    return params.value ? '✓' : '✗';
  }

  function postCodeGetter(params) {
    if (mylocation?.longitude) {
      const rec = postcodes.find((pc) => pc.query === params.value);
      if (rec?.result?.longitude) {
        const from = [mylocation.longitude, mylocation.latitude];
        const to = [rec.result.longitude, rec.result.latitude];
        const d = distance(from, to, { units: 'miles' });
        if (d > 1000) {
          console.log('BIG', rec.result);
        }
        return Math.floor(d);
      }
    }
    return 99999;
  }

  const members2 = members.map((m) => {
    const main = areaAbbreviation(m.area);
    const others = m.interests.filter((o) => o !== main);
    if (others.length > 0) {
      const a = [main, ...others].join(',');
      // console.log(a)
      return { ...m, areas: a };
    }
    return { ...m, areas: main };
  });

  const columns = [
    {
      field: 'lastname', headerName: 'Last Name', width: 90, valueFormatter: lastnameFormatter, renderCell: renderLastname,
    },
    {
      field: 'name', headerName: 'Given Name', width: 130, valueGetter: nameGetter,
    },
    { field: 'member', headerName: 'No', width: 90 },
    {
      field: 'telephone', headerName: 'Telephone', width: 200, valueGetter: phoneGetter,
    },
    {
      field: 'url',
      headerName: 'Details',
      width: 150,
      renderCell: (params) => <Contact member={params.row.id} />,
    },
    { field: 'town', headerName: 'Town', width: 120 },
    {
      field: 'postcode',
      headerName: 'Dst from me',
      width: 120,
      valueGetter: postCodeGetter,
      valueFormatter: (params) => ((params.value !== 99999) ? `${params.value} miles` : '?'),
    },
    {
      field: 'boat', headerName: 'Boat Name', flex: 1, valueGetter: boatGetter, valueFormatter: boatFormatter, renderCell: renderBoat,
    },
    {
      field: 'areas', headerName: 'Areas', width: 100, renderCell: areaFormatter,
    },
    { field: 'smallboats', headerName: 'SB', valueFormatter: smallboatsFormatter },
  ];

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          rows={members2}
          columns={columns}
          components={components}
          autoHeight
          initialState={{
            sorting: {
              // sortModel: [{ field: 'lastname', sort: 'asc' }, { field: 'member', sort: 'asc' }, { field: 'id', sort: 'asc' }],
              sortModel: [{ field: 'lastname', sort: 'asc' }],
            },
          }}
        />
      </div>
    </div>
  );
}
