import { Avatar, Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Assignment, KeyOffOutlined } from '@mui/icons-material'
import { UserContext } from '../../contexts/userContext'
import { Menu as MenuIcon } from '@mui/icons-material';
import { DownloadFile } from '../../utils/DownloadFile'
import AssignPermissionsToUsersDialog from '../../components/dialogs/users/AssignPermissionsToUsersDialog'
import PopUp from '../../components/popup/PopUp'
import AssignUsersDialog from '../../components/dialogs/users/AssignUsersDialog'
import AssignPermissionsToOneUserDialog from '../../components/dialogs/users/AssignPermissionsToOneUserDialog'
import ExportToExcel from '../../utils/ExportToExcel'
import { UserService } from '../../services/UserServices'
import { GetUserDto } from '../../dtos/UserDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'

export default function UserAssignementPage() {
  const [user, setUser] = useState<GetUserDto>()
  const [users, setUsers] = useState<GetUserDto[]>([])
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>(["users"], async () => new UserService().GetUsersForAssignment())
  const { user: LoggedInUser } = useContext(UserContext)
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null); const [flag, setFlag] = useState(1);

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetUserDto>[]>(
    //column definitions...
    () => users && [
      {
        accessorKey: 'actions',   enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
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
                      setDialog('AssignUsersDialog')
                      setUser(cell.row.original)
                    }}>
                    <Assignment />
                  </IconButton>
                </Tooltip>
              }

              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') && <Tooltip title="Change Permissions for this user">
                <IconButton
                  color="info"
                  onClick={() => {
                    setDialog('AssignPermissionsToOneUserDialog')
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
          enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
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
        accessorKey: 'assigned_permissions',
        header: 'Permissions',
          enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
        Cell: (cell) => <>{cell.row.original.assigned_permissions.length || 0}</>
      },
      {
        accessorKey: 'last_login',
        header: 'Last Active',
          enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
        Cell: (cell) => <>{cell.row.original.last_login || ""}</>
      },
      {
        accessorKey: 'assigned_users',
        header: 'Assigned Users',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={users.map((item) => { return String(item.assigned_users) || "" })} />,
        Cell: (cell) => <Stack title={String(cell.row.original.assigned_users.length || 0) + " users"} className="scrollable-stack" direction={'row'} >{cell.row.original.assigned_users && cell.row.original.assigned_users}</Stack>
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
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //
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
              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') && <MenuItem

                onClick={() => {
                  setDialog('AssignPermissionsToUsersDialog')
                  if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                    alert("select some users")
                  }
                  else {
                    setDialog('AssignPermissionsToUsersDialog')
                    setFlag(1)
                  }
                  setAnchorEl(null)
                }}
              >Assign Permissions</MenuItem>}

              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') && <MenuItem

                onClick={() => {
                  setDialog('AssignPermissionsToUsersDialog')
                  if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                    alert("select some users")
                  }
                  else {
                    setDialog('AssignPermissionsToUsersDialog')
                    setFlag(0)
                  }
                  setAnchorEl(null)
                }}
              >Remove Permissions</MenuItem>}

              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') && <MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}
              >Export All</MenuItem>}
              {LoggedInUser?.assigned_permissions.includes('user_assignment_edit') && <MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}
              >Export Selected</MenuItem>}
            </Menu>
            <AssignPermissionsToUsersDialog dialog={dialog} setDialog={setDialog} flag={flag} user_ids={table.getSelectedRowModel().rows.map((I) => { return I.original._id })} />
          </>
        </Stack >
      </Stack >


      <MaterialReactTable table={table} />
      {
        user ?
          <>
            <AssignUsersDialog dialog={dialog} setDialog={setDialog} user={user} setUser={setUser} />
            <AssignPermissionsToOneUserDialog dialog={dialog} setDialog={setDialog} user={user} />
          </>
          : null
      }
    </>

  )

}
