import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useCallback, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridCellModes } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import Contact from './Contact';
import { Boat, boatUrl } from './lib/api.mts';
import { ownerValueGetter } from './lib/ownership.mts';

type BoatsAndOwnersProps = {
  boats: Boat[]
  components?: any
  onSetHireOptions?: Function
  onsetCrewingOptions?: Function
  showContactButton?: boolean
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

function renderBoat(params: { value: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) {
  return (<Typography variant="body2" fontStyle="italic">{params.value}</Typography>);
}

function boatFormatter(params: { value: any; }) {
  return params.value;
}

const columns = (hire: Function | undefined, crewWanted: Function | undefined, showContactButton: boolean) => {
  const col = [
    {
      field: 'name', headerName: 'Boat', width: 150, valueFormatter: boatFormatter, renderCell: renderBoat,
    },
    { field: 'oga_no', headerName: 'No.', width: 90 },
    {
      field: 'owners', headerName: 'Owner', width: 350, valueGetter: ownerValueGetter,
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
    headerName: 'View in the Boat Register',
    width: 250,
    renderCell: (params: { row: { oga_no: number; }; }) => (
      <Button
        sx= {{padding:"5px"}}
        size="small"
        component="a"
        href={boatUrl(params.row.oga_no, {})}
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
      renderCell: (params: { row: { id: number; }; }) => <Contact member={params.row.id} />,
    });
  }
  return col;
};

export default function BoatsAndOwners({
  boats = [],
  components = { Toolbar: CustomToolbar },
  onSetHireOptions,
  onsetCrewingOptions,
  showContactButton = true,
}: BoatsAndOwnersProps) {
  const [cellModesModel, setCellModesModel] = useState({});

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
          columns={columns(onSetHireOptions, onsetCrewingOptions, showContactButton)}
          components={components}
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
