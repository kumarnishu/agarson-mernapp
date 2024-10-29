import { useContext, useEffect, useMemo, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, Fade, IconButton,  Menu, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { GetUsers } from '../../services/UserServices'
import { toTitleCase } from '../../utils/TitleCase'
import { GetUserDto } from '../../dtos/users/user.dto'
import { DropDownDto } from '../../dtos/common/dropdown.dto'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { ChoiceContext, MaintenanceChoiceActions } from '../../contexts/dialogContext'
import PopUp from '../../components/popup/PopUp'
import { Check, Close, Delete, Edit, FilterAlt, FilterAltOff, Fullscreen, FullscreenExit, RemoveRedEye } from '@mui/icons-material'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { GetMaintenanceDto, GetMaintenanceItemDto } from '../../dtos/maintenance/maintenance.dto'
import {  GetAllMaintenanceCategory, GetAllMaintenanceReport, ToogleMaintenanceItem } from '../../services/MaintenanceServices'
import DeleteMaintenanceDialog from '../../components/dialogs/maintenance/DeleteMaintenanceDialog'
import CreateOrEditMaintenanceDialog from '../../components/dialogs/maintenance/CreateOrEditMaintenanceDialog'
import CreateOrEditMaintenanceItemRemarkDialog from '../../components/dialogs/maintenance/AddMaintenanceItemRemarkDialog'
import ViewMaintenaceRemarkHistoryDialog from '../../components/dialogs/maintenance/ViewMaintenaceRemarkHistoryDialog'
import AlertBar from '../../components/snacks/AlertBar'
import { queryClient } from '../../main'


function MaintenanceItem({ item, setItem, maintenance, setMaintenance }: { item: GetMaintenanceItemDto | undefined, setItem: React.Dispatch<React.SetStateAction<GetMaintenanceItemDto | undefined>>, maintenance: GetMaintenanceDto, setMaintenance: React.Dispatch<React.SetStateAction<GetMaintenanceDto | undefined>> }) {
    const [localItem, setLocalitem] = useState(item)
    const { setChoice } = useContext(ChoiceContext)
    const { mutate, error } = useMutation
        <AxiosResponse<any>, BackendError, { id: string; }>
        (ToogleMaintenanceItem, {
            onSuccess: () => {
                queryClient.invalidateQueries('maintenances')
                queryClient.invalidateQueries('maintenances_report')
            }
        })

    useEffect(() => {
        setLocalitem(item)
    }, [item])

    return (
        <>  {error && <AlertBar message='error occurred' color='error' />}
            {localItem  && 
            <Stack direction={'row'} sx={{ border: 1, gap: 1, pl: 1, pr: 0.2, cursor: 'pointer', scrollbarWidth: 0, borderRadius: 2, backgroundColor: localItem.is_required ? (localItem.stage == "done" ? "green" : "red") : "grey" }}
            >
                <IconButton size="small" onClick={() => {
                    setLocalitem({ ...localItem, is_required: !localItem.is_required })
                    mutate({ id: localItem._id });
                    setChoice({ type: MaintenanceChoiceActions.toogle_maintenace_item })
                    setItem(localItem)
                    setMaintenance(maintenance)
                }}
                    title="toogle required" sx={{ color: 'white' }}>
                    {localItem.is_required ? <Close sx={{ height: 15 }} /> : <Check sx={{ height: 15 }} />}
                </IconButton>


                <IconButton size="small" onClick={() => {
                    setChoice({ type: MaintenanceChoiceActions.view_maintance_remarks })
                    setItem(localItem)
                    setMaintenance(maintenance)
                }} title="view remarks" sx={{ color: 'white' }}>
                    <RemoveRedEye />
                </IconButton>


                <IconButton size="small" disabled={!localItem?.is_required || localItem.stage == 'done'} onClick={() => {
                    setItem(localItem)
                    setMaintenance(maintenance)
                    setChoice({ type: MaintenanceChoiceActions.create_or_edit_maintenance_remarks })
                }}>
                    <Typography title="add remark" sx={{ color: "white" }}>{localItem.item}</Typography>
                </IconButton>
            </Stack>}
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
    const [item, setItem] = useState<GetMaintenanceItemDto>()
    const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("maintenance_categories", GetAllMaintenanceCategory)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'feature_menu', show_assigned_only: true }))
    const { data, isLoading, refetch } = useQuery<AxiosResponse<{ result: GetMaintenanceDto[], page: number, total: number, limit: number }>, BackendError>(["maintenances_report", userId], async () => GetAllMaintenanceReport({ limit: paginationData?.limit, page: paginationData?.page, id: userId }))
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
                            {LoggedInUser?.assigned_permissions.includes('maintenance_admin_delete') && <Tooltip title="delete">
                                <IconButton color="error"

                                    onClick={() => {

                                        setChoice({ type: MaintenanceChoiceActions.delete_maintenance })
                                        setMaintenance(cell.row.original)


                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>}
                            {LoggedInUser?.assigned_permissions.includes('maintenance_admin_edit') &&
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
                accessorKey: 'frequency',
                header: ' Frequency',
                size: 150,
                Cell: (cell) => <>{cell.row.original.frequency ? cell.row.original.frequency : ""}</>
            },
            {
                accessorKey: 'user',
                header: 'Responsible',
                size: 150,
                Cell: (cell) => <>{cell.row.original.user.label ? cell.row.original.user.label : ""}</>
            },
            {
                accessorKey: 'category',
                header: ' Category',
                size: 150,
                Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.value : ""}</>
            },
            {
                accessorKey: 'items',
                header: ' Items',
                grow: true,
                size: 600,
                Cell: (cell) => <>{cell.row.original.items.length > 0 ? <Stack direction={'row'} gap={1} minWidth={600} sx={{ overflowX: 'scroll' }}>
                    {cell.row.original.items && cell.row.original.items.map((it) => {
                        return (
                            <>
                                <MaintenanceItem item={it} setItem={setItem} maintenance={cell.row.original} setMaintenance={setMaintenance} />
                            </>
                        )
                    })}
                </Stack>
                    : ""}</>
            },
            {
                accessorKey: 'item',
                header: ' Maintainable Item',
                size: 150,
                Cell: (cell) => <>{cell.row.original.item ? cell.row.original.item : ""}</>
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

                {LoggedInUser?.assigned_permissions.includes('maintenance_admin_create') && <MenuItem

                    onClick={() => {
                        setChoice({ type: MaintenanceChoiceActions.create_or_edit_maintenance })
                        setMaintenance(undefined)
                        setAnchorEl(null)
                    }}
                > Add New</MenuItem>}
                {LoggedInUser?.assigned_permissions.includes('maintenance_admin_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                >Export All</MenuItem>}
                {LoggedInUser?.assigned_permissions.includes('maintenance_admin_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                >Export Selected</MenuItem>}
            </Menu>
            <Stack sx={{ px: 2 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>

                <Typography variant="h6">Maintainance Admin</Typography>
                <Stack sx={{ px: 2 }} direction='row' alignItems={'center'}>
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
            <CreateOrEditMaintenanceDialog maintenance={maintenance} setMaintenance={setMaintenance} />
            {choice === MaintenanceChoiceActions.delete_maintenance && maintenance && <DeleteMaintenanceDialog maintenance={maintenance} />}
            <MaterialReactTable table={table} />
            {item && maintenance && <CreateOrEditMaintenanceItemRemarkDialog item={item} maintenance_id={maintenance._id} />}
            {item && choice == MaintenanceChoiceActions.view_maintance_remarks && <ViewMaintenaceRemarkHistoryDialog id={item._id} />}
        </>
    )
}

export default MaintenanceReportPage