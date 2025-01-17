import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Button, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import moment from 'moment'
import ViewVisitReportDialog from '../../components/dialogs/sales/VisitReportDialog'
import PopUp from '../../components/popup/PopUp'
import { UserContext } from '../../contexts/userContext'
import { Comment, Visibility } from '@mui/icons-material'
import ViewVisitReportRemarksDialog from '../../components/dialogs/sales/ViewVisitReportRemarksDialog'
import CreateOrEditVisitReportRemarkDialog from '../../components/dialogs/sales/CreateOrEditVisitReportRemarkDialog'
import CreateOrEditSalesmanAttendanceDialog from '../../components/dialogs/sales/CreateOrEditSalesmanAttendanceDialog'
import { HandleNumbers } from '../../utils/IsDecimal'
import { SalesService } from '../../services/SalesServices'
import { GetSalesManVisitSummaryReportDto } from '../../dtos/SalesDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function SalesmanVisitPage() {
  const [date, setDate] = useState(moment(new Date(new Date())).format("YYYY-MM-DD"))
  const [realdate, setRealDate] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [reports, setReports] = useState<GetSalesManVisitSummaryReportDto[]>([])
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetSalesManVisitSummaryReportDto[]>, BackendError>(["visits", date], async () => new SalesService().GetSalesmanVisit({ date: date }))
  const [employee, setEmployee] = useState<string>()
  const [dialog, setDialog] = useState<string | undefined>()
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

  useEffect(() => {
    if (isSuccess) {
      setReports(data.data)
    }
  }, [isSuccess, data])


  useEffect(() => {
    setRealDate(moment(date).toDate().toString())
  }, [date])

  const columns = useMemo<MRT_ColumnDef<GetSalesManVisitSummaryReportDto>[]>(
    //column definitions...
    () => reports && [
      {
        accessorKey: 'action',
        header: 'Action',

        Cell: (cell) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('salesman_visit_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {
                    setDialog('ViewVisitReportRemarksDialog')
                    setEmployee(cell.row.original.employee.id)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('salesman_visit_view') &&
                <Tooltip title="Add Remark">
                  <IconButton
                    color="success"
                    onClick={() => {
                      setDialog('ViewVisitReportDialog')
                      setEmployee(cell.row.original.employee.id)
                    }}
                  >
                    <Comment />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },
      {
        accessorKey: 'employee.label',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.employee.label || "" })} />,
        header: 'Employee',

        Cell: (cell) => <Typography onClick={() => {
          setDialog('ViewVisitReportDialog')
          setEmployee(cell.row.original.employee.id)
        }
        } sx={{ cursor: 'pointer', '&:hover': { fontWeight: 'bold' } }}> {cell.row.original.employee && cell.row.original.employee.label}</Typography >
        ,

      },
      {
        accessorKey: 'last_remark',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.last_remark || "" })} />,
        header: 'Last Remark',


      },
      {
        accessorKey: 'date1',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.date1 || "" })} />,
        header: 'Date',

      },
      {
        accessorKey: 'new_visits1',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: 'New Visits',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'old_visits1',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: 'Old Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'working_time1',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.working_time1 || "" })} />,
        header: 'Time',

      },
      {
        accessorKey: 'date2',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.date2 || "" })} />,
        header: 'Date',

      },
      {
        accessorKey: 'new_visits2',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: 'New Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'old_visits2',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: 'Old Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'working_time2',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.working_time2 || "" })} />,
        header: 'Time',

      },
      {
        accessorKey: 'date3',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.date3 || "" })} />,
        header: 'Date',

      },
      {
        accessorKey: 'new_visits3',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: 'New Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'old_visits3',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        header: 'Old Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'working_time3',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it.working_time3 || "" })} />,
        header: 'Time',

      },



    ],
    [reports, data],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: reports, //10,000 rows       
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
        fontSize: '13px'
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [70, 200, 500, 1300, 2000],
      shape: 'rounded',
      variant: 'outlined',
    },
    enableDensityToggle: false, initialState: {
      density: 'compact', showGlobalFilter: true, pagination: { pageIndex: 0, pageSize: 2000 }
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
      'mrt_columnVisibility_SalesmanVisitPage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_SalesmanVisitPage',
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
      'mrt_columnVisibility_SalesmanVisitPage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_SalesmanVisitPage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_SalesmanVisitPage', JSON.stringify(columnSizing));
  }, [columnSizing]);

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
          Salesman Last 3 days VisitSummary
        </Typography>
        < Stack direction="row" spacing={2}>
          < TextField
            type="date"
            id="end_date"
            size="small"
            label="Date"
            value={date}
            fullWidth
            onChange={(e) => {
              setDate(moment(e.target.value).format("YYYY-MM-DD"))
            }}
          />

          {LoggedInUser?.assigned_permissions.includes('salesman_attendance_create') &&
            <Button fullWidth variant='contained' onClick={() => {
              setDialog('CreateOrEditSalesmanAttendanceDialog')
            }}>Add Attendance</Button>
          }

        </Stack >

      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
      {employee && realdate && <ViewVisitReportRemarksDialog dialog={dialog} setDialog={setDialog} employee={employee} visit_date={realdate} />}
      {employee && realdate && <CreateOrEditVisitReportRemarkDialog dialog={dialog} setDialog={setDialog} employee={employee} visit_date={realdate} />}
      {employee && <ViewVisitReportDialog dialog={dialog} setDialog={setDialog} employee={employee} setEmployee={setEmployee} />}
      <CreateOrEditSalesmanAttendanceDialog dialog={dialog} setDialog={setDialog} />
    </>

  )

}

