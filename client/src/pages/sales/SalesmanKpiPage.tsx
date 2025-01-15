import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, Menu, MenuItem, Stack, TextField,  Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { FilterAltOff } from '@mui/icons-material'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'

import { previousYear } from '../../utils/datesHelper'
import { HandleNumbers } from '../../utils/IsDecimal'
import { SalesService } from '../../services/SalesServices'
import { UserService } from '../../services/UserServices'
import { DropDownDto } from '../../dtos/DropDownDto'
import { GetSalesmanKpiDto } from '../../dtos/SalesDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


function SalesmanKpiPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [kpis, setKpis] = useState<GetSalesmanKpiDto[]>([])
  const [userId, setUserId] = useState<string>('all')
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date(new Date().setDate(1)).setMonth(new Date().getMonth())).format("YYYY-MM-DD"),
    end_date: moment(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() + 1)).format("YYYY-MM-DD")
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
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'sales_menu', show_assigned_only: false }))
  const { data, isLoading } = useQuery<AxiosResponse<GetSalesmanKpiDto[]>, BackendError>(["salesmankpis", userId, dates?.start_date, dates?.end_date], async () => new SalesService().GetSalesmanKpis({ id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetSalesmanKpiDto>[]>(
    //column definitions...
    () => kpis && [
      {
        accessorKey: 'date',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={kpis.map((item) => { return item.date || "" })} />,
        header: ' Date',
      },
      {
        accessorKey: 'month',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={kpis.map((item) => { return item.month || "" })} />,
        header: ' Month',
      },
      {
        accessorKey: 'attendance',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={kpis.map((item) => { return item.attendance || "" })} />,
        header: ' Attendance'
      },
      {
        accessorKey: 'employee.label',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={kpis.map((item) => { return item.employee?.label || "" })} />,
        header: ' Employee',
      },
      {
        accessorKey: 'old_visit',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: ' Old Visit',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'new_visit',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: ' New Visit',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'new_clients',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: ' New Clients',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'station.label',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={kpis.map((item) => { return item.station?.label || "" })} />,
        header: ' Station',
        aggregationFn: 'count',

      },
      {
        accessorKey: 'state',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={kpis.map((item) => { return item.state || "" })} />,
        header: ' State',
        aggregationFn: 'count',

      },
      {
        accessorKey: 'working_time',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={kpis.map((item) => { return item.working_time || "" })} />,
        header: ' Work Time',
        aggregationFn: 'count',
      },
      {
        accessorKey: 'currentsale_currentyear',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: moment(new Date()).format("MMM-YY") + " Sale",
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'lastsale_currentyear',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: moment(new Date().setMonth(new Date().getMonth() - 1)).format("MMM-YY") + "Sale",
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'current_collection',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: moment(new Date()).format("MMM-YY") + " Collection",
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'currentsale_last_year',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: moment(new Date(new Date(previousYear).setMonth(new Date().getMonth()))).format("MMM-YY") + " Sale",
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'lastsale_lastyear',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: moment(new Date(new Date(previousYear).setMonth(new Date().getMonth() - 1))).format("MMM-YY") + "Sale",
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },

      {
        accessorKey: 'ageing_above_90days',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: ' Ageing>90',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'sale_growth',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: 'Sale Growth',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'last_month_sale_growth',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: ' Last Month Sale Growth',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },

    ],
    [kpis, data],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: kpis, //10,000 rows       
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

  useEffect(() => {
    if (isUsersSuccess)
      setUsers(usersData?.data)
  }, [users, isUsersSuccess, usersData])

  useEffect(() => {
    if (data) {
      setKpis(data.data)
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
          <Typography variant='h6'>Salesman Kpi Report</Typography>
          <Stack
            pt={1}
            direction="row"
            alignItems={'center'}
            justifyContent="right">

            <Stack justifyContent={'right'} direction={'row'} gap={1}>
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
                  id="kpi_owners"
                  label="Person"
                  fullWidth
                >
                  <option key={'00'} value={'all'}>All
                  </option>
                  {
                    users.map((user, index) => {

                      return (<option key={index} value={user.id}>
                        {toTitleCase(user.label)}
                      </option>)

                    })
                  }
                </TextField>}


              <Button size="small" color="inherit" variant='contained'
                onClick={() => {
                  table.resetColumnFilters(true)
                }
                }
              >
                <FilterAltOff />
              </Button>
              <Button size="small" color="inherit" variant='contained'
                onClick={(e) => setAnchorEl(e.currentTarget)
                }
              >
                <MenuIcon />
              </Button>
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




        {LoggedInUser?.assigned_permissions.includes('salesman_kpi_export') && < MenuItem onClick={() => {

          let data = table.getRowModel().rows;
          ExportToExcel(data, "Salesman Kpi Data")
        }
        }
        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('salesman_kpi_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data = table.getSelectedRowModel().rows
          ExportToExcel(data, "Salesman Kpi Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>
      <MaterialReactTable table={table} />
    </>
  )
}

export default SalesmanKpiPage