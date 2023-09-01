import React from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { boatUrl } from '../lib/api';
import Contact from './Contact';

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
        </GridToolbarContainer>
    );
}

function joinList(strings, sep, lastSep) {
    if (strings.length === 1) {
        return strings[0];
    }
    return strings.slice(0, -1).join(sep) + lastSep + strings.slice(-1);
}

function namelist(value) {
    const lastNames = [...new Set(value.map((owner) => owner?.lastname))]?.filter((n) => n);
    const r = joinList(
        lastNames.map((ln) => {
            const fn = value.filter((o) => o?.lastname === ln)?.map((o) => o.firstname);
            const r = `${joinList(fn, ', ', ' & ')} ${ln}`;
            return r;
        }),
        ', ',
        ' & '
    );
    return r;
}

function ownerValueGetter({ value }) {
    if (!value) {
        return '';
    }
    const visible = value.filter((m) => m.GDPR);
    if (visible.length === 0) {
        return '(private)';
    }
    const names = namelist(visible);
    if (visible.length === value.length) {
        return names;
    }
    return `${names}, and other private owners`;
}

function renderBoat(params) {
    return (<Typography variant={'body2'} fontStyle={'italic'}>{params.value}</Typography>);
}

function boatFormatter(params) {
    return params.value;
}

const columns = (hire, crewWanted, showContactButton) => {
    const col = [
        { field: 'name', headerName: 'Boat', width: 150, valueFormatter: boatFormatter, renderCell: renderBoat },
        { field: 'oga_no', headerName: 'No.', width: 90 },
        { field: 'owners', headerName: 'Owner', width: 350, valueGetter: ownerValueGetter },
    ];
    if (hire) {
        col.push({
            field: 'hire',
            headerName: 'Set Hire Options',
            width: 150,
            renderCell: (params) => <Button
                padding='5px'
                size="small"
                variant="contained"
                color="primary"
                onClick={hire}
            >Set..</Button>,
        });
    }
    if (crewWanted) {
        col.push({
            field: 'crewing',
            headerName: 'Set Crewing Options',
            width: 150,
            renderCell: (params) => <Button
                padding='5px'
                size="small"
                variant="contained"
                color="primary"
                onClick={crewWanted}
            >Set..</Button>,
        });
    }
    col.push({
        field: 'url',
        headerName: 'View in the Boat Register',
        width: 250,
        renderCell: (params) => <Button
            padding='5px'
            size="small"
            component={'a'}
            href={boatUrl(params.row.oga_no, {})}
            variant="contained"
            color="primary"
        >More..</Button>,
    });
    if (showContactButton) {
        col.push({
            field: 'data.email',
            headerName: 'Contact',
            width: 150,
            renderCell: (params) => <Contact member={params.row.id} />,
        });
    }
    return col;
}

export default function BoatsAndOwners({
    boats = [],
    components = { Toolbar: CustomToolbar },
    onSetHireOptions,
    onsetCrewingOptions,
    showContactButton=true,
 }) {

    return (
        <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <DataGrid
                    getRowId={(row) => row.oga_no}
                    rows={boats}
                    columns={columns(onSetHireOptions, onsetCrewingOptions, showContactButton)}
                    components={components}
                    autoHeight={true}
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
