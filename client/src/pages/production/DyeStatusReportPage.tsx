import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import moment from 'moment'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { UserContext } from '../../contexts/userContext'
import { ProductionService } from '../../services/ProductionService'
import { GetDyeStatusReportDto } from '../../dtos/DropDownDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'



export default function DyeStatusReportPage() {
  const [reports, setReports] = useState<GetDyeStatusReportDto[]>([])
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date()).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
  })
  const { user } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetDyeStatusReportDto[]>, BackendError>(["reports", dates.start_date, dates.end_date], async () => new ProductionService().GetDyeStatusReport({ start_date: dates.start_date, end_date: dates.end_date }))

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  
  const columns = useMemo<MRT_ColumnDef<GetDyeStatusReportDto>[]>(
    //column definitions...
    () => reports && [
      {
        accessorKey: 'created_at',
        header: 'Date',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((item) => { return item.created_at || "" })} />,

      },
      {
        accessorKey: 'dye',
        header: 'Dye',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'count',
      },
      {
        accessorKey: 'article',

        header: 'Article',
        aggregationFn: 'count',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((item) => { return item.article || "" })} />,
      },
      {
        accessorKey: 'size',

        header: 'Size',
        aggregationFn: 'count',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((item) => { return item.size || "" })} />,
      },
      {
        accessorKey: 'std_weight',
        header: 'St Weight',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'count',
      },
      {
        accessorKey: 'location',

        header: 'Location',
        aggregationFn: 'count',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((item) => { return item.location || "" })} />,
      },
      {
        accessorKey: 'repair_required',
        header: 'Repair Required',
        aggregationFn: 'count',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'remarks',

        header: 'Remarks',
        aggregationFn: 'count',
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((item) => { return item.remarks || "" })} />,
      },
      {
        accessorKey: 'created_by',
        header: 'Creator',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((item) => { return item.created_by.label || "" })} />,
        AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
        Cell: (cell) => <>{cell.row.original.created_by.label.toString() || ""}</>,
      },


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
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}
      >
        {user?.assigned_permissions.includes("dye_status_report_export") && <Button
          //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
          onClick={() => {
            ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "shoe_weight_difference")
          }}
          startIcon={<FileDownloadIcon />}
        >
          Export All Data
        </Button>}


        {user?.assigned_permissions.includes("dye_status_report_export") && <Button
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
     //optional
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

  

  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_DyeStatusReportPage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_DyeStatusReportPage',
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
      'mrt_columnVisibility_DyeStatusReportPage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_DyeStatusReportPage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_DyeStatusReportPage', JSON.stringify(columnSizing));
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
          Dye Status Report
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

      <MaterialReactTable table={table} />
    </>

  )

}

