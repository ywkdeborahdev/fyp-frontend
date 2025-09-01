import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Box,
    Stack,
    TextField,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    Button,
    useMediaQuery,
    useTheme,
    FormHelperText
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Dayjs } from 'dayjs';

import { fetchMessagesByServer } from '../apiFunction/searchFunction';

interface LogEntry {
    logId: string;
    timestamp: string; // ISO string for simplicity
    server: string;
    message: string;
}

const server = [
    { id: 1, name: 'logUbuntuDemo1' },
    { id: 2, name: 'Server 2' },
    { id: 3, name: 'Server 3' },
]

const initialRows: LogEntry[] = [];

const columns: GridColDef[] = [
    {
        field: 'timestamp', headerName: 'Timestamp', width: 250, type: 'dateTime',
        // Convert Unix timestamp (seconds) to Date object for sorting/filtering
        valueGetter: (value, row) => (value ? new Date(value * 1000) : null),
        // valueFormatter: (value) => (value ? (value as Date).toISOString().replace(/\.\d{3}Z$/, 'Z') : ''),
        valueFormatter: (value) => {
            const date = value as Date | null;
            if (!date) return '';

            // Format date in HK timezone with offset, similar to ISO but localized
            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Asia/Hong_Kong',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZoneName: 'short',  // adds "HKT"
            };

            // Format date parts
            const formatter = new Intl.DateTimeFormat('en-CA', options);
            const formatted = formatter.format(date); // e.g. "2025-05-19, 16:45:00 HKT"

            // Convert to ISO-like by replacing comma with 'T' and removing space before timezone
            // Result: "2025-05-19T16:45:00HKT"
            return formatted.replace(', ', 'T').replace(' ', '');
        },
    },
    {
        field: 'server', headerName: 'Server Name', width: 150,
        valueGetter: (value) => {
            const serverId = Number(value);
            const serverName = server.find((s) => s.id === serverId)?.name;
            return serverName || 'Unknown';
        },
    },
    { field: 'message', headerName: 'Message', width: 400, flex: 1 },
];

type FormData = {
    // startDateTime: Dayjs | null;
    // endDateTime: Dayjs | null;
    server: number | null;
}

export default function LogDataGrid() {
    // State for filters
    const [formData, setFormData] = useState<FormData>({
        // startDateTime: null,
        // endDateTime: null,
        server: null
    });
    const [isMissingSelect, setIsMissingSelect] = useState(false);
    const [loading, setLoading] = useState(false);


    // Reset filters and show all rows
    const handleReset = () => {
        setFormData({
            // startDateTime: null,
            // endDateTime: null,
            server: null
        });
        setRows(initialRows);
    };

    const handleSubmit = async () => {

        if (!formData.server) {
            console.error('Server is required');
            // Handle error (e.g., show a notification)
            setIsMissingSelect(true);
            return;
        }
        setLoading(true);
        // console.log('Form submitted with data:', formData);
        try {
            const data = await fetchMessagesByServer(formData.server);
            // console.log('Fetched data:', data);
            if (data.success) {
                setRows(data.data);
            } else {
                console.error('Error fetching data:');
                // Handle error (e.g., show a notification)
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error (e.g., show a notification)
        }

        setLoading(false);

    }

    const handleSelectChange = ((e) => {
        setFormData({ ...formData, server: Number(e.target.value) });
        setIsMissingSelect(false);
    })


    // State for filtered rows
    const [rows, setRows] = useState(initialRows);


    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ height: 800, width: '100%', p: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={3} sx={{ mb: 2 }}>
                    {/* First Row - Date Pickers */}
                    <Stack direction="row" spacing={2}>

                        {/* to be resumed when time range is available */}
                        {/* <DateTimePicker
                            views={['year', 'day', 'hours', 'minutes', 'seconds']}
                            label="Start Date"
                            value={formData.startDateTime}
                            onChange={(newValue) => setFormData({ ...formData, startDateTime: newValue })}
                        /> */}
                        {/* <DateTimePicker
                            label="End Date"
                            value={formData.endDateTime}
                            onChange={(newValue) => setFormData({ ...formData, endDateTime: newValue })}
                        /> */}
                    </Stack>

                    {/* Second Row - Filters and Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: isSmallScreen ? 'column' : 'row',
                            justifyContent: 'space-between',
                            alignItems: isSmallScreen ? 'stretch' : 'center',
                            gap: 2,
                            width: '100%',
                        }}>
                        <Stack
                            direction={isSmallScreen ? 'column' : 'row'}
                            spacing={2}
                            sx={{ flexGrow: 1, width: isSmallScreen ? '100%' : 'auto' }}>

                            {/* //TODO: to be deleted when time range is available */}
                            {/* <DateTimePicker
                                views={['year', 'day', 'hours', 'minutes', 'seconds']}
                                label="Start Date"
                                value={formData.startDateTime}
                                onChange={(newValue) => setFormData({ ...formData, startDateTime: newValue })}
                            /> */}
                            {/* Server Select */}
                            <FormControl sx={{ minWidth: 200 }} error={isMissingSelect ? true : false}>
                                <InputLabel>Server</InputLabel>
                                <Select
                                    defaultValue={null}
                                    label="Server"
                                    value={formData.server || ''}
                                    onChange={handleSelectChange}
                                >
                                    <MenuItem value={server[0].id}>{server[0].name}</MenuItem>
                                    <MenuItem value={server[1].id}>{server[1].name}</MenuItem>
                                    <MenuItem value="3">Server 3</MenuItem>
                                </Select>
                                <FormHelperText>Required</FormHelperText>
                            </FormControl>
                        </Stack>

                        {/* Buttons */}
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                            >
                                Search
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </LocalizationProvider>

            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                getRowId={(row) => row.logId}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
                disableRowSelectionOnClick
                loading={loading}
                sx={{
                    // This is the new way to make the grid height fit its content
                    '&.MuiDataGrid-root': {
                        height: 'auto',
                    },
                }}
                slotProps={{
                    toolbar: {
                        csvOptions: { fileName: "log-export" },
                    },
                    loadingOverlay: {
                        variant: 'circular-progress',
                    }
                }}
                showToolbar
            />
        </Box>
    );
}