import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridTreeNodeWithRender, GridCsvExportOptions, GridActionsCellItem, GridRowParams, GridPaginationModel, GridFilterModel, GridSortModel } from '@mui/x-data-grid';
// import Contact from './Contact';
import MailIcon from "@mui/icons-material/Mail";
import { Member, areaAbbreviation } from './lib/membership.mts';
import { Boat } from './lib/api.mts';
import { UNKNOWN_DISTANCE, distanceFormatter, phoneGetter } from './lib/utils.mts';
import RoleRestricted from './RoleRestricted';
import { Box } from '@mui/material';
import { ContactHelper } from './Contact';
import { useEffect, useState } from 'react';

type MembersAndBoatsProps = {
  members: Member[],
  boats: Boat[],
  components?: any
  rowCount?: number
  onPaginationModelChange: (model: GridPaginationModel) => void
  paginationModel: GridPaginationModel
  filterModel: GridFilterModel
  onFilterModelChange: (model: GridFilterModel) => void
  sortModel: GridSortModel
  onSortModelChange: (model: GridSortModel) => void

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
  rowCount,
  onPaginationModelChange,
  paginationModel,
  onFilterModelChange,
  onSortModelChange,
  filterModel,
  sortModel,
}: MembersAndBoatsProps) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<number>(0);
  const [rowCountState, setRowCountState] = useState<number|undefined>(rowCount);

  useEffect(() => {
    setRowCountState((prevRowCountState) =>
      rowCount !== undefined ? rowCount : prevRowCountState,
    );
  }, [rowCount, setRowCountState]);

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
      field: 'firstname',
      headerName: 'Given Name',
      valueGetter: ({row}) => `${row.salutation} ${row.firstname}`, 
      minWidth: 100,
      flex: 3,
    },
    { field: 'member', headerName: 'No' },
    {
      field: 'telephone', headerName: 'Telephone', valueGetter: phoneGetter, flex: 3, filterable: false,
    },
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
      filterable: false,
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
    // { field: 'area', headerName: 'Area', valueFormatter: (params) => areaAbbreviation(params.value), minWidth: 10, flex: 2 },
    { field: 'smallboats', headerName: 'SB', type: 'boolean', minWidth: 70, flex: 0.5 },
  ];

  return (
    <Box height='100%'>
      <Box>
        <DataGrid
          filterMode='server'
          paginationMode='server'
          sortingMode='server'
          rowCount={rowCountState}
          filterModel={filterModel}
          onFilterModelChange={onFilterModelChange}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
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
