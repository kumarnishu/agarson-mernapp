import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Typography } from '@mui/material'
import { AxiosResponse } from "axios"
import { BackendError } from '../..'
import { HandleNumbers } from '../../utils/IsDecimal'
import { GetAgeingDto } from '../../dtos/SalesDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { useNavigate } from 'react-router-dom'
import { PartyPageService } from '../../services/PartyPageService'


export default function PartyAgeing1({ party }: { party: string }) {
    const [ageings, setAgeings] = useState<GetAgeingDto[]>([])
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetAgeingDto[]>, BackendError>(["ageing1", party], async () => new PartyPageService().GetPartyAgeing1(party))
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const isFirstRender = useRef(true);
    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
    const goto = useNavigate()
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const columns = useMemo<MRT_ColumnDef<GetAgeingDto>[]>(
        //column definitions...
        () => ageings && [
            {
                accessorKey: 'state',
                header: 'State',
                aggregationFn: 'max',

                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={ageings.map((item) => { return item.state || "" })} />,
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => <>{cell.row.original.state || ""}</>,

            },
            {
                accessorKey: 'party',
                header: 'Party',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={ageings.map((item) => { return item.party || "" })} />,
                Cell: (cell) => <Typography sx={{ cursor: 'pointer' }} onClick={() => { goto(`/Sales/PartyPage/${cell.row.original.party}`) }}>{cell.row.original.party || ""}</Typography>,

            },
            {
                accessorKey: 'two5',
                header: '0-25',
                aggregationFn: 'sum',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.two5) }, 0).toFixed()}</b>


            },
            {
                accessorKey: 'three0',
                header: '25-30',
                aggregationFn: 'sum',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.three0) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'five5',
                header: '30-55',
                aggregationFn: 'sum',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.five5) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'six0',
                header: '55-60',

                aggregationFn: 'sum',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.six0) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'seven0',
                header: '60-70',
                aggregationFn: 'sum',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.seven0) }, 0).toFixed()}</b>
            },

            {
                accessorKey: 'seventyplus',
                header: '70+',
                aggregationFn: 'sum',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.seventyplus) }, 0).toFixed()}</b>
            },

        ],
        [ageings],
        //end
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: ageings, //10,000 rows       
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
            <Typography sx={{ overflow: 'hidden', fontSize: '1.1em', fontWeight: 'bold', textAlign: 'center' }} >Ageing 1</Typography>
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
            sx: { height: '30vh', width: '18vw', overflow: 'scroll' }
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
            setAgeings(data.data);
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

