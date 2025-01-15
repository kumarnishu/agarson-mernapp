import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Button, Fade, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon, Photo } from '@mui/icons-material';
import { AttendanceService } from '../../services/AttendanceService'
import { toTitleCase } from '../../utils/TitleCase'
import ApproveOrRejectLeaveDialog from '../../components/dialogs/attendance/ApproveOrRejectLeaveDialog'
import ViewLeaveDocumentDialog from '../../components/dialogs/attendance/ViewLeaveDocumentDialog'
import { GetLeaveDto } from '../../dtos/AttendanceDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function LeavesPage() {
  const [balance, setBalance] = useState<GetLeaveDto>()
  const [balances, setBalances] = useState<GetLeaveDto[]>([])
  const [status, setStatus] = useState('all')
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetLeaveDto[]>, BackendError>(["leaves", status], async () => new AttendanceService().GetLeaves(String(status)))
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);
  const [url, setUrl] = useState<string>("")
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetLeaveDto>[]>(
    //column definitions...
    () => balances && [
      {
        accessorKey: 'actions',   enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
        header:'Actions',
        Cell: ({ cell }) => <>
          {LoggedInUser?.role == "admin" &&
            <Button color="error"
              disabled={cell.row.original.status === 'rejected'}
              onClick={() => {
                setBalance(cell.row.original)
                setDialog('ApproveOrRejectLeaveDialog')
              }}
            >
              Approve or Reject
            </Button>
          }</>
      },

      {
        accessorKey: 'status',
        header: 'status',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.status || "" })} />,
        Cell: (cell) => <>{cell.row.original.status ? cell.row.original.status : ""}</>,
      },
      {
        accessorKey: 'leave_type',
        header: 'leave_type',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={balances.map((item) => { return item.leave_type || "" })} />,
        Cell: (cell) => <>{cell.row.original.leave_type ? cell.row.original.leave_type : ""}</>,
      },
      {
        accessorKey: 'leave',
        header: 'leave',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.leave ? cell.row.original.leave : ""}</>,
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
        accessorKey: 'photo',
        header: 'Photo',
          enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
        Cell: (cell) => <>
          {!cell.row.original.photo || cell.row.original.photo == "" ? <></> : <Photo onClick={() => { setUrl(cell.row.original.photo); setDialog('ViewLeaveDocumentDialog') }} />}
        </>,
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '70vh' }
    }),
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-of-type(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially status
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
          Applied Leaves
        </Typography>


        < TextField
          select
          SelectProps={{
            native: true
          }}
          id="state"
          size="small"
          label="Select Status"
          sx={{ width: '200px' }}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
          }
          }
        >
          <option key={0} value={'all'}>
            All
          </option>
          {
            ['pending', 'rejected', 'approved'].map(cat => {
              return (<option key={cat} value={cat}>
                {cat && toTitleCase(cat)}
              </option>)
            })
          }
        </TextField>
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
          {LoggedInUser?.assigned_permissions.includes("leave_create") && <MenuItem
            onClick={() => {
              setBalance(undefined)
              setAnchorEl(null)
              setDialog('CreateOrEditLeaveBalanceDialog')
            }}

          > Add New</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('leave_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export All</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('leave_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export Selected</MenuItem>}

        </Menu >
      </Stack>
      {/* table */}
      < MaterialReactTable table={table} />
      {url !== "" && <ViewLeaveDocumentDialog url={url} dialog={dialog} setDialog={setDialog} />}
      {balance && <ApproveOrRejectLeaveDialog leavedata={balance} dialog={dialog} setDialog={setDialog} />}
    </>

  )

}

