import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridTreeNodeWithRender, GridCsvExportOptions } from '@mui/x-data-grid';
import Contact from './Contact';
import { Member, areaAbbreviation } from './lib/membership.mts';
import { Boat } from './lib/api.mts';
import { distanceFormatter, distanceInNM, phoneGetter } from './lib/utils.mts';
import RoleRestricted from './RoleRestricted';

type MembersAndBoatsProps = {
  members: Member[],
  boats: Boat[],
  postcodes?: any[],
  components?: any
  mylocation?: any
}

function CustomToolbar() {
  const options: GridCsvExportOptions = {
    fields: ['lastname', 'name', 'member', 'telephone', 'town', 'boat', 'area', 'smallboats'],
    fileName: 'ogamembers',
    utf8WithBom: true, // navigator.platform.toUpperCase().indexOf('WIN') >= 0,
  };
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton/>
      <RoleRestricted role='editor'>
        <GridToolbarExport csvOptions={options}/>
      </RoleRestricted>
    </GridToolbarContainer>
  );
}

function nameGetter({ row }: { row: Member }) {
  return `${row.salutation} ${row.firstname}`;
}

function areaFormatter(params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) {
  const [area, ...others] = params.value.split(',');
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
  return (<Typography variant="body2">{params.value}</Typography>);
}

export default function MembersAndBoats({
  members = [],
  boats = [],
  postcodes = [],
  mylocation,
}: MembersAndBoatsProps) {

  function distanceGetter(params: { value: string; }): number {
    if (mylocation?.longitude) {
      const rec = postcodes.find((pc) => pc.query === params.value);
      if (rec?.result?.longitude) {        
        return distanceInNM(mylocation, rec.result);
      }
    }
    return 99999;
  }

  function boatGetter({ row }: { row: Member }) {
    const { id } = row;
    const theirBoats = boats.filter((b) => b.owners?.find((o) => o?.id === id));
    return theirBoats.map((b) => b.name).sort().join(', ');
  }

  function renderBoat(params: GridRenderCellParams<Boat, any, any, GridTreeNodeWithRender>) {
    return (<Typography variant="body2" fontStyle="italic">{params.value}</Typography>);
  }

  function boatFormatter(params: { value: string; }) {
    return params.value;
  }

  function renderLastname(params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) {
    return (<Typography variant="body2" fontWeight="bold">{params.value}</Typography>);
  }

  function lastnameFormatter(params: { value: string; }) {
    return params.value;
  }

  function smallboatsFormatter(params: { value: boolean; }) {
    return params.value ? '✓' : '✗';
  }

  const members2 = members.map((m) => {
    const main = areaAbbreviation(m.area ?? '');
    const others = (m.interests ?? []).filter((o) => o !== main);
    if (others.length > 0) {
      const a = [main, ...others].join(',');
      // console.log(a)
      return { ...m, areas: a };
    }
    return { ...m, areas: main };
  });

  const columns: GridColDef<any>[] = [
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
      renderCell: ({ row }: { row: { id: number } }) => <Contact memberGoldId={row.id} />,
    },
    { field: 'town', headerName: 'Town', width: 120 },
    {
      field: 'postcode',
      headerName: 'Proximity',
      width: 160,
      valueGetter: distanceGetter,
      valueFormatter: distanceFormatter,
    },
    {
      field: 'boat', headerName: 'Boat Name', width: 200, valueGetter: boatGetter, valueFormatter: boatFormatter, renderCell: renderBoat,
    },
    {
      field: 'areas', headerName: 'Areas', width: 100, renderCell: areaFormatter,
    },
    { field: 'area', headerName: 'Area', valueFormatter: (params) => areaAbbreviation(params.value) },
    { field: 'smallboats', headerName: 'SB', valueFormatter: smallboatsFormatter },
  ];

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          rows={members2}
          columns={columns}
          slots={{ toolbar: CustomToolbar }}
          autoHeight
          initialState={{
            columns: {
              columnVisibilityModel: { area: false },
            },
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
