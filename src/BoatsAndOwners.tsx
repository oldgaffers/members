import { useCallback, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridCellModes, GridColDef, GridRenderCellParams, GridTreeNodeWithRender, GridToolbarExport, GridCsvExportOptions, GridRowParams, GridActionsCellItem } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import MailIcon from "@mui/icons-material/Mail";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import { Boat, boatUrl } from './lib/boatregister-api.mts';
import { ownerValueGetter } from './lib/ownership.mts';
import { areaAbbreviation } from './lib/membership.mts';
import { distanceFormatter, distanceInNM } from './lib/utils.mts';
import RoleRestricted from './RoleRestricted';
import { ContactHelper } from './Contact';

function CustomToolbar() {
  const options: GridCsvExportOptions = {
    fields: ['name', 'oga_no', 'owners', 'home_port', 'area', 'generic_type', 'updated_at'],
    fileName: 'ogaboats',
    utf8WithBom: true, // navigator.platform.toUpperCase().indexOf('WIN') >= 0,
  };
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <RoleRestricted role='editor'>
        <GridToolbarExport csvOptions={options} />
      </RoleRestricted>
    </GridToolbarContainer>
  );
}

function CustomNoRowsOverlay() {
  return <Box marginTop={2} textAlign='center'>Please Wait</Box>
}

function renderBoat(params: GridRenderCellParams<Boat, any, any, GridTreeNodeWithRender>) {
  return (<Typography variant="body2" fontStyle="italic">{params.value}</Typography>);
}

function gotoboatregister(params: GridRowParams<Boat>) {
  window.open(boatUrl(params.row.oga_no, {
    origin: '',
    pathname: ''
  }), '_blank');
}

const columns = (
  hire: boolean,
  crewWanted: boolean,
  showContactButton: boolean,
  proximityTo: { lat: number, lng: number } | undefined,
  onContact: any,
): GridColDef<Boat>[] => {
  const col: GridColDef<Boat>[] = [
    {
      field: 'name', headerName: 'Boat', renderCell: renderBoat, minWidth: 100,
    },
    { field: 'oga_no', headerName: 'No.', minWidth: 60 },
    {
      field: 'owners', headerName: 'Owner', valueGetter: ownerValueGetter, minWidth: 200, flex: 2,
    },
    {
      field: 'home_port', headerName: 'Home Port', minWidth: 80, flex: 1,
    },
    {
      field: 'generic_type', headerName: 'Generic Type', minWidth: 20, flex: 1,
    },
    {
      field: 'updated_at', headerName: 'Modified', minWidth: 40, flex: 1,
    },
  ];
  if (proximityTo) {
    col.push({
      field: 'home_location',
      headerName: 'Proximity',
      minWidth: 50,
      valueGetter: (value: any): number => {
        return distanceInNM(proximityTo, params.value);
      },
      valueFormatter: distanceFormatter,
    });
  }
  col.push({ field: 'area', headerName: 'Area' });
  if (hire) {
    col.push({
      field: 'hire',
      minWidth: 50,
      headerName: 'For Hire',
      type: 'boolean',
      editable: true,
    });
  }
  if (crewWanted) {
    col.push({
      field: 'crewing',
      headerName: 'Crew Wanted',
      type: 'boolean',
      minWidth: 50,
      editable: true,
    });
  }
  if (showContactButton) {
    col.push({
      headerName: 'Actions',
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem icon={<ReadMoreIcon />} onClick={() => gotoboatregister(params)} label="more" />,
        <GridActionsCellItem icon={<MailIcon />} onClick={() => onContact(params)} label="contact" />,
      ]
    });
  } else {
    col.push({
      headerName: 'More',
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem icon={<ReadMoreIcon />} onClick={() => onContact(params)} label="more" />,
      ]
    });
  }
  return col;
};

export default function BoatsAndOwners({
  boats = [],
  proximityTo,
}: { boats: Boat[], proximityTo?: { lat: number, lng: number } }) {
  const [cellModesModel, setCellModesModel] = useState({});
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<number>(0);

  function handleContact(params: GridRowParams<any>) {
    setContact(Number(params.id));
    setOpen(true);
  }

  boats.forEach((boat) => {
    boat.area = areaAbbreviation(boat.owners[0].area);
  });

  const handleCellClick = useCallback(
    (params: any, event: any) => {
      if (!params.isEditable) {
        return;
      }

      // Ignore portal
      if (!event.currentTarget.contains(event.target)) {
        return;
      }

      setCellModesModel((prevModel: { [id: string]: any }) => ({
        // Revert the mode of the other cells from other rows
        ...Object.keys(prevModel).reduce(
          (acc, id) => ({
            ...acc,
            [id]: Object.keys(prevModel[id]).reduce(
              (acc2, field) => ({
                ...acc2,
                [field]: { mode: GridCellModes.View },
              }),
              {},
            ),
          }),
          {},
        ),
        [params.id]: {
          // Revert the mode of other cells in the same row
          ...Object.keys(prevModel[params.id] || {}).reduce(
            (acc, field) => ({ ...acc, [field]: { mode: GridCellModes.View } }),
            {},
          ),
          [params.field]: { mode: GridCellModes.View },
        },
      }));
    },
    [],
  );

  const handleCellModesModelChange = useCallback(
    (newModel: any) => {
      setCellModesModel(newModel);
    },
    [],
  );

  return (
    <Box sx={{ width: '90vw' }}>
      <DataGrid
        cellModesModel={cellModesModel}
        onCellModesModelChange={handleCellModesModelChange}
        onCellClick={handleCellClick}
        getRowId={(row) => row.oga_no}
        rows={boats}
        columns={columns(false, false, true, proximityTo, handleContact)}
        slots={{ toolbar: CustomToolbar, noRowsOverlay: CustomNoRowsOverlay }}
        autoHeight
        initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }}
      />
      <ContactHelper memberGoldId={contact} onClose={() => setOpen(false)} open={open} />
    </Box>
  );
}
