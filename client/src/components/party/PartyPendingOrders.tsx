import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, MRT_VisibilityState, MRT_ColumnSizingState, useMaterialReactTable, MRT_PaginationState } from 'material-react-table'
import { IColumnRowData } from '../../dtos/SalesDto'
import { PartyPageService } from '../../services/PartyPageService'
import { HandleNumbers } from '../../utils/IsDecimal'
import { CustomColumFilter } from '../filter/CustomColumFIlter'
import { Tooltip, Typography } from '@mui/material'
import { CustomFilterFunction } from '../filter/CustomFilterFunction'
import { ArticlesContext } from '../../contexts/ArticlesContext'
import { onlyUnique } from '../../utils/UniqueArray'


export default function PartyPendingOrders({ party }: { party: string }) {
    const [reports, setReports] = useState<IColumnRowData['rows']>([])
    const [reportcolumns, setReportColumns] = useState<IColumnRowData['columns']>([])
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<IColumnRowData>, BackendError>(["pendingorders", party], async () => new PartyPageService().GetPartyPendingOrders(party))
    const isFirstRender = useRef(true);
    const { articles, setArticles } = useContext(ArticlesContext)
    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 2 })

    let columns = useMemo<MRT_ColumnDef<any, any>[]>(
        () => reportcolumns && reportcolumns.map((item, index) => {
            if (item.type == "string") {
                return {
                    accessorKey: item.key,
                    header: item.header,
                    /* @ts-ignore */
                    filterFn: CustomFilterFunction,
                    Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
                    Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it[item.key] })} />,
                    Footer: "",
                }
            }
            else if (item.type == "timestamp")
                return {
                    accessorKey: item.key, header: item.header,  /* @ts-ignore */
                    filterFn: CustomFilterFunction,
                    Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
                    Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it[item.key] })} />, Footer: ""
                }
            else if (item.type == "date")
                return {
                    accessorKey: item.key,
                    header: item.header,
                    /* @ts-ignore */
                    filterFn: CustomFilterFunction,
                    Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
                    Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it[item.key] })} />,
                    Footer: <b>Total</b>,
                }
            else
                return {
                    accessorKey: item.key, header: item.header,
                    aggregationFn: 'sum',
                    filterVariant: 'range',
                    filterFn: 'betweenInclusive',
                    Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
                    AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                    //@ts-ignore
                    Footer: ({ table }) => <b>{index < 2 ? table.getFilteredRowModel().rows.length : table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original[item.key]) }, 0).toFixed()}</b>
                }
        })
        ,
        [reports, reportcolumns],
        //end
    );


    useEffect(() => {
        if (isSuccess && data) {
            setReports(data.data.rows);
            setReportColumns(data.data.columns)
        }
    }, [isSuccess, data]);



    const table = useMaterialReactTable({
        //@ts-ignore
        columns, columnFilterDisplayMode: 'popover',
        data: reports ? reports : [], //10,000 rows       
        enableColumnResizing: true,
        positionToolbarAlertBanner: 'none',
        enableRowVirtualization: true,
        // , //optionally customize the row virtualizr
        // columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizr
        enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),

        renderTopToolbarCustomActions: () => (
            <Typography sx={{ overflow: 'hidden', fontSize: '1.1em', fontWeight: 'bold', textAlign: 'center' }} >Pending Orders</Typography>
        ),
        muiTableHeadRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white'
            },
        }),
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
            rowsPerPageOptions: [1, 2, 3, 10, 100, 200, 500, 1000, 2000, 5000, 7000, 10000],
            shape: 'rounded',
            variant: 'outlined',
        },

        enableDensityToggle: false, initialState: {
            density: 'compact', pagination: pagination
        },
        selectAllMode: 'all',
        enableBottomToolbar: true,
        enableGlobalFilter: true,
        enableGrouping: false,
        enableRowSelection: true,
        enablePagination: true,
        enableColumnPinning: true,
        enableTableFooter: true,
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing,
        onPaginationChange: setPagination,
        state: {
            isLoading: isLoading,
            columnVisibility,
            pagination: pagination,
            sorting,
            columnSizing: columnSizing
        }
    });

    useEffect(() => {
        if (table.getState().isFullScreen) {
            setPagination({ pageIndex: 0, pageSize: 10000 })
            console.log("success changed")
        }
        else {
            setPagination({ pageIndex: 0, pageSize: 2 })
            console.log("success changed")
        }
    }, [table.getState().isFullScreen])
    //load state from local storage
    useEffect(() => {
        const columnVisibility = localStorage.getItem(
            'mrt_columnVisibility_PartyPendingOrders',
        );
        const columnSizing = localStorage.getItem(
            'mrt_columnSizing_PartyPendingOrders',
        );


        const sorting = localStorage.getItem('mrt_sorting_PartyPendingOrders');


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
            'mrt_columnVisibility_PartyPendingOrders',
            JSON.stringify(columnVisibility),
        );
    }, [columnVisibility]);




    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_sorting_PartyPendingOrders', JSON.stringify(sorting));
    }, [sorting]);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_columnSizing_PartyPendingOrders', JSON.stringify(columnSizing));
    }, [columnSizing]);


    useEffect(() => {
        let rows = table.getSelectedRowModel().rows;
        let tarticles = articles
        if (rows.length > 0) {
            //@ts-ignore
            rows.map((i) => {
                if (i.original['Article']) {
                    tarticles.push(i.original['Article'])
                }
            })
            tarticles = tarticles.filter(onlyUnique)
            setArticles(tarticles)
        }
        else {
            setArticles(tarticles)
        }
    }, [table.getSelectedRowModel().rows])


    return (
        <>
            <MaterialReactTable table={table} />
        </>

    )

}

