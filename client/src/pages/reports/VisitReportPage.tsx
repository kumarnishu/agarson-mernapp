import { Button, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { GetVisitReports } from '../../services/ErpServices'
import { UserContext } from '../../contexts/userContext'
import { Download } from '@mui/icons-material'
import ExportToExcel from '../../utils/ExportToExcel'
import AlertBar from '../../components/snacks/AlertBar'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { GetVisitReportDto, GetVisitReportFromExcelDto } from '../../dtos'
import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import { CircularProgress, Snackbar } from "@mui/material"
import { Upload } from "@mui/icons-material"
import { BulkVisitreportFromExcel } from "../../services/ErpServices"



const FileInput = styled.input`
background:none;
color:blue;
`
function UploadVisitFromExcelButton() {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (BulkVisitreportFromExcel)
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

export default function VisitReportPage() {
    const [reports, setReports] = useState<GetVisitReportDto[]>([])
    const { user } = useContext(UserContext)
    const [sent, setSent] = useState(false)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetVisitReportDto[]>, BackendError>("reports", GetVisitReports)
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const columns = useMemo<MRT_ColumnDef<GetVisitReportDto>[]>(
        //column definitions...
        () => [
            {
                accessorKey: 'employee',
                header: 'Employee',
                size: 150,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.employee }).filter(onlyUnique)
            },
            {
                accessorKey: 'visit_date',
                header: 'Visit Date',
                size: 120,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.created_at || "" }).filter(onlyUnique)
            },
            {
                accessorKey: 'customer',
                header: 'Customer',
                size: 250,
            }
            ,
            {
                accessorKey: 'intime',
                header: 'in Time',
                size: 120,
            },
            {
                accessorKey: 'outtime',
                header: 'Out Time',
                size: 120,
            },
            {
                accessorKey: 'visitInLocation',
                header: 'Visit In Location',
                size: 350,
            },
            {
                accessorKey: 'visitOutLocation',
                header: 'Visit Out Location',
                size: 350,
            },
            {
                accessorKey: 'remarks',
                header: 'Remarks',
                size: 350,
            },

            {
                accessorKey: 'created_at',
                header: 'Created On',
                size: 120,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.created_at || "" }).filter(onlyUnique)
            },
        ],
        [reports],
        //end
    );


    function handleExcel() {
        try {
            let data: GetVisitReportFromExcelDto[] = [
                {   _id:"",
                    employee: "nishu",
                    visit_date: '1 jan 2024',
                    customer: "india footwear",
                    intime: "10:10",
                    visitInLocation: "chawri,delhi",
                    outtime: "09:10",
                    visitOutLocation: "chawri,delhi",
                    remarks: "meet with owner"
                }
            ]
            ExportToExcel(data, "visit_report_template")
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
                    Visit Reports
                </Typography>

                <Stack direction={'row'} gap={2} alignItems={'center'}>
                    <>

                        {user?.assigned_permissions.includes("visit_report_create") && <UploadVisitFromExcelButton />}

                        {user?.assigned_permissions.includes("visit_report_create") && <Button variant="outlined" startIcon={<Download />} onClick={handleExcel}> Template</Button>}
                    </>
                </Stack>


            </Stack >

            <MaterialReactTable table={table} />
        </>

    )

}

