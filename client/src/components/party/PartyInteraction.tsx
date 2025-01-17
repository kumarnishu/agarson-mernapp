import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Typography } from '@mui/material'
import { AxiosResponse } from "axios"
import { BackendError } from '../..'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { PartyPageService } from '../../services/PartyPageService'
import { GetPartyRemarkDto } from '../../dtos/PartyPageDto'


export default function PartyInteraction({ party }: { party: string }) {
    const [remarks, setRemarks] = useState<GetPartyRemarkDto[]>([])
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetPartyRemarkDto[]>, BackendError>(["ageing1", party], async () => new PartyPageService().GetPartyLast5Remarks(party))
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const isFirstRender = useRef(true);
    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const columns = useMemo<MRT_ColumnDef<GetPartyRemarkDto>[]>(
        //column definitions...
        () => remarks && [
            {
                accessorKey: 'remark',
                header: ' Last Remark',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={remarks.map((item) => { return item.remark || "" })} />,
                Cell: (cell) => <>{cell.row.original.remark ? cell.row.original.remark : ""}</>
            },
            {
                accessorKey: 'created_by.label',
                header: 'Creator',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={remarks.map((item) => { return item.created_by.label || "" })} />,
                Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
            },
            {
                accessorKey: 'created_at',
                header: 'TimeStamp',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={remarks.map((item) => { return item.created_at || "" })} />,
                Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
            },

            {
                accessorKey: 'nextcall',
                header: 'Next Call',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={remarks.map((item) => { return item.nextcall || "" })} />,
                Cell: (cell) => <>{cell.row.original.nextcall ? cell.row.original.nextcall : ""}</>
            },



        ],
        [remarks],
        //end
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: remarks, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),

        muiTableHeadRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white'
            },
        }),
        renderTopToolbarCustomActions: () => (
            <Typography sx={{ overflow: 'hidden', fontSize: '1.1em', fontWeight: 'bold', textAlign: 'center' }} >Remark 25,30,55,60,70,70+</Typography>
        ),
        muiTableHeadCellProps: ({ column }) => ({
            sx: {
                '& div:nth-of-type(1) span': {
                    display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially hidden
                },
                '& div:nth-of-type(2)': {
                    display: (column.getIsFiltered() || column.getIsGrouped()) ? 'inline-block' : 'none'
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
            rowsPerPageOptions: [100, 200, 500, 1000, 2000],
            shape: 'rounded',
            variant: 'outlined',
        },
        muiTablePaperProps: () => ({
            sx: { height: '30vh', width: '100vw', overflow: 'scroll' }
        }),
        enableDensityToggle: false, initialState: {
            density: 'compact', showGlobalFilter: true, pagination: { pageIndex: 0, pageSize: 500 }
        },
        enableGrouping: true,
        enableRowSelection: true,
        manualPagination: false,
        enablePagination: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        enableTableFooter: true,
        enableRowVirtualization: true,
        onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //optional

        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing, state: {
            isLoading: isLoading,
            columnVisibility,

            sorting,
            columnSizing: columnSizing
        }
    });


    useEffect(() => {
        if (isSuccess) {
            setRemarks(data.data);
        }
    }, [data, isSuccess]);
    useEffect(() => {
        //scroll to the top of the table when the sorting changes
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting]);

    //load state from local storage
    useEffect(() => {
        const columnVisibility = localStorage.getItem(
            'mrt_columnVisibility_table_1',
        );
        const columnSizing = localStorage.getItem(
            'mrt_columnSizing_table_1',
        );





        if (columnVisibility) {
            setColumnVisibility(JSON.parse(columnVisibility));
        }


        if (columnSizing)
            setColumnSizing(JSON.parse(columnSizing))

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


    return (
        <>
            <MaterialReactTable table={table} />
        </>

    )

}

