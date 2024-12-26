import { Dialog, DialogContent, IconButton, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { BackendError } from '../../..'
import { onlyUnique } from '../../../utils/UniqueArray'
import { Cancel } from '@mui/icons-material'
import { GetVisitReportDto } from '../../../dtos/visit-report.dto'
import { SalesService } from '../../../services/SalesServices'




function VisitReportPage({ employee }: { employee: string }) {
    
     const [reports, setReports] = useState<GetVisitReportDto[]>([])
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetVisitReportDto[]>, BackendError>(["reports", employee], async () =>new SalesService(). GetVisitReports({ employee }))
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const columns = useMemo<MRT_ColumnDef<GetVisitReportDto>[]>(
        //column definitions...
        () => [
            {
                accessorKey: 'employee',
                header: 'Employee',

            },
            {
                accessorKey: 'visit_date',
                header: 'Visit Date',
            },
            {
                accessorKey: 'customer',
                header: 'Customer',

            }
            ,
            {
                accessorKey: 'intime',
                header: 'in Time',

            },
            {
                accessorKey: 'outtime',
                header: 'Out Time',

            },
            {
                accessorKey: 'visitInLocation',
                header: 'Visit In Location',

            },
            {
                accessorKey: 'visitOutLocation',
                header: 'Visit Out Location',

            },
            {
                accessorKey: 'remarks',
                header: 'Remarks',

            },

            {
                accessorKey: 'created_at',
                header: 'Created On',

                filterVariant: 'multi-select',
                filterSelectOptions: reports.map((i) => { return i.created_at || "" }).filter(onlyUnique)
            },
        ],
        [reports],
        //end
    );
    const isFirstRender = useRef(true);


    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})


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
        muiTableHeadCellProps: ({ column }) => ({
            sx: {
              '& div:nth-of-type(1) span': {
                display: (column.getIsFiltered() || column.getIsSorted()|| column.getIsGrouped())?'inline':'none', // Initially hidden
              },
              '& div:nth-of-type(2)': {
                display: (column.getIsFiltered() || column.getIsGrouped())?'inline-block':'none'
              },
              '&:hover div:nth-of-type(1) span': {
                display: 'inline', // Visible on hover
              },
              '&:hover div:nth-of-type(2)': {
                display: 'block', // Visible on hover
              }
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

        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing,
        state: {
            isLoading: isLoading,
            columnVisibility,
            sorting,
            columnSizing: columnSizing
        }
    });

    useEffect(() => {
        //scroll to the top of the table when the sorting changes
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting]);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_sorting_table_1', JSON.stringify(sorting));
    }, [sorting]);

    //load state from local storage
    useEffect(() => {
        const columnVisibility = localStorage.getItem(
            'mrt_columnVisibility_table_1',
        );
        const columnSizing = localStorage.getItem(
            'mrt_columnSizing_table_1',
        );

        const sorting = localStorage.getItem('mrt_sorting_table_1');

        if (columnVisibility) {
            setColumnVisibility(JSON.parse(columnVisibility));
        }



        if (columnSizing)
            setColumnSizing(JSON.parse(columnSizing))
        if (sorting) {
            setSorting(JSON.parse(sorting));
        }
        isFirstRender.current = false;
    }, []);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem(
            'mrt_columnVisibility_table_1',
            JSON.stringify(columnVisibility),
        );
    }, [columnVisibility]);




    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_sorting_table_1', JSON.stringify(sorting));
    }, [sorting]);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_columnSizing_table_1', JSON.stringify(columnSizing));
    }, [columnSizing]);



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

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    employee: string, setEmployee: React.Dispatch<React.SetStateAction<string | undefined>>
}


function ViewVisitReportDialog({ employee, setEmployee, dialog, setDialog }: Props) {
    return (
        <Dialog open={dialog === "ViewVisitReportDialog"} fullScreen
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setEmployee(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <DialogContent >
                {employee && <VisitReportPage employee={employee} />}
            </DialogContent>
        </Dialog >
    )
}

export default ViewVisitReportDialog
