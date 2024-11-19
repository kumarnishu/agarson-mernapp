import { Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { UserContext } from '../../contexts/userContext'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { IColumnRowData } from '../../dtos'
import { SalesmanLeavesButton } from '../../components/buttons/SalesmanLeavesButton'
import { GetSalesManLeavesReports } from '../../services/ExcelDbService'



export default function SalesmanLeavesReportPage() {
  const [reports, setReports] = useState<IColumnRowData['rows']>([])
  const [reportcolumns, setReportColumns] = useState<IColumnRowData['columns']>([])
  const { user } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<IColumnRowData>, BackendError>(["reports"], async () => GetSalesManLeavesReports())

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const columns = useMemo<MRT_ColumnDef<IColumnRowData['columns']>[]>(
    () => reportcolumns && reportcolumns.map((item) => {

      return {
        accessorKey: item.key, header: item.header,grow:false,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        // //@ts-ignore
        // Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original[item.key]) }, 0).toFixed()}</b>
      }
    })
    ,
    [reports, reportcolumns],
    //end
  );


  useEffect(() => {
    if (isSuccess) {
      setReports(data.data.rows);
      setReportColumns(data.data.columns)
    }
  }, [isSuccess]);

  const table = useMaterialReactTable({
    //@ts-ignore
    columns, columnFilterDisplayMode: 'popover',
    data: reports, //10,000 rows       
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
      rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
      shape: 'rounded',
      variant: 'outlined',
    },
    initialState: {
      density: 'compact', pagination: { pageIndex: 0, pageSize: 7000 }
    },
    enableGrouping: true,
    enableRowSelection: true,
    manualPagination: false,
    enablePagination: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    rowVirtualizerInstanceRef, //optional
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
    onSortingChange: setSorting,
    state: { isLoading, sorting }
  });
  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);
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
          Salesman Leaves Reports
        </Typography>

        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <>

            {user?.assigned_permissions.includes("salesman_leaves_report_create") && <SalesmanLeavesButton />}
          </>
        </Stack>


      </Stack >

      <MaterialReactTable table={table} />
    </>

  )

}

