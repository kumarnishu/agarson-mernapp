import { Button,  Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo,  useRef,  useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { GetBillsAgingReports } from '../../services/ErpServices'
import { UserContext } from '../../contexts/userContext'
import { Download } from '@mui/icons-material'
import ExportToExcel from '../../utils/ExportToExcel'
import AlertBar from '../../components/snacks/AlertBar'
import { MaterialReactTable, MRT_ColumnDef,  MRT_RowVirtualizer,  MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { GetBillsAgingReportFromExcelDto } from '../../dtos'
import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import {  CircularProgress, Snackbar } from "@mui/material"
import { Upload } from "@mui/icons-material"
import { BulkBillsAgingreportFromExcel } from "../../services/ErpServices"



const FileInput = styled.input`
background:none;
color:blue;
`
function UploadBillsAgingFromExcelButton() {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (BulkBillsAgingreportFromExcel)
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

export default function BillsAgingReportPage() {
    const [reports, setReports] = useState<GetBillsAgingReportFromExcelDto[]>([])
    const { user } = useContext(UserContext)
    const [sent, setSent] = useState(false)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetBillsAgingReportFromExcelDto[]>, BackendError>("reports", GetBillsAgingReports)
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const columns = useMemo<MRT_ColumnDef<GetBillsAgingReportFromExcelDto>[]>(
        //column definitions...
        () => [
            {
                accessorKey: 'created_at',
                header: 'Created On',
                size: 120,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.created_at || "" }).filter(onlyUnique)
            },
            {
                accessorKey: 'report_owner',
                header: 'State',
                size: 150,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.report_owner }).filter(onlyUnique)
            },
            {
                accessorKey: 'account',
                header: 'Account',
                size: 350,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.account }).filter(onlyUnique)

            },
            {
                accessorKey: 'total',
                size: 120,
                header: 'Total'
            },
            {
                accessorKey: 'plu70',
                header: '>70',
                aggregationFn: 'sum',
                size: 120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.plu70) }, 0).toFixed(2)}</b>
            },
            {
                accessorKey: 'in70to90',
                header: '70-90',
                size: 120,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.in70to90) }, 0).toFixed(2)}</b>
            },
            {
                accessorKey: 'in90to120',
                header: '90-120',
                size: 120,
                aggregationFn: 'sum',
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.in90to120) }, 0).toFixed(2)}</b>
            },
            {
                accessorKey: 'plus120',
                header: '>120',
                aggregationFn: 'sum',
                size: 120,
                AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())}</div>,
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.plus120) }, 0).toFixed(2)}</b>
            }
        ],
        [reports],
        //end
    );


    function handleExcel() {
        try {
            let data: GetBillsAgingReportFromExcelDto[] = [
                {
                    report_owner: "Goa",
                    account: "agarson safety",
                    plu70: 0,
                    in70to90: 0,
                    in90to120: 0,
                    plus120: 0
                }
            ]
            ExportToExcel(data, "bills_ageing_template")
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

    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover', 
        data: reports, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
                fontSize: '14px'
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
                fontSize: '13px'
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
    useEffect(() => {
        //scroll to the top of the table when the sorting changes
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting]);
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
                    Bills Ageing {new Date().getMonth() < 3 ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}` : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
                </Typography>

                <Stack direction={'row'} gap={2} alignItems={'center'}>
                    <>

                        {user?.assigned_permissions.includes("bills_ageing_create") && <UploadBillsAgingFromExcelButton />}

                        {user?.assigned_permissions.includes("bills_ageing_create") && <Button variant="outlined" startIcon={<Download />} onClick={handleExcel}> Template</Button>}
                    </>
                </Stack>


            </Stack >

            <MaterialReactTable table={table} />
        </>

    )

}

