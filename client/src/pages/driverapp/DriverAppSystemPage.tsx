import { Button, Fade, IconButton, LinearProgress, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Delete, FilterAlt, FilterAltOff, Menu as MenuIcon, Photo } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import PopUp from '../../components/popup/PopUp'
import moment from 'moment'
import ViewDriverSystemPhotoDialog from '../../components/dialogs/driverapp/ViewDriverSystemPhotoDialog'
import DeleteDriverSystemDialog from '../../components/dialogs/driverapp/DeleteDriverSystemDialog'
import { UserService } from '../../services/UserServices'
import { DriverAppService } from '../../services/DriverAppService'
import { GetDriverSystemDto } from '../../dtos/DriverAppDto'
import { DropDownDto } from '../../dtos/DropDownDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function DriverAppSystemPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [system, setSystem] = useState<GetDriverSystemDto>()
  const [systems, setSystems] = useState<GetDriverSystemDto[]>([])
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [userId, setUserId] = useState<string>()
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date()).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
  })
  const { data, isLoading, isSuccess, isRefetching } = useQuery<AxiosResponse<GetDriverSystemDto[]>, BackendError>(["driver_app", userId, dates?.start_date, dates?.end_date], async () => new DriverAppService().GetDriverSystems({ id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))

  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'driver_system_view', show_assigned_only: true }))

  useEffect(() => {
    if (isUsersSuccess)
      setUsers(usersData?.data)
  }, [users, isUsersSuccess, usersData])



  useEffect(() => {
    if (data && isSuccess) {
      setSystems(data.data)
    }
  }, [data, isSuccess])
  console.log(systems)

  const columns = useMemo<MRT_ColumnDef<GetDriverSystemDto>[]>(
    () => systems && [
      {
        accessorKey: 'actions', enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        header: 'Action',


        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>



              {LoggedInUser?.role == "admin" && LoggedInUser?.assigned_permissions.includes('driver_system_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {
                    setDialog('DeleteDriverSystemDialog')
                    setSystem(cell.row.original)
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}


            </Stack>}
        />
      },

      {
        accessorKey: 'photo',
        header: 'Photos',
        enableColumnFilter: false,
        Cell: (cell) => <>
          {cell.row.original.photo && <Photo onClick={() => {
            setSystem(cell.row.original)
            setDialog('ViewDriverSystemPhotoDialog')
          }} sx={{ height: 15, width: 15, color: 'grey', cursor: 'pointer' }} />
          }

        </>
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={systems.map((item) => { return item.created_at || "" })} />,
      },

      {
        accessorKey: 'location',
        header: 'Location',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={systems.map((item) => { return item.location || "" })} />,
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={systems.map((item) => { return item.updated_at || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_at || ""}</>
      },
      {
        accessorKey: 'updated_by.label',
        header: 'Creator',
        Cell: (cell) => <>{cell.row.original.updated_by.label.toString() || "" ? cell.row.original.updated_by.label.toString() || "" : ""}</>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={systems.map((item) => { return item.updated_by.label || "" })} />,
      },
    ],
    [systems],
  );


  const table = useMaterialReactTable({
    //@ts-ignore
    columns, columnFilterDisplayMode: 'popover',
    data: systems, //10,000 rows       
    enableColumnResizing: true,
    enableRowVirtualization: true,
    rowVirtualizerInstanceRef, //optional
    // , //optionally customize the row virtualizr
    // columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizr
    enableStickyFooter: true,
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
      rowsPerPageOptions: [10, 100, 200, 500, 1000, 2000, 5000, 7000, 10000],
      shape: 'rounded',
      variant: 'outlined',
    },
    enableDensityToggle: false, initialState: {
      density: 'compact', pagination: { pageIndex: 0, pageSize: 7000 }
    },
    enableGrouping: true,
    enableRowSelection: true,
    manualPagination: false,
    enablePagination: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    state: {
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
          Driver App System
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
            select
            SelectProps={{
              native: true,
            }}
            onChange={(e) => {
              setUserId(e.target.value)
            }}
            required
            id="system_owner"
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


          {LoggedInUser?.assigned_permissions.includes('driver_system_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export All</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('driver_system_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export Selected</MenuItem>}

        </Menu >
      </>
      {
        system ?
          <>

            <DeleteDriverSystemDialog dialog={dialog} setDialog={setDialog} item={system} />
            <ViewDriverSystemPhotoDialog dialog={dialog} setDialog={setDialog} item={system} />
          </>
          : null
      }
      <MaterialReactTable table={table} />

    </>

  )

}