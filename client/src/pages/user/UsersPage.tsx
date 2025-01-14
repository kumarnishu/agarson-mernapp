import { Avatar, Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Assignment, Block, DeviceHubOutlined, Edit, GroupAdd, GroupRemove, Key, KeyOffOutlined, RemoveCircle, Restore, RoundaboutLeft } from '@mui/icons-material'
import { UserContext } from '../../contexts/userContext'
import { Menu as MenuIcon } from '@mui/icons-material';
import { DownloadFile } from '../../utils/DownloadFile'
import NewUserDialog from '../../components/dialogs/users/NewUserDialog'
import AssignPermissionsToUsersDialog from '../../components/dialogs/users/AssignPermissionsToUsersDialog'
import PopUp from '../../components/popup/PopUp'
import UpdateUserDialog from '../../components/dialogs/users/UpdateUserDialog'
import ResetMultiLoginDialog from '../../components/dialogs/users/ResetMultiLogin'
import BlockMultiLoginDialog from '../../components/dialogs/users/BlockMultiLoginDialog'
import UpdatePasswordDialog from '../../components/dialogs/users/UpdatePasswordDialog'
import BlockUserDialog from '../../components/dialogs/users/BlockUserDialog'
import UnBlockUserDialog from '../../components/dialogs/users/UnBlockUserDialog'
import MakeAdminDialog from '../../components/dialogs/users/MakeAdminDialog'
import RemoveAdminDialog from '../../components/dialogs/users/RemoveAdminDialog'
import UpdateUsePasswordDialog from '../../components/dialogs/users/UpdateUsePasswordDialog'
import AssignUsersDialog from '../../components/dialogs/users/AssignUsersDialog'
import AssignPermissionsToOneUserDialog from '../../components/dialogs/users/AssignPermissionsToOneUserDialog'
import ExportToExcel from '../../utils/ExportToExcel'
import { AlertContext } from '../../contexts/alertContext'
import { UserService } from '../../services/UserServices'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { GetUserDto } from '../../dtos/response/UserDto'
import { CreateLoginByThisUserDto } from '../../dtos/request/UserDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'

export default function UsersPage() {
    const [hidden, setHidden] = useState(false)
    const [user, setUser] = useState<GetUserDto>()
    const [users, setUsers] = useState<GetUserDto[]>([])
    const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>(["users", hidden], async () => new UserService().GetUsers({ hidden: hidden }))
    const { user: LoggedInUser } = useContext(UserContext)
    const [dialog, setDialog] = useState<string | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [flag, setFlag] = useState(1);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const { setAlert } = useContext(AlertContext)

    const isFirstRender = useRef(true);
    const { mutate } = useMutation
        <AxiosResponse<{ user: GetUserDto, token: string }>,
            BackendError,
            { body: CreateLoginByThisUserDto }
        >(new UserService().LoginByThisUser, {
            onSuccess: () => {
                window.location.reload()
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const columns = useMemo<MRT_ColumnDef<GetUserDto>[]>(
        //column definitions...
        () => users && [
            {
                accessorKey: 'actions', enableColumnFilter: false,
                header: 'Action',

                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row">

                            {/* edit icon */}
                            {LoggedInUser?._id === cell.row.original._id ?
                                <Tooltip title="edit">
                                    <IconButton
                                        color="success"
                                        size="medium"
                                        onClick={() => {
                                            setDialog('UpdateUserDialog')
                                            setUser(cell.row.original)
                                        }}>
                                        <Edit />
                                    </IconButton>
                                </Tooltip> :
                                <Tooltip title="edit">
                                    <IconButton
                                        disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                        color="success"
                                        size="medium"
                                        onClick={() => {
                                            setDialog('UpdateUserDialog')
                                            setUser(cell.row.original)
                                        }}>
                                        <Edit />
                                    </IconButton>
                                </Tooltip>
                            }
                            {/* assign user */}
                            {LoggedInUser?._id === cell.row.original._id ?
                                <Tooltip title="assign users">
                                    <IconButton
                                        color="success"
                                        size="medium"
                                        onClick={() => {
                                            setDialog('AssignUsersDialog')
                                            setUser(cell.row.original)
                                        }}>
                                        <Assignment />
                                    </IconButton>
                                </Tooltip> :
                                <Tooltip title="assign users">
                                    <IconButton
                                        disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                        color="success"
                                        size="medium"
                                        onClick={() => {
                                            setDialog('AssignUsersDialog')
                                            setUser(cell.row.original)
                                        }}>
                                        <Assignment />
                                    </IconButton>
                                </Tooltip>}
                            {/* admin icon */}
                            {LoggedInUser?.created_by.id === cell.row.original._id ?
                                null
                                :
                                <>
                                    {cell.row.original.role == "admin" ?
                                        < Tooltip title="Remove admin"><IconButton size="medium"
                                            disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                            color="error"
                                            onClick={() => {
                                                setDialog('RemoveAdminDialog')
                                                setUser(cell.row.original)

                                            }}>
                                            <GroupRemove />
                                        </IconButton>
                                        </Tooltip>
                                        :
                                        <Tooltip title="make admin"><IconButton size="medium"
                                            disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                            onClick={() => {
                                                setDialog('MakeAdminDialog')
                                                setUser(cell.row.original)

                                            }}>
                                            <GroupAdd />
                                        </IconButton>
                                        </Tooltip>}
                                </>
                            }
                            {/* multi login */}

                            {LoggedInUser?.created_by.id === cell.row.original._id ?
                                null :
                                <>
                                    {
                                        cell.row.original.is_multi_login ?
                                            <Tooltip title="Block multi login"><IconButton
                                                size="medium"
                                                color="error"
                                                disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                                onClick={() => {
                                                    setDialog('BlockMultiLoginDialog')
                                                    setUser(cell.row.original)

                                                }}
                                            >
                                                <DeviceHubOutlined />
                                            </IconButton>
                                            </Tooltip> :
                                            <Tooltip title="Reset multi login">
                                                <IconButton
                                                    disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                                    size="medium"
                                                    onClick={() => {
                                                        setDialog('ResetMultiLoginDialog')
                                                        setUser(cell.row.original)

                                                    }}
                                                >
                                                    <Restore />
                                                </IconButton>
                                            </Tooltip>
                                    }
                                </>
                            }



                            {/*  block login */}
                            {LoggedInUser?.created_by.id === cell.row.original._id ?
                                null :
                                <>
                                    {cell.row.original?.is_active ?
                                        <Tooltip title="block"><IconButton
                                            size="medium"
                                            disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                            onClick={() => {
                                                setDialog('BlockUserDialog')
                                                setUser(cell.row.original)

                                            }}
                                        >
                                            <Block />
                                        </IconButton>
                                        </Tooltip>
                                        :
                                        < Tooltip title="unblock">
                                            <IconButton
                                                color="warning"
                                                disabled={cell.row.original?.created_by.id === cell.row.original._id}
                                                size="medium"
                                                onClick={() => {
                                                    setDialog('UnBlockUserDialog')
                                                    setUser(cell.row.original)

                                                }}>
                                                <RemoveCircle />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                </>
                            }

                            {LoggedInUser?.created_by.id === cell.row.original._id ?
                                null
                                :
                                <Tooltip title="Change Password for this user">
                                    <IconButton
                                        disabled={cell.row.original?.created_by.id === cell.row.original._id} size="medium"
                                        onClick={() => {
                                            setDialog('UpdateUsePasswordDialog')
                                            setUser(cell.row.original)

                                        }}>
                                        <Key />
                                    </IconButton>
                                </Tooltip>
                            }
                            <Tooltip title="Change Permissions for this user">
                                <IconButton
                                    color="info"
                                    onClick={() => {
                                        setDialog('AssignPermissionsToOneUserDialog')
                                        setUser(cell.row.original)

                                    }}>
                                    <KeyOffOutlined />
                                </IconButton>
                            </Tooltip>
                            {LoggedInUser?._id !== cell.row.original._id && LoggedInUser?.role == "admin" && < Tooltip title={`login as this user ${cell.row.original.username || ""}`}>
                                <IconButton
                                    disabled={LoggedInUser?._id === cell.row.original._id}
                                    color="info"
                                    onClick={() => mutate({ body: { user_id: cell.row.original._id || "", impersnate_id: LoggedInUser._id || "" } })}
                                >
                                    <RoundaboutLeft />
                                </IconButton>
                            </Tooltip>}
                        </Stack >} />


            },

            {
                accessorKey: 'dp',
                header: 'DP',
                enableColumnFilter: false,
                Cell: (cell) => <Avatar
                    title="double click to download"
                    sx={{ width: 16, height: 16 }}
                    onDoubleClick={() => {
                        if (cell.row.original.dp && cell.row.original.dp) {
                            DownloadFile(cell.row.original.dp, "profile")
                        }
                    }}

                    alt="display picture" src={cell.row.original && cell.row.original.dp} />
            },
            {
                accessorKey: 'username',
                header: 'Name',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={users.map((item) => { return String(item.username) || "" })} />,
                Cell: (cell) => <>{[cell.row.original.username, String(cell.row.original.alias1 || ""), String(cell.row.original.alias2 || "")].filter(value => value)
                    .join(", ")}</>,

            },
            {
                accessorKey: 'role',
                header: 'Role',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={users.map((item) => { return String(item.role) || "" })} />,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={users.map((item) => { return String(item.email) || "" })} />,
                Cell: (cell) => <>{cell.row.original.email || ""}</>
            },
            {
                accessorKey: 'mobile',
                header: 'Mobile',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={users.map((item) => { return String(item.mobile) || "" })} />,
                Cell: (cell) => <>{cell.row.original.mobile || ""}</>
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                Cell: (cell) => <>{cell.row.original.is_active ? "active" : "blocked"}</>,
                enableColumnFilter: false,
            },
            {
                accessorKey: 'password',
                header: 'Password',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={users.map((item) => { return String(item.orginal_password) || "" })} />,
                Cell: (cell) => <>{cell.row.original.orginal_password}</>,
            },
            {
                accessorKey: 'assigned_permissions',
                header: 'Permissions',
                enableColumnFilter: false,
                Cell: (cell) => <>{cell.row.original.assigned_permissions.length || 0}</>
            },

            {
                accessorKey: 'is_multi_login',
                header: 'Multi Device',
                enableColumnFilter: false,
                Cell: (cell) => <>{cell.row.original.is_multi_login ? "Allowed" : "Blocked"}</>
            },
            {
                accessorKey: 'assigned_users',
                header: 'Assigned Users',
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={users.map((item) => { return String(item.assigned_users) || "" })} />,
                Cell: (cell) => <Stack title={String(cell.row.original.assigned_users.length || 0) + " users"} className="scrollable-stack" direction={'row'} >{cell.row.original.assigned_users && cell.row.original.assigned_users}</Stack>
            },
            {
                accessorKey: 'last_login',
                header: 'Last Active',
                enableColumnFilter: false,
                Cell: (cell) => <>{cell.row.original.last_login || ""}</>
            },


        ],
        [users],
        //end
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: users, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
        }), muiTableHeadCellProps: ({ column }) => ({
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
        muiTableHeadRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
                border: '1px solid lightgrey;',
            },
        }),
        muiTableBodyCellProps: () => ({
            sx: {
                border: '1px solid lightgrey;',
            },
        }),
        muiPaginationProps: {
            rowsPerPageOptions: [100, 200, 500, 1000],
            shape: 'rounded',
            variant: 'outlined',
        },
        enableDensityToggle: false, initialState: {
            density: 'compact', showGlobalFilter: true, pagination: { pageIndex: 0, pageSize: 100 }
        },
        enableGrouping: true,
        enableRowSelection: true,
        manualPagination: false,
        enablePagination: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        enableTableFooter: true,
        enableRowVirtualization: true,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnSizingChange: setColumnSizing, state: {
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
            setUsers(data.data)
        }
    }, [isSuccess, data])

    return (
        <>
            <Stack
                spacing={2}
                padding={1}
                direction="row"
                justifyContent="space-between"

            >
                <Typography
                    variant={'h6'}
                    component={'h1'}
                    sx={{ pl: 1 }}
                >
                    Users
                </Typography>

                <Stack
                    direction="row"
                >

                    < Stack direction="row" spacing={2}>
                        <Stack direction={'row'} alignItems={'center'}>
                            <input type='checkbox' onChange={() => setHidden(!hidden)} /> <span style={{ paddingLeft: '5px' }}>Blocked</span>
                        </Stack >

                    </Stack >
                    {/* user menu */}
                    <>
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
                            {

                                <MenuItem onClick={() => {
                                    setDialog('NewUserDialog')
                                    setAnchorEl(null)
                                }}
                                >New User</MenuItem>}


                            <MenuItem

                                onClick={() => {
                                    if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                                        setAlert({ message: "select some users", color: 'info' })
                                    }
                                    else {
                                        setDialog('AssignPermissionsToUsersDialog')
                                        setFlag(1)
                                    }
                                    setAnchorEl(null)
                                }}
                            >Assign Permissions</MenuItem>

                            <MenuItem

                                onClick={() => {
                                    if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                                        setAlert({ message: "select some users", color: 'info' })
                                    }
                                    else {
                                        setDialog('AssignPermissionsToUsersDialog')
                                        setFlag(0)
                                    }
                                    setAnchorEl(null)
                                }}
                            >Remove Permissions</MenuItem>

                            <MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}
                            >Export All</MenuItem>
                            <MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}
                            >Export Selected</MenuItem>
                        </Menu>
                        <NewUserDialog dialog={dialog} setDialog={setDialog} />
                        <AssignPermissionsToUsersDialog dialog={dialog} setDialog={setDialog} flag={flag} user_ids={table.getSelectedRowModel().rows.map((I) => { return I.original._id })} />
                    </>
                </Stack >
            </Stack >


            <MaterialReactTable table={table} />
            {
                user ?
                    <>
                        <UpdateUserDialog dialog={dialog} setDialog={setDialog} user={user} />
                        <ResetMultiLoginDialog dialog={dialog} setDialog={setDialog} id={user._id} />
                        <BlockMultiLoginDialog dialog={dialog} setDialog={setDialog} id={user._id} />
                        <UpdatePasswordDialog dialog={dialog} setDialog={setDialog} />
                        <BlockUserDialog dialog={dialog} setDialog={setDialog} id={user._id} />
                        <UnBlockUserDialog dialog={dialog} setDialog={setDialog} id={user._id} />
                        <MakeAdminDialog dialog={dialog} setDialog={setDialog} id={user._id} />
                        <RemoveAdminDialog dialog={dialog} setDialog={setDialog} id={user._id} />
                        <UpdateUsePasswordDialog dialog={dialog} setDialog={setDialog} user={user} />
                        <AssignUsersDialog dialog={dialog} setDialog={setDialog} user={user} setUser={setUser} />
                        <AssignPermissionsToOneUserDialog dialog={dialog} setDialog={setDialog} user={user} />
                    </>
                    : null
            }
        </>

    )

}
