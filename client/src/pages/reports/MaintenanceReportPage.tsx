import { useContext, useEffect, useMemo, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, Fade, IconButton, LinearProgress, Menu, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { GetUsers } from '../../services/UserServices'
import { toTitleCase } from '../../utils/TitleCase'
import { GetUserDto } from '../../dtos/users/user.dto'
import { DropDownDto } from '../../dtos/common/dropdown.dto'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { ChoiceContext, MaintenanceChoiceActions } from '../../contexts/dialogContext'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit, FilterAlt, FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { GetMaintenanceItemDto, GetMaintenanceDto } from '../../dtos/maintenance/maintenance.dto'
import { GetAllMaintenanceCategory, GetAllMaintenanceReport } from '../../services/MaintenanceServices'
import DeleteMaintenanceDialog from '../../components/dialogs/maintenance/DeleteMaintenanceDialog'
import CreateOrEditMaintenanceDialog from '../../components/dialogs/maintenance/CreateOrEditMaintenanceDialog'
import moment from 'moment'


function MaintenanceItem({ item }: {
    item: GetMaintenanceItemDto
}) {
    const [localItem, setLocalitem] = useState<{
        dt1: string;
        dt2: string;
        checked: boolean;
    }>()
    return (
        <>
            <Stack  gap={1} sx={{ overflow: 'scroll' }}>
                <p>{item.boxes?.length}</p>
                {item.boxes && item.boxes.map((item) => {
                    return (
                        <Stack sx={{ border: 1, gap: 1, pl: 1, pr: 0.2, cursor: 'pointer', scrollbarWidth: 0, borderRadius: 2, backgroundColor: item.checked ? 'green' : "red" }}

                        >
                            <Button>{new Date(item.dt1).getDate()}</Button>

                        </Stack>
                    )
                })}
            </Stack>
        </>
    )
}
function MaintenanceReportPage() {
    const { user: LoggedInUser } = useContext(UserContext)
    const [users, setUsers] = useState<GetUserDto[]>([])
    const [maintenance, setMaintenance] = useState<GetMaintenanceDto>()
    const [maintenances, setMaintenances] = useState<GetMaintenanceDto[]>([])
    const [paginationData, setPaginationData] = useState({ limit: 500, page: 1, total: 1 });
    const [category, setCategory] = useState<string>('undefined');
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const [userId, setUserId] = useState<string>()
    const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
        start_date: moment(new Date().setDate(new Date().getDate() - 30)).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate())).format("YYYY-MM-DD")
    })
    const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("maintenance_categories", GetAllMaintenanceCategory)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'feature_menu', show_assigned_only: true }))
    const { data, isLoading, refetch, isRefetching } = useQuery<AxiosResponse<{ result: GetMaintenanceDto[], page: number, total: number, limit: number }>, BackendError>(["maintenance_reports", userId, dates?.start_date, dates?.end_date], async () => GetAllMaintenanceReport({ limit: paginationData?.limit, page: paginationData?.page, id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const columns = useMemo<MRT_ColumnDef<GetMaintenanceDto>[]>(
        //column definitions...
        () => maintenances && [
            {
                accessorKey: 'actions',
                header: '',
                maxSize: 50,
                size: 120,
                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row" spacing={1}>
                            {LoggedInUser?.assigned_permissions.includes('maintenance_delete') && <Tooltip title="delete">
                                <IconButton color="error"

                                    onClick={() => {

                                        setChoice({ type: MaintenanceChoiceActions.delete_maintenance })
                                        setMaintenance(cell.row.original)


                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>}
                            {LoggedInUser?.assigned_permissions.includes('maintenance_edit') &&
                                <Tooltip title="Edit">
                                    <IconButton
                                        onClick={() => {

                                            setChoice({ type: MaintenanceChoiceActions.create_or_edit_maintenance })
                                            setMaintenance(cell.row.original)

                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                </Tooltip>}

                        </Stack>}
                />
            },
            {
                accessorKey: 'work',
                header: ' Work Title',
                size: 320,
                Cell: (cell) => <>{cell.row.original.work ? cell.row.original.work : ""}</>
            },
            {
                accessorKey: 'category',
                header: ' Category',
                size: 150,
                Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.value : ""}</>
            },
            {
                accessorKey: 'user',
                header: 'Responsible',
                size: 150,
                Cell: (cell) => <>{cell.row.original.user.label ? cell.row.original.user.label : ""}</>
            },

            {
                accessorKey: 'frequency',
                header: ' Frequency',
                size: 150,
                Cell: (cell) => <>{cell.row.original.frequency ? cell.row.original.frequency : ""}</>
            },
            {
                accessorKey: 'item',
                header: ' Maintainable Item',
                size: 150,
                Cell: (cell) => <>{cell.row.original.item ? cell.row.original.item : ""}</>
            },
            {
                accessorKey: 'items',
                header: ' Items',
                grow: true,
                size: 400,
                Cell: (cell) => <>{cell.row.original.items.length > 0 ? <Stack direction={'row'} gap={1} maxWidth={600} sx={{ overflowX: 'scroll' }}>
                    {cell.row.original.items && cell.row.original.items.map((item) => {
                        return (
                            <MaintenanceItem item={item} />
                        )
                    })}
                </Stack>
                    : ""}</>
            },

        ],
        [maintenances],
    );
    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: maintenances, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
                fontSize: '14px'
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
        }),
        muiTableHeadRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
                border: '1px solid lightgrey;',
            },
        }),
        renderTopToolbarCustomActions: ({ table }) => (

            <Stack
                sx={{ width: '100%' }}
                pt={1}
                direction="row"
                alignItems={'center'}
                justifyContent="space-between">
                <Stack direction={'row'} gap={1}>
                    {categories.map((category, index) => (
                        <span
                            key={index}
                        >
                            <span key={category.id} style={{ paddingLeft: '25px' }}>{toTitleCase(category.label)} : {maintenances.filter((r) => r.category.id == category.id.toLowerCase()).length || 0}</span>
                        </span>
                    ))}
                </Stack>

                <Stack justifyContent={'right'} direction={'row'} gap={1}>
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
            </Stack>
        ),
        renderBottomToolbarCustomActions: () => (
            <DBPagination paginationData={paginationData} refetch={refetch} setPaginationData={setPaginationData} />

        ),
        muiTableBodyCellProps: () => ({
            sx: {
                border: '1px solid lightgrey;',
                fontSize: '13px'
            },
        }),
        enableToolbarInternalActions: false,
        initialState: { density: 'compact' },
        enableRowSelection: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        onSortingChange: setSorting,
        enableTableFooter: true,
        enableRowVirtualization: true,
        state: { sorting, isLoading: isLoading },
        enableBottomToolbar: true,
        enableGlobalFilter: false,
        enablePagination: false,
        manualPagination: true
    });

    useEffect(() => {
        if (categorySuccess)
            setCategories(categorydata?.data)
    }, [categorySuccess])

    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [users, isUsersSuccess, usersData])


    useEffect(() => {
        if (data) {
            setMaintenances(data.data.result)
            setPaginationData({
                ...paginationData,
                page: data.data.page,
                limit: data.data.limit,
                total: data.data.total
            })
        }
    }, [data])
    return (
        <>

            {
                isLoading || isRefetching && <LinearProgress color='secondary' />
            }
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

                {LoggedInUser?.assigned_permissions.includes('maintenance_create') && <MenuItem

                    onClick={() => {
                        setChoice({ type: MaintenanceChoiceActions.create_or_edit_maintenance })
                        setMaintenance(undefined)
                        setAnchorEl(null)
                    }}
                > Add New</MenuItem>}
                {LoggedInUser?.assigned_permissions.includes('maintenance_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                >Export All</MenuItem>}
                {LoggedInUser?.assigned_permissions.includes('maintenance_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                >Export Selected</MenuItem>}
            </Menu>
            <Stack sx={{ px: 2 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>

                <Typography variant="h6">Maintainance</Typography>
                <Stack sx={{ px: 2 }} direction='row' alignItems={'center'}>
                    < TextField
                        size="small"
                        type="date"
                        id="start_date"
                        label="Start Date"
                        fullWidth
                        focused
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
                        type="date"
                        id="end_date"
                        size="small"
                        label="End Date"
                        value={dates.end_date}
                        focused
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
                    {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 && <Select
                        sx={{ m: 1, width: 300 }}
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                        }}
                        size='small'
                    >
                        <MenuItem
                            key={'00'}
                            value={'undefined'}
                            onChange={() => setCategory('undefined')}
                        >
                            All
                        </MenuItem>
                        {categories.map((category, index) => (
                            <MenuItem
                                key={index}
                                value={category.value}
                            >
                                {toTitleCase(category.label)}
                            </MenuItem>
                        ))}
                    </Select>}

                    {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 &&
                        < TextField
                            select

                            size="small"
                            SelectProps={{
                                native: true,
                            }}
                            onChange={(e) => {
                                setUserId(e.target.value)
                            }}
                            required
                            id="maintenance_owners"
                            label="Person"
                            fullWidth
                        >
                            <option key={'00'} value={undefined}>

                            </option>
                            {
                                users.map((user, index) => {

                                    return (<option key={index} value={user._id}>
                                        {user.username}
                                    </option>)

                                })
                            }
                        </TextField>}
                </Stack>
            </Stack>
            {maintenance && <DeleteMaintenanceDialog maintenance={maintenance} />}
            <CreateOrEditMaintenanceDialog maintenance={maintenance} setMaintenance={setMaintenance} />
            {choice === MaintenanceChoiceActions.delete_maintenance && maintenance && <DeleteMaintenanceDialog maintenance={maintenance} />}
            <MaterialReactTable table={table} />
        </>
    )
}

export default MaintenanceReportPage