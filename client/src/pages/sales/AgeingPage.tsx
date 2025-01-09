import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Fade, FormControlLabel, IconButton, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import ExportToExcel from '../../utils/ExportToExcel'
import { Comment, Menu as MenuIcon, Visibility } from '@mui/icons-material';
import { AxiosResponse } from "axios"
import { BackendError } from '../..'
import { GetAgeingDto } from '../../dtos/sales.dto'
import { SalesService } from '../../services/SalesServices'
import { AgeingExcelButtons } from '../../components/buttons/AgeingExcelButtons'
import { HandleNumbers } from '../../utils/IsDecimal'
import PopUp from '../../components/popup/PopUp'
import CreateOrEditAgeingRemarkDialog from '../../components/dialogs/sales/CreateOrEditAgeingRemarkDialog'
import ViewAgeingRemarksDialog from '../../components/dialogs/sales/ViewAgeingRemarksDialog'


export default function AgeingPage() {
    const [ageings, setAgeings] = useState<GetAgeingDto[]>([])
    const [dialog, setDialog] = useState<string | undefined>()
    const [hidden, setHidden] = useState(false)
    const { user: LoggedInUser } = useContext(UserContext)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetAgeingDto[]>, BackendError>(["ageing", hidden], async () => new SalesService().GetAgeingReports({ hidden }))
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const isFirstRender = useRef(true);
    const [party, setParty] = useState<string>()
    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const columns = useMemo<MRT_ColumnDef<GetAgeingDto>[]>(
        //column definitions...
        () => ageings && [
            {
                accessorKey: 'action',
                header: 'Action',

                Cell: (cell) => <PopUp
                    element={
                        <Stack direction="row" spacing={1}>
                            {LoggedInUser?.assigned_permissions.includes('ageing_edit') && <Tooltip title="view remarks">
                                <IconButton color="primary"

                                    onClick={() => {
                                        setDialog('ViewAgeingRemarksDialog')
                                        setParty(cell.row.original.party)
                                    }}
                                >
                                    <Visibility />
                                </IconButton>
                            </Tooltip>}

                            {LoggedInUser?.assigned_permissions.includes('ageing_edit') &&
                                <Tooltip title="Add Remark">
                                    <IconButton
                                        color="success"
                                        onClick={() => {
                                            setDialog('CreateOrEditAgeingRemarkDialog')
                                            setParty(cell.row.original.party)
                                        }}
                                    >
                                        <Comment />
                                    </IconButton>
                                </Tooltip>}

                        </Stack>}
                />
            },
            {
                accessorKey: 'last_remark',
                header: 'Last Remark',
                aggregationFn: 'max',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => <>{cell.row.original.last_remark || ""}</>,

            },
            {
                accessorKey: 'next_call',
                header: 'Next Call',
                Cell: (cell) => <>{cell.row.original.next_call || ""}</>,

            },
            {
                accessorKey: 'state',
                header: 'State',
                aggregationFn: 'max',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => <>{cell.row.original.state || ""}</>,

            },
            {
                accessorKey: 'party',
                header: 'Party',
                Cell: (cell) => <>{cell.row.original.party || ""}</>,

            },
            {
                accessorKey: 'two5',
                header: '25',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.two5) }, 0).toFixed()}</b>


            },
            {
                accessorKey: 'three0',
                header: '30',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.three0) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'five5',
                header: '55',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.five5) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'six0',
                header: '60',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.six0) }, 0).toFixed()}</b>
            },
            {
                accessorKey: 'seven0',
                header: '70',
                aggregationFn: 'sum',
                AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
                //@ts-ignore
                Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.seven0) }, 0).toFixed()}</b>
            },

            {
                accessorKey: 'seventyplus',
                header: '70+',
                aggregationFn: 'sum',
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
            rowsPerPageOptions: [100, 200, 500, 1000, 2000],
            shape: 'rounded',
            variant: 'outlined',
        },
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
                    Ageing - 25,30,55,60,70,70+
                </Typography>
                <Stack
                    spacing={2}
                    padding={1}
                    direction="row"
                    justifyContent="space-between"
                    alignItems={'end'}
                >
                    <AgeingExcelButtons />
                    <FormControlLabel control={<Switch
                        defaultChecked={Boolean(hidden)}
                        onChange={() => setHidden(!hidden)}
                    />} label="Hidden" />
                    <IconButton size="small" color="primary"
                        onClick={(e) => setAnchorEl(e.currentTarget)
                        }
                        sx={{ border: 2, borderRadius: 3, marginLeft: 1 }}
                    >
                        <MenuIcon />
                    </IconButton>

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

                        {LoggedInUser?.assigned_permissions.includes('ageing_export') && < MenuItem onClick={() => {

                            let data = table.getRowModel().rows;
                            ExportToExcel(data, "Ageing Data")
                        }
                        }
                        >Export All</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('ageing_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
                            let data = table.getSelectedRowModel().rows
                            ExportToExcel(data, "Ageing Data")
                        }}

                        >Export Selected</MenuItem>}

                    </Menu >
                </Stack>
            </Stack >
            {party && <CreateOrEditAgeingRemarkDialog party={party} dialog={dialog} setDialog={setDialog} />}
            {party && <ViewAgeingRemarksDialog party={party} dialog={dialog} setDialog={setDialog} />}
            {/* table */}
            <MaterialReactTable table={table} />
        </>

    )

}

