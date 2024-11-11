import { TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { GetSaleAnalysisReports } from '../../services/ErpServices'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { toTitleCase } from '../../utils/TitleCase'
import { months } from '../../utils/months'
import { GetSaleAnalysisReportDto } from '../../dtos'



export default function SaleAnalysisReport() {
  const [reports, setReports] = useState<GetSaleAnalysisReportDto[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetSaleAnalysisReportDto[]>, BackendError>(["sale_analysis_reports", month], async () => GetSaleAnalysisReports(month))
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const columns = useMemo<MRT_ColumnDef<GetSaleAnalysisReportDto>[]>(
    //column definitions...
    () => [
      {
        accessorKey: 'state',
        header: 'State',
        size: 150,
        width: '50',
        Footer: <h1>Total</h1>,
        filterVariant: 'multi-select',
        aggregationFn: 'count',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        filterSelectOptions: reports.map((i) => { return i.state }).filter(onlyUnique)
      },
      {
        accessorKey: 'monthly_target',
        header: 'MONTHLY TARGET',
        size: 120,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.monthly_target) }, 0).toFixed(2)}</b>
      },
      {
        accessorKey: 'monthly_achivement',
        header: 'MONTHLY ACHIVEMENT',
        size: 120,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.monthly_achivement) }, 0).toFixed(2)}</b>
      },
      {
        accessorKey: 'monthly_percentage',
        header: 'MONTHLY PERCENTAGE',
        size: 120,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.monthly_percentage) }, 0).toFixed(2)}</b>
      },
      {
        accessorKey: 'annual_target',
        header: 'ANNUAL TARGET',
        size: 120,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.annual_target) }, 0).toFixed(2)}</b>
      },
      {
        accessorKey: 'annual_achivement',
        header: 'ANNUAL ACHIVEMENT',
        size: 120,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.annual_achivement) }, 0).toFixed(2)}</b>
      },
      {
        accessorKey: 'annual_percentage',
        header: 'ANNUAL PERCENTAGE',
        size: 120,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.annual_percentage) }, 0).toFixed(2)}</b>
      },
      {
        accessorKey: 'last_year_sale',
        header: 'LAST YEAR SALE',
        size: 120,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.last_year_sale) }, 0).toFixed(2)}</b>
      },
      {
        accessorKey: 'last_year_sale_percentage_comparison',
        header: 'LAST YEAR PERCENTAGE COMPARISON',
        size: 420,
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.last_year_sale_percentage_comparison) }, 0).toFixed(2)}</b>
      }
    ],
    [reports,],
    //end
  );


  useEffect(() => {
    if (typeof window !== 'undefined' && isSuccess) {
      setReports(data.data);
    }
  }, [isSuccess]);

  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);

  const table = useMaterialReactTable({
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '64vh' }
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
    enableRowNumbers: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    rowVirtualizerInstanceRef, //optional
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
    onSortingChange: setSorting,
    state: { isLoading, sorting }
  });



  return (
    <>
      <Stack
        spacing={4}
        padding={2}
        direction="row"
        justifyContent="space-between"
        alignItems={'center'}
      >
        <Typography
          variant={'h6'}
          component={'h1'}
          sx={{ pl: 1 }}
        >
          Sale Analysis {new Date().getMonth() < 3 ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}` : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`}
        </Typography>
        < TextField
          select
          SelectProps={{
            native: true
          }}
          focused
          sx={{ width: 150 }}
          size='small'
          id="month"
          label="Month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          <option key={0} value={undefined}>
            Select Month
          </option>
          {
            months.map(month => {
              return (<option key={month.month} value={month.month}>
                {toTitleCase(month.label)}
              </option>)
            })
          }
        </TextField>

      </Stack >

      <MaterialReactTable table={table} />
    </>

  )

}

