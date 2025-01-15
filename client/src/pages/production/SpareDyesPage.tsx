import { Button, Fade, IconButton, LinearProgress, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Check, Delete, Edit, FilterAlt, FilterAltOff, Menu as MenuIcon, Photo } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import PopUp from '../../components/popup/PopUp'
import moment from 'moment'
import DeleteProductionItemDialog from '../../components/dialogs/dropdown/DeleteProductionItemDialog'
import ValidateSpareDyeDialog from '../../components/dialogs/production/ValidateSpareDyeDialog'
import CreateOrEditSpareDyeDialog from '../../components/dialogs/production/CreateOrEditSpareDyeDialog'
import ViewSpareDyePhotoDialog from '../../components/dialogs/production/ViewSpareDyePhotoDialog'
import { UserService } from '../../services/UserServices'
import { ProductionService } from '../../services/ProductionService'
import { DropDownDto } from '../../dtos/DropDownDto'
import { GetSpareDyeDto } from '../../dtos/ProductionDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'


export default function SpareDyesPage() {
    const { user: LoggedInUser } = useContext(UserContext)
    const [spareDye, setSpareDye] = useState<GetSpareDyeDto>()
    const [spareDyes, setSpareDyes] = useState<GetSpareDyeDto[]>([])
    const [users, setUsers] = useState<DropDownDto[]>([])
    const [dialog, setDialog] = useState<string | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const [userId, setUserId] = useState<string>()
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
        start_date: moment(new Date()).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
    })
    const { data, isLoading, isSuccess, isRefetching } = useQuery<AxiosResponse<GetSpareDyeDto[]>, BackendError>(["spare_dyes", userId, dates?.start_date, dates?.end_date], async () => new ProductionService().GetSpareDyes({ id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))

    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'spare_dye_view', show_assigned_only: true }))

    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [users, isUsersSuccess, usersData])



    useEffect(() => {
        if (data && isSuccess) {
            setSpareDyes(data.data)

        }
    }, [data, isSuccess])


    const columns = useMemo<MRT_ColumnDef<GetSpareDyeDto>[]>(
        () => spareDyes && [
            {
                accessorKey: 'actions', enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
                header: 'Actions',
                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row" spacing={1}>

                            <>
                                {LoggedInUser?.assigned_permissions.includes('spare_dye_edit') && <>
                                    <IconButton color="info"
                                        onClick={() => {
                                            setDialog('CreateOrEditSpareDyeDialog')
                                            setSpareDye(cell.row.original)
                                        }}

                                    >
                                        <Edit />
                                    </IconButton>

                                </>}
                                {LoggedInUser?.assigned_permissions.includes('spare_dye_edit') && <Tooltip title="validate">
                                    <IconButton color="error"
                                        onClick={() => {
                                            setDialog('ValidateSpareDyeDialog')
                                            setSpareDye(cell.row.original)
                                        }}
                                    >
                                        <Check />
                                    </IconButton>
                                </Tooltip>}
                                {LoggedInUser?.role == "admin" && LoggedInUser?.assigned_permissions.includes('spare_dye_delete') && <Tooltip title="delete">
                                    <IconButton color="error"

                                        onClick={() => {
                                            setDialog('DeleteProductionItemDialog')
                                            setSpareDye(cell.row.original)
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
                accessorKey: 'dye_photo',
                header: 'Photo',
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
                Cell: (cell) => <>
                    {cell.row.original.dye_photo && <IconButton
                        disabled={!LoggedInUser?.assigned_permissions.includes('spare_dye_view')}
                        onClick={() => {
                            setSpareDye(cell.row.original)
                            setDialog('ViewSpareDyePhotoDialog')
                        }}

                    ><Photo />
                    </IconButton>}
                </>
            },
            {
                accessorKey: 'photo_time',
                header: 'Photo Time',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={spareDyes.map((item) => { return item.photo_time || "" })} />,
                Cell: (cell) => <>{cell.row.original.photo_time || ""}</>
            },
            {
                accessorKey: 'dye.label',
                header: 'Dye',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={spareDyes.map((item) => { return item.created_at || "" })} />, 
                Cell: (cell) => <>{cell.row.original.dye.label.toString() || "" ? cell.row.original.dye.label.toString() || "" : ""}</>,
               
            },
            {
                accessorKey: 'location.label',
                header: 'Dye Location',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={spareDyes.map((item) => { return item.location.label    || "" })} />, 
                Cell: (cell) => <>{cell.row.original.location.label.toString() || "" ? cell.row.original.location.label.toString() || "" : ""}</>,
                
            },
            {
                accessorKey: 'repair_required',
                header: 'Repair Required',
                enableColumnFilter:false,
                Cell: (cell) => <>{cell.row.original.repair_required ? "Yes" : "No"}</>
            },
            {
                accessorKey: 'remarks',
                header: 'remarks',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={spareDyes.map((item) => { return item.remarks || "" })} />, 
                Cell: (cell) => <>{cell.row.original.remarks || ""}</>
            },
            {
                accessorKey: 'created_at',
                header: 'Created At',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={spareDyes.map((item) => { return item.created_at || "" })} />, 
                Cell: (cell) => <>{cell.row.original.created_at || ""}</>
            },
            {
                accessorKey: 'created_by',
                header: 'Creator',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={spareDyes.map((item) => { return item.created_by.label || "" })} />, 
                Cell: (cell) => <>{cell.row.original.created_by.label.toString() || "" ? cell.row.original.created_by.label.toString() || "" : ""}</>,
                
            },
        ],
        [spareDyes],
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: spareDyes, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '70vh' }
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
            <Stack
                spacing={2}
                p={1}
                direction="row"
                sx={{ width: '100%' }}
                justifyContent="space-between"

            >
                <Typography
                    variant={'h6'}
                    component={'h1'}
                    sx={{ pl: 1 }}

                >
                    SpareDye
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
                        size="small"
                        SelectProps={{
                            native: true,
                        }}
                        onChange={(e) => {
                            setUserId(e.target.id)
                        }}
                        required
                        id="spareDye_owner"
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

                    <Button size="small" color="inherit" variant='contained'
                        onClick={(e) => setAnchorEl(e.currentTarget)
                        }
                    >
                        <MenuIcon />
                    </Button>
                </Stack>
            </Stack >
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
                    {LoggedInUser?.assigned_permissions.includes('spare_dye_create') && <MenuItem
                        onClick={() => {
                            setDialog('CreateOrEditSpareDyeDialog')
                            setSpareDye(undefined);
                            setAnchorEl(null)
                        }}


                    > Add New</MenuItem>}

                    {LoggedInUser?.assigned_permissions.includes('spare_dye_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                    >Export All</MenuItem>}
                    {LoggedInUser?.assigned_permissions.includes('spare_dye_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                    >Export Selected</MenuItem>}

                </Menu >
                <CreateOrEditSpareDyeDialog dialog={dialog} setDialog={setDialog} sparedye={spareDye} />
            </>
            {
                spareDye ?
                    <>

                        <DeleteProductionItemDialog dialog={dialog} setDialog={setDialog} spare_dye={spareDye} />
                        <ValidateSpareDyeDialog dialog={dialog} setDialog={setDialog} sparedye={spareDye} />
                        <ViewSpareDyePhotoDialog dialog={dialog} setDialog={setDialog} spare_dye={spareDye} />
                    </>
                    : null
            }
            <MaterialReactTable table={table} />

        </>

    )

}