import {   Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { GetPendingOrdersReports } from '../../services/ErpServices'
import { UserContext } from '../../contexts/userContext'
import { Download } from '@mui/icons-material'
import ExportToExcel from '../../utils/ExportToExcel'
import AlertBar from '../../components/snacks/AlertBar'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { GetPendingOrdersReportFromExcelDto } from '../../dtos'

import { AxiosResponse } from "axios"
import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import { BackendError } from "../.."
import { Button, CircularProgress, Snackbar } from "@mui/material"
import { Upload } from "@mui/icons-material"
import { BulkPendingOrderFromExcel } from "../../services/ErpServices"

const FileInput = styled.input`
background:none;
color:blue;
`
function UploadPendingOrdersButton() {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (BulkPendingOrderFromExcel)
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
                            variant="contained"
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
export default function PendingOrdersReport() {
    const [reports, setReports] = useState<GetPendingOrdersReportFromExcelDto[]>([])
    const { user } = useContext(UserContext)
    const [sent, setSent] = useState(false)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetPendingOrdersReportFromExcelDto[]>, BackendError>("pending_order_reports", GetPendingOrdersReports)
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const [sorting, setSorting] = useState<MRT_SortingState>([]);

    const columns = useMemo<MRT_ColumnDef<GetPendingOrdersReportFromExcelDto>[]>(
        //column definitions...
        () => [
            {
                accessorKey: 'created_at',
                header: 'Created On',
                minSize: 120,
                grow:false,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.created_at || "" }).filter(onlyUnique)
            },
            {
                accessorKey: 'report_owner',
                minSize: 150,
                grow:false,
                header: 'State',
                filterVariant: 'multi-select',
                aggregationFn: 'count',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
                filterSelectOptions: reports.map((i) => { return i.report_owner }).filter(onlyUnique)
            },
            {
                accessorKey: 'account',
                minSize: 200,
                grow:false,
                header: 'Account',
                aggregationFn: 'count',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.account }).filter(onlyUnique)
            },
            {
                accessorKey: 'product_family',
                minSize: 200,
                grow:false,
                header: 'Product Family',
                aggregationFn: 'count',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.product_family }).filter(onlyUnique)
            },

            {
                accessorKey: 'article',
                minSize: 200,
                grow:false,
                header: 'Article',

                aggregationFn: 'count',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.article }).filter(onlyUnique)
            },
            {
                accessorKey: 'total',
                header: 'Total',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.total) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },

            {
                accessorKey: 'size5',
                header: '5',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size5) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size6',
                header: '6',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size6) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size7',
                header: '7',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size7) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size8',
                header: '8',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size8) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size9',
                header: '9',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size9) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size10',
                header: '10',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size10) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size11',
                header: '11',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size11) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size12_24pairs',
                header: '12x24',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size12_24pairs) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size13',
                header: '13',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size13) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size11x12',
                header: '11x12',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size11x12) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size3',
                header: '3',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size3) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size4',
                header: '4',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size4) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size6to10',
                header: '6-10',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size6to10) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size7to10',
                header: '7-10',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size7to10) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size8to10',
                header: '8-10',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size8to10) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size4to8',
                header: '4-8',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size4to8) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size6to9',
                header: '6-9',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size6to9) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size5to8',
                header: '5-8',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size5to8) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size6to10A',
                header: '6-10A',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size6to10A) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size7to10B',
                header: '7-10B',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size7to10B) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size6to9A',
                header: '6-9A',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size6to9A) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size11close',
                header: '11 Close',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size11close) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size11to13',
                header: '11-13',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size11to13) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            },
            {
                accessorKey: 'size3to8',
                header: '3-8',
                minSize: 120,
                grow:false,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.size3to8) }, 0).toFixed()}</b>,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
            }
        ],
        [reports],
        //end
    );


    function handleExcel() {
        try {
            let data: GetPendingOrdersReportFromExcelDto[] = [
                {
                    report_owner: "DELHI",
                    account: "agarsoin safety",
                    product_family: "power black",
                    article: "power",
                    size5: 0,
                    size6: 0,
                    size7: 0,
                    size8: 0,
                    size9: 0,
                    size10: 0,
                    size11: 0,
                    size12_24pairs: 0,
                    size13: 0,
                    size11x12: 0,
                    size3: 0,
                    size4: 0,
                    size6to10: 0,
                    size7to10: 0,
                    size8to10: 0,
                    size4to8: 0,
                    size6to9: 0,
                    size5to8: 0,
                    size6to10A: 0,
                    size7to10B: 0,
                    size6to9A: 0,
                    size11close: 0,
                    size11to13: 0,
                    size3to8: 0
                }
            ]
            ExportToExcel(data, "pending_order_template")
            setSent(true)
        }
        catch (err) {
            console.log(err)
            setSent(false)
        }
    }

    useEffect(() => {
        if (data && isSuccess) {
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
            density: 'compact', pagination: { pageIndex: 0, pageSize: 7000 }
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
                    Pending Orders {new Date().getMonth() < 3 ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}` : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                </Typography>
                <Stack direction={'row'} gap={2} alignItems={'center'}>
                    {<>
                        {user?.assigned_permissions.includes("pending_orders_create") && <UploadPendingOrdersButton />}
                        {user?.assigned_permissions.includes("pending_orders_create") && <Button variant="outlined" startIcon={<Download />} onClick={handleExcel}> Template</Button>}
                    </>}
                </Stack>


            </Stack >

             <MaterialReactTable table={table} />
        </>

    )

}

