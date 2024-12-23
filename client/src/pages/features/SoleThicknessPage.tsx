import { Button, Fade, IconButton, LinearProgress, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { Delete, Edit, FilterAlt, FilterAltOff, Fullscreen, FullscreenExit, Menu as MenuIcon } from '@mui/icons-material';
import DBPagination from '../../components/pagination/DBpagination'
import ExportToExcel from '../../utils/ExportToExcel'
import PopUp from '../../components/popup/PopUp'
import moment from 'moment'
import CreateOrEditSoleThicknessDialog from '../../components/dialogs/production/CreateOrEditSoleThicknessDialog'
import DeleteProductionItemDialog from '../../components/dialogs/production/DeleteProductionItemDialog'
import { GetSoleThicknessDto } from '../../dtos/sole-thickness.dto'
import { DropDownDto } from '../../dtos/dropdown.dto'
import { FeatureService } from '../../services/FeatureServices'
import { UserService } from '../../services/UserServices'


export default function SoleThicknessPage() {
    const [paginationData, setPaginationData] = useState({ limit: 100, page: 1, total: 1 });
    const { user: LoggedInUser } = useContext(UserContext)
    const [thickness, setThickness] = useState<GetSoleThicknessDto>()
    const [thicknesses, setProductions] = useState<GetSoleThicknessDto[]>([])
    const [users, setUsers] = useState<DropDownDto[]>([])
    const [dialog, setDialog] = useState<string | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const [userId, setUserId] = useState<string>()
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
        start_date: moment(new Date()).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
    })
    const { data, isLoading, isSuccess, isRefetching, refetch } = useQuery<AxiosResponse<{ result: GetSoleThicknessDto[], page: number, total: number, limit: number }>, BackendError>(["thickness", userId, dates?.start_date, dates?.end_date], async () => new FeatureService().GetSoleThickness({ limit: paginationData?.limit, page: paginationData?.page, id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))

    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'sole_thickness_view', show_assigned_only: true }))

    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [users, isUsersSuccess, usersData])



    useEffect(() => {
        if (data && isSuccess) {
            setProductions(data.data.result)
            setPaginationData({
                ...paginationData,
                page: data.data.page,
                limit: data.data.limit,
                total: data.data.total
            })
        }
    }, [data, isSuccess])


    const columns = useMemo<MRT_ColumnDef<GetSoleThicknessDto>[]>(
        () => thicknesses && [
            {
                accessorKey: 'actions',
                header: '',
                enableColumnFilter: false,
                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row" spacing={1}>

                            <>
                                {LoggedInUser?.assigned_permissions.includes('sole_thickness_edit') && <Tooltip title="edit">
                                    <IconButton color="info"

                                        onClick={() => {
                                            setDialog('CreateOrEditSoleThicknessDialog')
                                            setThickness(cell.row.original)
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                </Tooltip>}
                                {LoggedInUser?.is_admin && LoggedInUser?.assigned_permissions.includes('sole_thickness_delete') && <Tooltip title="delete">
                                    <IconButton color="error"

                                        onClick={() => {
                                            setDialog('DeleteProductionItemDialog')
                                            setThickness(cell.row.original)
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Tooltip>}
                            </>


                        </Stack>}
                />
            },

            {
                accessorKey: 'dye.label',
                header: 'Dye',

                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.dye && cell.row.original.dye.label.toString() || "" ? cell.row.original.dye.label.toString() || "" : ""}</>,
                filterSelectOptions: thicknesses && thicknesses.map((i) => {
                    return i.dye && i.dye.label.toString() || "";
                }).filter(onlyUnique)
            },
            {
                accessorKey: 'article',
                header: 'Article',

                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.article && cell.row.original.article.label || "" ? cell.row.original.article.label || "" : ""}</>,
                filterSelectOptions: thicknesses && thicknesses.map((i) => {
                    return i.article && i.article.label || "";
                }).filter(onlyUnique)
            },
            {
                accessorKey: 'size',
                header: 'Size',

                Cell: (cell) => <>{cell.row.original.size && cell.row.original.size.toString() || "" ? cell.row.original.size.toString() || "" : ""}</>,

            },

            {
                accessorKey: 'left_thickness',
                header: 'Left Thickness',

                Cell: (cell) => <>{cell.row.original.right_thickness && cell.row.original.right_thickness.toString() || "" ? cell.row.original.right_thickness.toString() || "" : ""}</>,

            },
            {
                accessorKey: 'right_thickness',
                header: 'Right Thickness',

                Cell: (cell) => <>{cell.row.original.right_thickness && cell.row.original.right_thickness.toString() || "" ? cell.row.original.right_thickness.toString() || "" : ""}</>
            },
            {
                accessorKey: 'created_at',
                header: 'Created At',

                Cell: (cell) => <>{cell.row.original.created_at || ""}</>
            },
            {
                accessorKey: 'created_by',
                header: 'Creator',

                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.created_by.label.toString() || "" ? cell.row.original.created_by.label.toString() || "" : ""}</>,
                filterSelectOptions: thicknesses && thicknesses.map((i) => {
                    return i.created_by.label.toString() || "";
                }).filter(onlyUnique)
            },
        ],
        [thicknesses],
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: thicknesses,
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableHeadCellProps: ({ column }) => ({
            sx: {
                '& div:nth-child(1) span': {
                    display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially hidden
                },
                '& div:nth-child(2)': {
                    display: (column.getIsFiltered() || column.getIsGrouped()) ? 'inline-block' : 'none'
                },
                '&:hover div:nth-child(1) span': {
                    display: 'inline', // Visible on hover
                },
                '&:hover div:nth-child(2)': {
                    display: 'block', // Visible on hover
                }
            },
        }),
        muiTableHeadRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
                border: '1px solid lightgrey;',
            },
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '72vh' }
        }),
        positionToolbarAlertBanner: 'none',
        renderTopToolbarCustomActions: ({ table }) => (

            <Stack
                spacing={2}
                direction="row"
                sx={{ width: '100%' }}
                justifyContent="space-between"

            >
                <Typography
                    variant={'h6'}
                    component={'h1'}
                    sx={{ pl: 1 }}

                >
                    Sole Thickness
                </Typography>
                {/* filter dates and person */}
                <Stack direction="row" gap={2} justifyContent={'end'}>
                    < TextField

                        size="small"
                        type="date"
                        id="start_date"
                        label="Start Date"
                        fullWidth
                        value={dates.start_date}
                        variant="filled"
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

                        size="small"
                        type="date"
                        id="end_date"
                        label="End Date"
                        variant="filled"
                        value={dates.end_date}
                        fullWidth
                        onChange={(e) => {
                            if (e.currentTarget.value) {
                                setDates({
                                    ...dates,
                                    end_date: moment(e.target.value).format("YYYY-MM-DD")
                                })
                            }
                        }}
                    />
                    {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 && < TextField
                        variant="filled"
                        size="small"
                        select
                        SelectProps={{
                            native: true,
                        }}
                        onChange={(e) => {
                            setUserId(e.target.value)
                        }}
                        required
                        id="production_owner"
                        label="Person"
                        fullWidth
                    >
                        <option key={'00'} value={undefined}>

                        </option>
                        {
                            users.map((user, index) => {

                                return (<option key={index} value={user.id}>
                                    {user.label}
                                </option>)

                            })
                        }
                    </TextField>}
                    <Tooltip title="Toogle Filter">
                        <Button size="small" color="inherit" variant='contained'
                            onClick={() => {
                                if (table.getState().showColumnFilters)
                                    table.resetColumnFilters(true)
                                table.setShowColumnFilters(!table.getState().showColumnFilters)
                            }
                            }
                        >
                            {table.getState().showColumnFilters ? <FilterAltOff /> : <FilterAlt />}
                        </Button>
                    </Tooltip>
                    <Tooltip title="Toogle FullScreen">
                        <Button size="small" color="inherit" variant='contained'
                            onClick={() => table.setIsFullScreen(!table.getState().isFullScreen)
                            }
                        >
                            {table.getState().isFullScreen ? <FullscreenExit /> : <Fullscreen />}
                        </Button>
                    </Tooltip>
                    <Tooltip title="Menu">
                        <Button size="small" color="inherit" variant='contained'
                            onClick={(e) => setAnchorEl(e.currentTarget)
                            }
                        >
                            <MenuIcon />
                            <Typography pl={1}> Menu</Typography>
                        </Button>
                    </Tooltip>
                </Stack>
            </Stack >
        ),
        rowVirtualizerInstanceRef,
        mrtTheme: (theme) => ({
            baseBackgroundColor: theme.palette.background.paper, //change default background color
        }),
        renderBottomToolbarCustomActions: () => (
            <DBPagination paginationData={paginationData} refetch={() => { refetch() }} setPaginationData={setPaginationData} />

        ),
        muiTableBodyCellProps: () => ({
            sx: {
                border: '1px solid lightgrey;',
            },
        }),
        initialState: { density: 'compact' },
        enableRowSelection: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        onSortingChange: setSorting,
        enableTopToolbar: true,
        enableTableFooter: true,
        enableRowVirtualization: true,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnSizingChange: setColumnSizing, state: {
            isLoading: isLoading,
            columnVisibility,

            sorting,
            columnSizing: columnSizing
        },
        enableBottomToolbar: true,
        enableGlobalFilter: false,
        manualPagination: true,
        enablePagination: false,
        enableToolbarInternalActions: false
    });

    useEffect(() => {
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting]);
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

    return (
        <>
            {
                isLoading || isRefetching && <LinearProgress color='secondary' />
            }
            <>
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
                    {LoggedInUser?.assigned_permissions.includes('sole_thickness_create') && <MenuItem
                        onClick={() => {
                            setDialog('CreateOrEditSoleThicknessDialog')
                            setThickness(undefined);
                            setAnchorEl(null)
                        }}


                    > Add New</MenuItem>}

                    {LoggedInUser?.assigned_permissions.includes('sole_thickness_export') && < MenuItem onClick={() => {
                        let data: any[] = []
                        data = table.getRowModel().rows.map((row) => {
                            return {
                                _id: row.original._id,
                                dye: row.original.dye.label,
                                article: row.original.article.label,
                                size: row.original.size,
                                left_thickness: row.original.left_thickness,
                                right_thickness: row.original.right_thickness,
                                created_at: row.original.created_at,
                                created_by: row.original.created_by.label,
                            }
                        }
                        )
                        ExportToExcel(data, " Data")
                    }
                    }

                    >Export All</MenuItem>}
                    {LoggedInUser?.assigned_permissions.includes('sole_thickness_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
                        let data: any[] = []
                        data = table.getSelectedRowModel().rows.map((row) => {
                            return {
                                _id: row.original._id,
                                dye: row.original.dye.label,
                                article: row.original.article.label,
                                size: row.original.size,
                                left_thickness: row.original.left_thickness,
                                right_thickness: row.original.right_thickness,
                                created_at: row.original.created_at,
                                created_by: row.original.created_by.label,
                            }
                        }
                        )
                        ExportToExcel(data, " Data")
                    }}

                    >Export Selected</MenuItem>}

                </Menu >
                <CreateOrEditSoleThicknessDialog dialog={dialog} setDialog={setDialog} thickness={thickness} />
            </>
            {
                thickness ?
                    <>

                        <DeleteProductionItemDialog dialog={dialog} setDialog={setDialog} thickness={thickness} />
                    </>
                    : null
            }
            <MaterialReactTable table={table} />

        </>

    )

}