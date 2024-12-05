import { Avatar, Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
   import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { Assignment, KeyOffOutlined } from '@mui/icons-material'
import { UserContext } from '../../contexts/userContext'
import { Menu as MenuIcon } from '@mui/icons-material';
import { DownloadFile } from '../../utils/DownloadFile'
import {  GetUsersForAssignment } from '../../services/UserServices'
import NewUserDialog from '../../components/dialogs/users/NewUserDialog'
import AssignPermissionsToUsersDialog from '../../components/dialogs/users/AssignPermissionsToUsersDialog'
import { ChoiceContext, UserChoiceActions } from '../../contexts/dialogContext'
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
import { GetUserDto } from '../../dtos/user.dto'

export default function UserAssignementPage() {
  const [user, setUser] = useState<GetUserDto>()
  const [users, setUsers] = useState<GetUserDto[]>([])
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>(["users"], async () => GetUsersForAssignment())
  const { user: LoggedInUser } = useContext(UserContext)
  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);  const [flag, setFlag] = useState(1);

   const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetUserDto>[]>(
    //column definitions...
    () => users && [
      {
        accessorKey: 'actions',
        header: '',
    
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') &&
                    <Tooltip title="assign users">
                      <IconButton
                        color="success"
                        size="medium"
                        onClick={() => {
                          setChoice({ type: UserChoiceActions.assign_users })
                          setUser(cell.row.original)
                        }}>
                        <Assignment />
                      </IconButton>
                    </Tooltip> 
              }

              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') &&<Tooltip title="Change Permissions for this user">
                <IconButton
                  color="info"
                  onClick={() => {
                    setChoice({ type: UserChoiceActions.assign_permissions })
                    setUser(cell.row.original)

                  }}>
                  <KeyOffOutlined />
                </IconButton>
              </Tooltip>}

            </Stack>} />

      },

      {
        accessorKey: 'dp',
        header: 'DP',
       
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
       
        Cell: (cell) => <>{[cell.row.original.username, String(cell.row.original.alias1 || ""), String(cell.row.original.alias2 || "")].filter(value => value) 
          .join(", ")}</>,
        filterVariant: 'multi-select',
        filterSelectOptions: data && users.map((i) => { return i.username.toString() }).filter(onlyUnique)
      },
      {
        accessorKey: 'is_admin',
        header: 'Role',
    
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.is_admin ? "admin" : "user"}</>,
        filterSelectOptions: data && users.map((i) => {
          if (i.is_admin) return "admin"
          return "user"
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'email',
        header: 'Email',
       
        Cell: (cell) => <>{cell.row.original.email || ""}</>
      },
      {
        accessorKey: 'mobile',
        header: 'Mobile',
        
        Cell: (cell) => <>{cell.row.original.mobile || ""}</>
      },
      {
        accessorKey: 'assigned_permissions',
        header: 'Permissions',
        
        Cell: (cell) => <>{cell.row.original.assigned_permissions.length || 0}</>
      },
      {
        accessorKey: 'last_login',
        header: 'Last Active',
        
        Cell: (cell) => <>{cell.row.original.last_login || ""}</>
      },
      {
        accessorKey: 'assigned_users',
        header: 'Assigned Users',
        
        Cell: (cell) => <Stack title={String(cell.row.original.assigned_users.length || 0)+" users"} className="scrollable-stack" direction={'row'} >{cell.row.original.assigned_users && cell.row.original.assigned_users.map((u) => { return u.label }).toString()}</Stack>
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '68vh' }
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
    initialState: {
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
    onColumnVisibilityChange: setColumnVisibility,rowVirtualizerInstanceRef, //
        columnVirtualizerOptions: { overscan: 2 },
    onSortingChange: setSorting,
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
          Users Assignment
        </Typography>

        <Stack
          direction="row"
        >
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
              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') &&<MenuItem

                onClick={() => {
                  setChoice({ type: UserChoiceActions.close_user })
                  if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                    alert("select some users")
                  }
                  else {
                    setChoice({ type: UserChoiceActions.bulk_assign_permissions })
                    setFlag(1)
                  }
                  setAnchorEl(null)
                }}
              >Assign Permissions</MenuItem>}

              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') &&<MenuItem

                onClick={() => {
                  setChoice({ type: UserChoiceActions.close_user })
                  if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                    alert("select some users")
                  }
                  else {
                    setChoice({ type: UserChoiceActions.bulk_assign_permissions })
                    setFlag(0)
                  }
                  setAnchorEl(null)
                }}
              >Remove Permissions</MenuItem>}

              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') &&<MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}
              >Export All</MenuItem>}
              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') &&<MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}
              >Export Selected</MenuItem>}
            </Menu>
            <NewUserDialog />
            <AssignPermissionsToUsersDialog flag={flag} user_ids={table.getSelectedRowModel().rows.map((I) => { return I.original._id })} />
          </>
        </Stack >
      </Stack >


      <MaterialReactTable table={table} />
      {
        user ?
          <>
            <UpdateUserDialog user={user} />
            <ResetMultiLoginDialog id={user._id} />
            <BlockMultiLoginDialog id={user._id} />
            <UpdatePasswordDialog />
            <BlockUserDialog id={user._id} />
            <UnBlockUserDialog id={user._id} />
            <MakeAdminDialog id={user._id} />
            <RemoveAdminDialog id={user._id} />
            <UpdateUsePasswordDialog user={user} />
            <AssignUsersDialog user={user} setUser={setUser} />
            <AssignPermissionsToOneUserDialog user={user} />
          </>
          : null
      }
    </>

  )

}
