import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import ExportToExcel from '../../utils/ExportToExcel'
import { SalesService } from '../../services/SalesServices'
import { GetSalesDto } from '../../dtos/sales.dto'
import { Menu as MenuIcon } from '@mui/icons-material';
import { SalesExcelButtons } from '../../components/buttons/SalesExcelButtons'

function SalesReportPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [sales, setSales] = useState<GetSalesDto[]>([])
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date().setDate(new Date().getDate() - 10)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(new Date().getDate())).format("YYYY-MM-DD")
  })

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  let previous_date = new Date()
  let day = previous_date.getDate() - 4
  previous_date.setDate(day)
  previous_date.setHours(0, 0, 0, 0)
  const { data, isLoading } = useQuery<AxiosResponse<GetSalesDto[]>, BackendError>(["sales", dates?.start_date, dates?.end_date], async () => new SalesService().GetSalesReports({ start_date: dates?.start_date, end_date: dates?.end_date }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetSalesDto>[]>(
    //column definitions...
    () => sales && [


      {
        accessorKey: 'date',
        header: ' Date',
        Cell: (cell) => <span >{cell.row.original.date}</span>

      },
      {
        accessorKey: 'month',
        header: ' Month',
        aggregationFn: 'count',

      },
      {
        accessorKey: 'invoice_no',
        header: ' Invoice',
        aggregationFn: 'count',

      },
      {
        accessorKey: 'party',
        header: ' Party',
        aggregationFn: 'count',

      },
      {
        accessorKey: 'state',
        header: ' State',
        aggregationFn: 'sum'

      },
      {
        accessorKey: 'amount',
        header: ' Amount',
        aggregationFn: 'sum',
        Cell: (cell) => <span >{cell.row.original.amount || ""}</span>
      }
    ],
    [sales, data],
  );

  const table = useMaterialReactTable({
    //@ts-ignore
    columns, columnFilterDisplayMode: 'popover',
    data: sales, //10,000 rows       
    enableColumnResizing: true,
    enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '62vh' }
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
      rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
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
    enableRowVirtualization: true,
    //optionally customize the column virtualizer
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });


  useEffect(() => {
    if (data) {
      setSales(data.data)
    }
  }, [data])
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

      <Box minWidth={'100vw'} >
        <Stack sx={{ p: 1 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant='h6'>Sales</Typography>
          <Stack
            pt={1}
            direction="row"
            alignItems={'center'}
            justifyContent="right">

            <Stack justifyContent={'right'} direction={'row'} gap={1}>
              < TextField
                variant='filled'
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
                variant='filled'
                type="date"
                id="end_date"
                size="small"
                label="End Date"
                value={dates.end_date}

                fullWidth
                onChange={(e) => {
                  setDates({
                    ...dates,
                    end_date: moment(e.target.value).format("YYYY-MM-DD")
                  })
                }}
              />

              <SalesExcelButtons />


              <Tooltip title="Menu" sx={{ pl: 1 }}>
                <Button size="small" color="inherit" variant='contained'
                  onClick={(e) => setAnchorEl(e.currentTarget)
                  }
                >
                  <MenuIcon />
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Box >
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

        {LoggedInUser?.assigned_permissions.includes('sales_export') && < MenuItem onClick={() => {

          let data = table.getRowModel().rows;
          ExportToExcel(data, "Attendances Data")
        }
        }
        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('sales_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data = table.getSelectedRowModel().rows
          ExportToExcel(data, "Attendances Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>
      <MaterialReactTable table={table} />
    </>
  )
}

export default SalesReportPage