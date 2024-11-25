import { Stack } from '@mui/system'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { TextField, Typography } from '@mui/material'
import { GetSalesManVisitSummaryReportDto } from '../../dtos'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { GetSalesmanVisit } from '../../services/SalesServices'
import moment from 'moment'


export default function SalesmanVisitPage() {
  const [date, setDate] = useState(moment(new Date(new Date())).format("YYYY-MM-DD"))
  const [reports, setReports] = useState<GetSalesManVisitSummaryReportDto[]>([])
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetSalesManVisitSummaryReportDto[]>, BackendError>(["visits", date], async () => GetSalesmanVisit({ date: date }))
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  useEffect(() => {
    if (isSuccess) {
      setReports(data.data)
    }
  }, [isSuccess, data])


  const columns = useMemo<MRT_ColumnDef<GetSalesManVisitSummaryReportDto>[]>(
    //column definitions...
    () => reports && [

      {
        accessorKey: 'employee',
        header: 'Employee',
        size: 160,
        grow: false
      },
      {
        accessorKey: 'date1',
        header: 'Date',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'new_visits1',
        header: 'New Visits',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'old_visits1',
        header: 'Old Visits',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'working_time1',
        header: 'Time',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'date2',
        header: 'Date',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'new_visits2',
        header: 'New Visits',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'old_visits2',
        header: 'Old Visits',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'working_time2',
        header: 'Time',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'date3',
        header: 'Date',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'new_visits3',
        header: 'New Visits',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'old_visits3',
        header: 'Old Visits',
        size: 130,
        grow: false
      },
      {
        accessorKey: 'working_time3',
        header: 'Time',
        size: 130,
        grow: false
      }


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
    onSortingChange: setSorting,
    state: { isLoading, sorting }
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
          Salesman Visit New/old/Time
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

        </Stack >
      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

