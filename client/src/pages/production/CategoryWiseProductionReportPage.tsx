import {  Box, Button, LinearProgress, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import moment from 'moment'
import ExportToExcel from '../../utils/ExportToExcel'
import { UserContext } from '../../contexts/userContext'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ProductionService } from '../../services/ProductionService'
import { GetCategoryWiseProductionReportDto } from '../../dtos/response/ProductionDto'




export default function CategoryWiseProductionReportPage() {
  const [reports, setReports] = useState<GetCategoryWiseProductionReportDto[]>([])
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date().setDate(1)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(31)).format("YYYY-MM-DD")
  })
  const { user } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetCategoryWiseProductionReportDto[]>, BackendError>(["categorywisereports", dates.start_date, dates.end_date], async () =>new ProductionService(). GetproductioncategoryWise({ start_date: dates.start_date, end_date: dates.end_date }))
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

   const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetCategoryWiseProductionReportDto>[]>(
    //column definitions...
    () => reports &&[
      {
        accessorKey: 'date',
        header: 'Date',
        
        Footer: <b>Total</b>,
        filterVariant: 'multi-select',
        filterSelectOptions: reports && reports.map((i) => { return i.date.toString() }).filter(onlyUnique)
      },
      {
        accessorKey: 'total',
        header: 'Total',
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.total) }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'verticalpluslympha',
        header: 'Vertical+Lympha',
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.verticalpluslympha) }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'pu',
        header: 'PU',
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.pu) }, 0).toFixed()}</b>
      },
      {
        accessorKey: 'gumboot',
        header: 'GBoot',
        aggregationFn: 'sum',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue())==0?"":Number(cell.getValue())}</div>,
        Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.gumboot) }, 0).toFixed()}</b>
      }
    ],
    [reports],
    //end
  );


  useEffect(() => {
    if (isSuccess && data) {
      setReports(data.data);
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
	muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-of-type(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted()|| column.getIsGrouped())?'inline':'none', // Initially hidden
        },
        '& div:nth-of-type(2)': {
          display: (column.getIsFiltered() || column.getIsGrouped())?'inline-block':'none'
        },
        '&:hover div:nth-of-type(1) span': {
          display: 'inline', // Visible on hover
        },
        '&:hover div:nth-of-type(2)': {
          display: 'block', // Visible on hover
        }
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}
      >
        {user?.assigned_permissions.includes("shoe_weight_report_export") && <Button
          //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
          onClick={() => {
            ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "shoe_weight_difference")
          }}
          startIcon={<FileDownloadIcon />}
        >
          Export All Data
        </Button>}


        {user?.assigned_permissions.includes("shoe_weight_report_export") && <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "shoe_weight_difference")}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>}
      </Box>
    ),
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
    enableRowNumbers: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    rowVirtualizerInstanceRef, //optional
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

      {
        isLoading && <LinearProgress />
      }


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
          Category Wise
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
      </Stack >
    
        {/* table */}
        {!isLoading && data && <MaterialReactTable table={table} />}
      
    </>

  )

}

