import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridTreeNodeWithRender, GridCsvExportOptions, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
// import Contact from './Contact';
import MailIcon from "@mui/icons-material/Mail";
import { Member, areaAbbreviation } from './lib/membership.mts';
import { Boat } from './lib/api.mts';
import { UNKNOWN_DISTANCE, distanceFormatter /*, phoneGetter*/ } from './lib/utils.mts';
import RoleRestricted from './RoleRestricted';
import { Box } from '@mui/material';
import { ContactHelper } from './Contact';
import { useState } from 'react';

type MembersAndBoatsProps = {
  members: Member[],
  boats: Boat[],
  components?: any
}

function CustomToolbar() {
  const options: GridCsvExportOptions = {
    fields: ['lastname', 'name', 'member', 'telephone', 'town', 'boat', 'area', 'smallboats', 'younger_member'],
    fileName: 'ogamembers',
    utf8WithBom: true, // navigator.platform.toUpperCase().indexOf('WIN') >= 0,
  };
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton/>
      {<RoleRestricted role='editor'>
        <GridToolbarExport csvOptions={options}/>
      </RoleRestricted>}
    </GridToolbarContainer>
  );
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
}: MembersAndBoatsProps) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<number>(0);

  function boatGetter({ row }: { row: Member }) {
    const { id } = row;
    const theirBoats = boats.filter((b) => b.owners?.find((o) => o?.id === id));
    return theirBoats.map((b) => b.name).sort().join(', ');
  }

  function renderBoat(params: GridRenderCellParams<Boat, any, any, GridTreeNodeWithRender>) {
    return (<Typography variant="body2" fontStyle="italic">{params.value}</Typography>);
  }

  function renderLastname(params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) {
    return (<Typography variant="body2" fontWeight="bold">{params.value}</Typography>);
  }

  function onContact(params: GridRowParams<any>) {
    setContact(Number(params.id));
    setOpen(true);
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
      field: 'lastname', headerName: 'Last Name', renderCell: renderLastname,
    },
    {
      field: 'name',
      headerName: 'Given Name',
      valueGetter: ({row}) => `${row.salutation} ${row.firstname}`, 
      minWidth: 100,
      flex: 3,
    },
    { field: 'member', headerName: 'No' },
    /*{
      field: 'telephone', headerName: 'Telephone', valueGetter: phoneGetter, flex: 3,
    },*/
    {
      headerName: 'Contact',
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem icon={<MailIcon />} onClick={() => onContact(params)} label="contact" />,
      ]
    },
    { field: 'town', headerName: 'Town' },
    {
      field: 'proximity',
      headerName: 'Proximity',
      valueGetter: ({ row }) => row.proximity || UNKNOWN_DISTANCE,
      valueFormatter: distanceFormatter,
    },
    {
      field: 'boat',
      headerName: 'Boat Name',
      valueGetter: boatGetter,
      renderCell: renderBoat,
      minWidth: 100,
      flex: 4,
    },
    { field: 'areas', headerName: 'Areas', renderCell: areaFormatter },
    { field: 'area', headerName: 'Area', valueFormatter: (params) => areaAbbreviation(params.value), minWidth: 10, flex: 0.5 },
    { field: 'smallboats', headerName: 'SB', type: 'boolean', minWidth: 70, flex: 0.5 },
    { field: 'younger_member', headerName: 'YM', type: 'boolean', minWidth: 70, flex: 0.5 },
    {
      field: 'GDPR',
      headerName: 'GDPR',
      type: 'boolean',
      minWidth: 70,
      flex: 0.5,
    },
    {
      field: 'status',
      headerName: 'Status',
      type: 'boolean',
      minWidth: 70,
      flex: 0.5,
    },
  ];

  return (
    <Box height='100%'>
      <Box>
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
      </Box>
      <ContactHelper memberGoldId={contact} onClose={() => setOpen(false)} open={open} />
    </Box>
  );
}
