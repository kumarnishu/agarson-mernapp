import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import ExportToExcel from '../../utils/ExportToExcel'
import { SalesService } from '../../services/SalesServices'
import { Menu as MenuIcon } from '@mui/icons-material';
import { CollectionsExcelButtons } from '../../components/buttons/CollectionsExcelButtons'
import { HandleNumbers } from '../../utils/IsDecimal'
import { GetCollectionsDto } from '../../dtos/SalesDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'

function CollectionReportPage() {
    const { user: LoggedInUser } = useContext(UserContext)
    const [collections, setCollections] = useState<GetCollectionsDto[]>([])
    const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
        start_date: moment(new Date().setDate(new Date().getDate() - 1)).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate())).format("YYYY-MM-DD")
    })

    const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

    const { data, isLoading } = useQuery<AxiosResponse<GetCollectionsDto[]>, BackendError>(["collections", dates?.start_date, dates?.end_date], async () => new SalesService().GetCollectionReports({ start_date: dates?.start_date, end_date: dates?.end_date }))
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const columns = useMemo<MRT_ColumnDef<GetCollectionsDto>[]>(
        //column definitions...
        () => collections && [


            {
                accessorKey: 'date',
                header: ' Date',
                filterFn:CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={collections.map((item) => { return item.date || "" })} />,
                Cell: (cell) => <span >{cell.row.original.date && moment(cell.row.original.date).format("DD/MM/YYYY")}</span>,
                aggregationFn: 'max',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
            },
            {
                accessorKey: 'month',
                header: ' Month',
                filterFn:CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={collections.map((item) => { return item.month || "" })} />,
                aggregationFn: 'max',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
            },
            {
                accessorKey: 'party',
                header: ' Party',
                filterFn:CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={collections.map((item) => { return item.party || "" })} />,
            },
            {
                accessorKey: 'state',
                header: ' State',
                filterFn:CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={collections.map((item) => { return item.state || "" })} />,
                aggregationFn: 'max',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
            },
            {
                accessorKey: 'amount',
                header: ' Amount',
                aggregationFn: 'sum',
                filterVariant: 'range',
                filterFn: 'betweenInclusive',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.amount) }, 0).toFixed()}</b>
            }
        ],
        [collections, data],
    );

    const table = useMaterialReactTable({
        
        columns, columnFilterDisplayMode: 'popover',
        data: collections, //10,000 rows       
        enableColumnResizing: true,
        enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '62vh' }
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
            rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
            shape: 'rounded',
            variant: 'outlined',
        },
        enableDensityToggle: false, initialState: {
            density: 'compact', grouping: ['state'],pagination: { pageIndex: 0, pageSize: 7000 }, 
        },
        enableGrouping: true,
        enableRowSelection: true,
        manualPagination: false,
        enablePagination: true,
        enableColumnPinning: true,
        enableTableFooter: true,
        enableRowVirtualization: true,
        //optionally customize the column virtualizer
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing, state: {
            isLoading: isLoading,
            columnVisibility,

            sorting,
            columnSizing: columnSizing
        }
    });


    useEffect(() => {
        if (data) {
            setCollections(data.data)
        }
    }, [data])
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

            <Box minWidth={'100vw'} >
                <Stack sx={{ p: 1 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
                    <Typography variant='h6'>Daily Collections</Typography>
                    <Stack
                        pt={1}
                        direction="row"
                        alignItems={'center'}
                        justifyContent="right">

                        <Stack justifyContent={'right'} direction={'row'} gap={1}>
                            < TextField
                                variant='filled'
                                size="small"
                                type="date"
                                id="start_date"
                                label="Start Date"
                                fullWidth

                                value={dates.start_date}
                                onChange={(e) => {
                                    if (e.currentTarget.value) {
                                        setDates({
                                            ...dates,
                                            start_date: moment(e.target.value).format("YYYY-MM-DD")
                                        })
                                    }
                                }}
                            />
                            < TextField
                                variant='filled'
                                type="date"
                                id="end_date"
                                size="small"
                                label="End Date"
                                value={dates.end_date}

                                fullWidth
                                onChange={(e) => {
                                    setDates({
                                        ...dates,
                                        end_date: moment(e.target.value).format("YYYY-MM-DD")
                                    })
                                }}
                            />

                            <CollectionsExcelButtons />


                            <Tooltip title="Menu" sx={{ pl: 1 }}>
                                <Button size="small" color="inherit" variant='contained'
                                    onClick={(e) => setAnchorEl(e.currentTarget)
                                    }
                                >
                                    <MenuIcon />
                                </Button>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Stack>
            </Box >
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)
                }
                TransitionComponent={Fade}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                sx={{ borderRadius: 2 }}
            >

                {LoggedInUser?.assigned_permissions.includes('collections_export') && < MenuItem onClick={() => {

                    let data = table.getRowModel().rows;
                    ExportToExcel(data, "Attendances Data")
                }
                }
                >Export All</MenuItem>}
                {LoggedInUser?.assigned_permissions.includes('collections_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
                    let data = table.getSelectedRowModel().rows
                    ExportToExcel(data, "Attendances Data")
                }}

                >Export Selected</MenuItem>}
            </Menu>
            <MaterialReactTable table={table} />
        </>
    )
}

export default CollectionReportPage