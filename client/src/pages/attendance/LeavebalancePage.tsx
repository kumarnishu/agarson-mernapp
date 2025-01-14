import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import DeleteLeavebalanceDialog from '../../components/dialogs/attendance/DeleteLeavebalanceDialog'
import CreateOrEditLeaveBalanceDialog from '../../components/dialogs/attendance/CreateOrEditLeaveBalanceDialog'
import { AttendanceService } from '../../services/AttendanceService'
import { GetLeaveBalanceDto } from '../../dtos/AttendanceDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function LeaveBalancePage() {
  const [balance, setBalance] = useState<GetLeaveBalanceDto>()
  const [balances, setBalances] = useState<GetLeaveBalanceDto[]>([])
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetLeaveBalanceDto[]>, BackendError>(["balances"], async () => new AttendanceService().GetLeaveBalances())
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetLeaveBalanceDto>[]>(
    //column definitions...
    () => balances && [
      {
        accessorKey: 'actions', enableColumnFilter: false,
        header: '',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.assigned_permissions.includes('leave_balance_edit') && <Tooltip title="delete">
                  <IconButton color="error"

                    onClick={() => {
                      setBalance(cell.row.original)
                      setDialog('DeleteLeavebalanceDialog')
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('leave_balance_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setBalance(cell.row.original)
                      setDialog('CreateOrEditLeaveBalanceDialog')
                    }}

                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

              </>

            </Stack>}
        />
      },

      {
        accessorKey: 'sl',
        header: 'sl',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.sl || "" })} />,
        Cell: (cell) => <>{cell.row.original.sl ? cell.row.original.sl : ""}</>,
      },
      {
        accessorKey: 'fl',
        header: 'fl',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.fl || "" })} />,
        Cell: (cell) => <>{cell.row.original.fl ? cell.row.original.fl : ""}</>,
      },
      {
        accessorKey: 'cl',
        header: 'cl',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.cl || "" })} />,
        Cell: (cell) => <>{cell.row.original.cl ? cell.row.original.cl : ""}</>,
      },
      {
        accessorKey: 'sw',
        header: 'sw',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.sw || "" })} />,
        Cell: (cell) => <>{cell.row.original.sw ? cell.row.original.sw : ""}</>,
      },
      {
        accessorKey: 'yearmonth',
        header: 'year Month',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.yearmonth || "" })} />,
        Cell: (cell) => <>{cell.row.original.yearmonth ? cell.row.original.yearmonth : ""}</>,
      },
      {
        accessorKey: 'employee.label',
        header: 'Employee',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.employee.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.employee ? cell.row.original.employee.label : ""}</>,
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.created_at || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_at || ""}</>,
      },
      {
        accessorKey: 'updated_by',
        header: 'Last updated by',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.updated_by.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.updated_by ? cell.row.original.updated_by.label : ""}</>,
      },

    ],
    [balances],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: balances, //10,000 rows       
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
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white'
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
    if (isSuccess) {
      setBalances(data.data);
    }
  }, [data, isSuccess]);

  console.log(balance, dialog)
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
          Leave Balance
        </Typography>
        <Stack
          spacing={2}
          padding={1}
          direction="row"
          justifyContent="space-between"
          alignItems={'end'}
        >


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
            {LoggedInUser?.assigned_permissions.includes("leave_balance_create") && <MenuItem
              onClick={() => {
                setBalance(undefined)
                setAnchorEl(null)
                setDialog('CreateOrEditLeaveBalanceDialog')
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('leave_balance_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('leave_balance_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>

        <CreateOrEditLeaveBalanceDialog dialog={dialog} setDialog={setDialog} balance={balance} />

        {balance && <DeleteLeavebalanceDialog dialog={dialog} setDialog={setDialog} balance={balance} />}

      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

