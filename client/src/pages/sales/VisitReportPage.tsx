import { Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { GetVisitReportDto } from '../../dtos'
import { GetVisitReports } from '../../services/SalesServices'



export default function VisitReportPage() {
    const [reports, setReports] = useState<GetVisitReportDto[]>([])
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

