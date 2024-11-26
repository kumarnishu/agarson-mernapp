import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { GetVisitReportDto } from '../../../dtos'
import { GetVisitReports } from '../../../services/SalesServices'
import { BackendError } from '../../..'
import { onlyUnique } from '../../../utils/UniqueArray'
import { Cancel } from '@mui/icons-material'


function VisitReportPage({ employee }: { employee: string }) {
    const [reports, setReports] = useState<GetVisitReportDto[]>([])
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetVisitReportDto[]>, BackendError>(["reports", employee], async () => GetVisitReports({ employee }))
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const columns = useMemo<MRT_ColumnDef<GetVisitReportDto>[]>(
        //column definitions...
        () => [
            {
                accessorKey: 'employee',
                header: 'Employee',
                size: 150,
            },
            {
                accessorKey: 'visit_date',
                header: 'Visit Date',
                size: 120,
                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.visit_date || "" }).filter(onlyUnique)
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



            </Stack >

            <MaterialReactTable table={table} />
        </>

    )

}


function ViewVisitReportDialog({ employee, setEmployee }: { employee: string, setEmployee: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    return (
        <Dialog open={Boolean(employee)}
            fullWidth
            onClose={() => setEmployee(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setEmployee(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {"Visiit Report"}
            </DialogTitle>

            <DialogContent>
                {employee && <VisitReportPage employee={employee} />}
            </DialogContent>
        </Dialog >
    )
}

export default ViewVisitReportDialog
