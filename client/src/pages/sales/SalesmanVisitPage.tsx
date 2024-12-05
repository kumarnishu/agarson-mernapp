import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Button, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { GetSalesmanVisit } from '../../services/SalesServices'
import moment from 'moment'
import ViewVisitReportDialog from '../../components/dialogs/sales/VisitReportDialog'
import PopUp from '../../components/popup/PopUp'
import { UserContext } from '../../contexts/userContext'
import { Comment, Visibility } from '@mui/icons-material'
import ViewVisitReportRemarksDialog from '../../components/dialogs/sales/ViewVisitReportRemarksDialog'
import CreateOrEditVisitReportRemarkDialog from '../../components/dialogs/sales/CreateOrEditVisitReportRemarkDialog'
import CreateOrEditSalesmanAttendanceDialog from '../../components/dialogs/sales/CreateOrEditSalesmanAttendanceDialog'
import { HandleNumbers } from '../../utils/IsDecimal'
import { GetSalesManVisitSummaryReportDto } from '../../dtos/visit-report.dto'


export default function SalesmanVisitPage() {
  const [date, setDate] = useState(moment(new Date(new Date())).format("YYYY-MM-DD"))
  const [realdate, setRealDate] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [reports, setReports] = useState<GetSalesManVisitSummaryReportDto[]>([])
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetSalesManVisitSummaryReportDto[]>, BackendError>(["visits", date], async () => GetSalesmanVisit({ date: date }))
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
        header: 'Last Remark',


      },
      {
        accessorKey: 'date1',
        header: 'Date',

      },
      {
        accessorKey: 'new_visits1',
        header: 'New Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'old_visits1',
        header: 'Old Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'working_time1',
        header: 'Time',

      },
      {
        accessorKey: 'date2',
        header: 'Date',

      },
      {
        accessorKey: 'new_visits2',
        header: 'New Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'old_visits2',
        header: 'Old Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'working_time2',
        header: 'Time',

      },
      {
        accessorKey: 'date3',
        header: 'Date',

      },
      {
        accessorKey: 'new_visits3',
        header: 'New Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'old_visits3',
        header: 'Old Visits',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',

      },
      {
        accessorKey: 'working_time3',
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '68vh' }
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
        fontSize: '13px'
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [70, 200, 500, 1300, 2000],
      shape: 'rounded',
      variant: 'outlined',
    },
    initialState: {
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
            variant='filled'
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

