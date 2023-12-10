import { useCallback, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridCellModes, GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import Contact from './Contact';
import { Boat, boatUrl } from './lib/api.mts';
import { ownerValueGetter } from './lib/ownership.mts';
import { areaAbbreviation } from './lib/membership.mts';
import { distanceFormatter, distanceInNM } from './lib/utils.mts';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

function renderBoat(params: GridRenderCellParams<Boat, any, any, GridTreeNodeWithRender>) {
  return (<Typography variant="body2" fontStyle="italic">{params.value}</Typography>);
}

function boatFormatter(params: { value: any }) {
  return params.value;
}

const columns = (
  hire: boolean,
  crewWanted: boolean,
  showContactButton: boolean,
  proximityTo: { lat: number, lng: number }
): GridColDef<Boat>[] => {
  const col: GridColDef<Boat>[] = [
    {
      field: 'name', headerName: 'Boat', width: 150, valueFormatter: boatFormatter, renderCell: renderBoat,
    },
    { field: 'oga_no', headerName: 'No.', width: 90 },
    {
      field: 'owners', headerName: 'Owner', width: 320, valueGetter: ownerValueGetter,
    },
    {
      field: 'home_port', headerName: 'Home Port', width: 150,
    },
    {
      field: 'area', headerName: 'Area', width: 90,
    },
    {
      field: 'home_location',
      headerName: 'Proximity',
      width: 150,
      valueGetter: (params: { value: any }): number => {
        return distanceInNM(proximityTo, params.value);
      },
      valueFormatter: distanceFormatter,
    },
  ];
  if (hire) {
    col.push({
      field: 'hire',
      headerName: 'For Hire',
      width: 150,
      type: 'boolean',
      editable: true,
    });
  }
  if (crewWanted) {
    col.push({
      field: 'crewing',
      headerName: 'Crew Wanted',
      width: 150,
      type: 'boolean',
      editable: true,
    });
  }
  col.push({
    field: 'url',
    headerName: 'Details',
    width: 150,
    renderCell: (params: { row: { oga_no: number; }; }) => (
      <Button
        sx= {{padding:"5px"}}
        size="small"
        component="a"
        href={boatUrl(params.row.oga_no, {
          origin: '',
          pathname: ''
        })}
        variant="contained"
        color="primary"
      >
        More..
      </Button>
    ),
  });
  if (showContactButton) {
    col.push({
      field: 'data.email',
      headerName: 'Contact',
      width: 150,
      renderCell: (params) => <Contact member={params.row.owners[0].id} />,
    });
  }
  return col;
};

export default function BoatsAndOwners({
  boats = [],
  proximityTo,
}: { boats: Boat[], proximityTo: any }) {
  const [cellModesModel, setCellModesModel] = useState({});

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

      setCellModesModel((prevModel: { [id: string]: any}) => ({
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
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          cellModesModel={cellModesModel}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          getRowId={(row) => row.oga_no}
          rows={boats}
          columns={columns(false, false, true, proximityTo)}
          slots={{ toolbar: CustomToolbar }}
          autoHeight
          initialState={{
            sorting: {
              // sortModel: [{ field: 'name', sort: 'asc' }, { field: 'oga_no', sort: 'asc' }],
              sortModel: [{ field: 'name', sort: 'asc' }],
            },
          }}
        />
      </div>
    </div>
  );
}
