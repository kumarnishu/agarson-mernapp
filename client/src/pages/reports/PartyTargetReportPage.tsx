import { Button,  Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { GetPartyTargetReports } from '../../services/ErpServices'
import { UserContext } from '../../contexts/userContext'
import { Download } from '@mui/icons-material'
import ExportToExcel from '../../utils/ExportToExcel'
import AlertBar from '../../components/snacks/AlertBar'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { GetPartyTargetReportDto, GetPartyTargetReportFromExcelDto } from '../../dtos'
import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import { BackendError } from "../.."
import {  CircularProgress, Snackbar } from "@mui/material"
import { Upload } from "@mui/icons-material"
import { BulkPartyTargetFromExcel } from "../../services/ErpServices"

const FileInput = styled.input`
background:none;
color:blue;
`
function UploadPartyTargetButton() {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (BulkPartyTargetFromExcel)
    const [file, setFile] = React.useState<File | null>(null)


    function handleFile() {
        if (file) {
            let formdata = new FormData()
            formdata.append('file', file)
            mutate(formdata)
        }
    }
    React.useEffect(() => {
        if (file) {
            handleFile()
        }
    }, [file])


    return (
        <>

            <Snackbar
                open={isSuccess}
                autoHideDuration={6000}
                onClose={() => setFile(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                message="Uploaded Successfuly wait for some minutes"
            />

            <Snackbar
                open={isError}
                autoHideDuration={6000}
                onClose={() => setFile(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                message={error?.response.data.message}
            />
            {
                isLoading ?
                    <CircularProgress />
                    :
                    <>
                        <Button
                            component="label"

                        >
                            <Upload />
                            <FileInput
                                id="upload_input"
                                hidden
                                type="file" required name="file" onChange={
                                    (e: any) => {
                                        if (e.currentTarget.files) {
                                            setFile(e.currentTarget.files[0])
                                        }
                                    }}>
                            </FileInput >
                        </Button>
                    </>
            }
        </>
    )
}


export default function PartyTargetReportPage() {
    const [reports, setReports] = useState<GetPartyTargetReportDto[]>([])
    const { user } = useContext(UserContext)
    const [sent, setSent] = useState(false)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetPartyTargetReportDto[]>, BackendError>("party_target_reports", GetPartyTargetReports)
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const columns = useMemo<MRT_ColumnDef<GetPartyTargetReportDto>[]>(
        //column definitions...
        () => [
            {
                accessorKey: 'created_at',
                header: 'Create Date',
                
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.created_at || "" }).filter(onlyUnique),
                aggregationFn: 'count',
                size: 120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'PARTY',
                header: 'PARTY',
                size: 350,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.PARTY }).filter(onlyUnique),
                aggregationFn: 'count',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
            },
           
            {
                accessorKey: 'STATION',
                header: 'Station',
                filterVariant: 'multi-select',
                aggregationFn: 'count',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                filterSelectOptions: reports.map((i) => { return i.STATION }).filter(onlyUnique)
            },
            {
                accessorKey: 'SALES_OWNER',
                header: 'Sales Owner',
                filterVariant: 'multi-select',
                aggregationFn: 'count',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                filterSelectOptions: reports.map((i) => { return i.SALES_OWNER }).filter(onlyUnique)
            },
            {
                accessorKey: 'report_owner',
                header: 'State',
                filterVariant: 'multi-select',
                aggregationFn: 'count',
                Footer: <b>Total</b>,
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                filterSelectOptions: reports.map((i) => { return i.report_owner }).filter(onlyUnique)
            },
            {
                accessorKey: 'All_TARGET',
                header: 'ALL TARGET',
                aggregationFn: 'count',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'TARGET',
                header: 'TARGET',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.TARGET) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'PROJECTION',
                header: 'Projection',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.PROJECTION) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'GROWTH',
                header: 'Growth',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.GROWTH) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'TARGET_ACHIEVE',
                header: 'Target Achieved',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.TARGET_ACHIEVE) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'TOTAL_SALE_OLD',
                header: 'Total Old Sale',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.TOTAL_SALE_OLD) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'TOTAL_SALE_NEW',
                header: 'Total Sale New',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.TOTAL_SALE_NEW) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Apr',
                header: 'L-Apr',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Apr) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Apr',
                header: 'C-APr',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Apr) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_May',
                header: 'L-May',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_May) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_May',
                header: 'C-MAY',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_May) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Jun',
                header: 'L-JUN',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Jun) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Jun',
                header: 'C-JUN',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Jun) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Jul',
                header: 'L-JUL',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Jul) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Jul',
                header: 'C-JUL',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Jul) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Aug',
                header: 'L-AUG',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Aug) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Aug',
                header: 'C-AUG',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Aug) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Sep',
                header: 'L-SEP',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Sep) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Sep',
                header: 'C-SEP',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Sep) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Oct',
                header: 'L-OCT',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Oct) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Oct',
                header: 'C-OCT',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Oct) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Nov',
                header: 'L-NOV',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Nov) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Nov',
                header: 'C-NOV',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Nov) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Dec',
                header: 'L-DEC',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Dec) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Dec',
                header: 'C-DEC',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Dec) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Jan',
                header: 'L-JAN',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Jan) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Jan',
                header: 'C-JAN',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Jan) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Feb',
                header: 'L-FEB',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Feb) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Feb',
                header: 'C-FEB',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Feb) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Last_Mar',
                header: 'L-MAR',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Last_Mar) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'Cur_Mar',
                header: 'C-,MAR',
                aggregationFn: 'sum',
                size:120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.Cur_Mar) }, 0).toFixed()}</b>
            },
        ],
        [reports,],
        //end
    );


    function handleExcel() {
        try {
            let data: GetPartyTargetReportFromExcelDto[] = [
                {
                    slno: "1",
                    PARTY: "agarson shoes",
                    Create_Date: "20-07-2024",
                    STATION: "DELHI",
                    SALES_OWNER: "DELHI",
                    report_owner: "DELHI",
                    All_TARGET: "",
                    TARGET: 0,
                    PROJECTION: 0,
                    GROWTH: 0,
                    TARGET_ACHIEVE: 0,
                    TOTAL_SALE_OLD: 0,
                    TOTAL_SALE_NEW: 0,
                    Last_Apr: 0,
                    Cur_Apr: 0,
                    Last_May: 0,
                    Cur_May: 0,
                    Last_Jun: 0,
                    Cur_Jun: 0,
                    Last_Jul: 0,
                    Cur_Jul: 0,
                    Last_Aug: 0,
                    Cur_Aug: 0,
                    Last_Sep: 0,
                    Cur_Sep: 0,
                    Last_Oct: 0,
                    Cur_Oct: 0,
                    Last_Nov: 0,
                    Cur_Nov: 0,
                    Last_Dec: 0,
                    Cur_Dec: 0,
                    Last_Jan: 0,
                    Cur_Jan: 0,
                    Last_Feb: 0,
                    Cur_Feb: 0,
                    Last_Mar: 0,
                    Cur_Mar: 0,
                }
            ]
            ExportToExcel(data, "party_target_template")
            setSent(true)
        }
        catch (err) {
            console.log(err)
            setSent(false)
        }
    }

    useEffect(() => {
        if (isSuccess && data) {
            setReports(data.data);
        }
    }, [isSuccess]);

    useEffect(() => {
        //scroll to the top of the table when the sorting changes
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting]);

    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover', 
        data: reports, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '64vh' }
        }),
        muiTableHeadRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white'
            },
        }),
        muiTableBodyCellProps: () => ({
            sx: {
                border: '1px solid #c2beba;',
            },
        }),
        muiPaginationProps: {
            rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
            shape: 'rounded',
            variant: 'outlined',
        },
        initialState: {
            density: 'compact',  pagination: { pageIndex: 0, pageSize: 7000 }
        },
        enableGrouping: true,
        enableRowSelection: true,
        manualPagination: false,
        enablePagination: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        enableTableFooter: true,
        enableRowVirtualization: true,
        rowVirtualizerInstanceRef, //optional
        rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
        columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
        onSortingChange: setSorting,
        state: { isLoading, sorting }
    });


    return (
        <>
            {sent && <AlertBar message="File Exported Successfuly" color="success" />}

            <Stack
                spacing={2}
                padding={1}
                direction="row"
                justifyContent="space-between"
                alignItems={'center'}
            >
                <Typography
                    variant={'h6'}
                    component={'h1'}
                    sx={{ pl: 1 }}
                >
                    PARTY TARGET {new Date().getMonth() < 3 ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}` : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                </Typography>
                <Stack direction={'row'} gap={2} alignItems={'center'}>
                    <>
                        {user?.assigned_permissions.includes("party_target_create") && <UploadPartyTargetButton />}
                        {user?.assigned_permissions.includes("party_target_create") && <Button size="small" variant="outlined" startIcon={<Download />} onClick={handleExcel}> Template</Button>}
                    </>
                </Stack>


            </Stack >

            {/* table */}
            <MaterialReactTable table={table} />
        </>

    )

}

