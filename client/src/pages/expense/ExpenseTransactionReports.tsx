import { Fade, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import moment from 'moment'
import { UserContext } from '../../contexts/userContext'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { HandleNumbers } from '../../utils/IsDecimal'
import { ExpenseService } from '../../services/ExpenseService'
import { GetExpenseTransactionsDto } from '../../dtos/ExpenseDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'


export default function ExpenseTransactionReports() {
  const [transactions, seTransactions] = useState<GetExpenseTransactionsDto[]>([])
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date(new Date().setDate(1)).setFullYear(2023)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(30)).format("YYYY-MM-DD")
  })
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetExpenseTransactionsDto[]>, BackendError>(["expense_transaction_reports", dates.start_date, dates.end_date], async () => new ExpenseService().GetAllExpenseTransactions({ start_date: dates.start_date, end_date: dates.end_date }))
  const { user: LoggedInUser } = useContext(UserContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetExpenseTransactionsDto>[]>(
    //column definitions...
    () => transactions && [
      {
        accessorKey: 'item.label',
        header: 'Item',
        Cell: (cell) => <>{cell.row.original.item ? cell.row.original.item.label : ""}</>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={transactions.map((item) => { return item.item.label || "" })} />,
      },
      {
        accessorKey: 'remark',
        header: 'Remark',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={transactions.map((item) => { return item.remark || "" })} />,
      },
      {
        accessorKey: 'category.label',
        header: 'Category',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={transactions.map((item) => { return item.category.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.label : ""}</>,
      },
      {
        accessorKey: 'location.label',
        header: 'Location',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={transactions.map((item) => { return item.location.label || "" })} />,
      }
      ,
      {
        accessorKey: 'price',
        header: 'Price',
           
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
      },
      {
        accessorKey: 'inWardQty',
        header: 'Inward Qty',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return a + b.original.inWardQty }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'outWardQty',
        header: 'Outward Qty',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return a + b.original.outWardQty }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'unit.label',
        header: 'Unit',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={transactions.map((item) => { return item.unit.label || "" })} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Created on',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={transactions.map((item) => { return item.created_at || "" })} />,

        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
      },

      {
        accessorKey: 'created_by.label',
        header: 'Creator',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={transactions.map((item) => { return item.created_by.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
      }
    ],
    [transactions],
    //end
  );


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
      seTransactions(data.data);
    }
  }, [isSuccess]);


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: transactions, //10,000 rows       
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
          Expense Transactions
        </Typography>
        <Stack direction="row" gap={2}>
          < TextField
            size="small"
            type="date"
            id="start_date"
            label="Start Date"
            fullWidth
            value={dates.start_date}
            focused
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
            focused
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
        </Stack>
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
            {LoggedInUser?.assigned_permissions.includes('expense-transaction_report_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('expense-transaction_report_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >

        </>


      </Stack >


      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

