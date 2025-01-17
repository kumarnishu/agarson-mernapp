import { Fade, FormControlLabel, IconButton, LinearProgress, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, MRT_ColumnSizingState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Refresh } from '@mui/icons-material'
import { HandleNumbers } from '../../utils/IsDecimal'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { ExcelReportsService } from '../../services/ExcelReportsServices'
import CreateOrEditExcelDBRemarkDialog from '../../components/dialogs/excelreports/CreateOrEditExcelDBRemarkDialog'
import ViewExcelDBRemarksDialog from '../../components/dialogs/excelreports/ViewExcelDBRemarksDialog'
import { IColumnRowData } from '../../dtos/SalesDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import ViewPartyDetailDialog from '../../components/dialogs/sales/ViewPartyDetailDialog'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'

export default function SharedAgeingpage() {
  const [hidden, setHidden] = useState(false)
  const [reports, setReports] = useState<IColumnRowData['rows']>([])
  const [reportcolumns, setReportColumns] = useState<IColumnRowData['columns']>([])
  const [obj, setObj] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [dialog, setDialog] = useState<string | undefined>()
  const id = '673343932fc46475cdf0ad6d';
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { data, isLoading, isSuccess, refetch, isRefetching } = useQuery<AxiosResponse<IColumnRowData>, BackendError>(["exceldb", hidden], async () => new ExcelReportsService().GetExcelDbReport(id, hidden), { enabled: false })
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

  let columns = useMemo<MRT_ColumnDef<any, any>[]>(
    () => reportcolumns && reportcolumns.map((item, index) => {
      if (item.type == "string") {
        if (item.key == 'last remark' || item.key == 'next call')
          return {
            accessorKey: item.key,
            header: item.header,
            /* @ts-ignore */
            filterFn: CustomFilterFunction,
            Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
            Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it[item.key] })} />,
          }
        return {
          accessorKey: item.key,
          header: item.header,
          /* @ts-ignore */
          filterFn: CustomFilterFunction,
          Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span onClick={() => {


            //@ts-ignore
            if (cell.row.original['Account Name'])
              //@ts-ignore
              setObj(cell.row.original['Account Name'])
            //@ts-ignore
            else if (cell.row.original['PARTY'])
              //@ts-ignore
              setObj(cell.row.original['PARTY'])

            //@ts-ignore
            else if (cell.row.original['Customer Name'])
              //@ts-ignore
              setObj(cell.row.original['Customer Name'])
            //@ts-ignore
            else if (cell.row.original['CUSTOMER'])
              //@ts-ignore
              setObj(cell.row.original['CUSTOMER'])
            setDialog('ViewPartyDetailDialog')

          }}>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
          Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it[item.key] })} />,
          Footer: "",
        }
      }
      else if (item.type == "timestamp")
        return {
          accessorKey: item.key, header: item.header,  /* @ts-ignore */
          filterFn: CustomFilterFunction,
          Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
          Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it[item.key] })} />, Footer: ""
        }
      else if (item.type == "date")
        return {
          accessorKey: item.key,
          header: item.header,
          /* @ts-ignore */
          filterFn: CustomFilterFunction,
          Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
          Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={reports.map((it) => { return it[item.key] })} />,
          Footer: <b>Total</b>,
        }
      else
        return {
          accessorKey: item.key, header: item.header,
          aggregationFn: 'sum',
          filterVariant: 'range',
          filterFn: 'betweenInclusive',
          Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>,
          AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
          //@ts-ignore
          Footer: ({ table }) => <b>{index < 2 ? table.getFilteredRowModel().rows.length : table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original[item.key]) }, 0).toFixed()}</b>
        }
    })
    ,
    [reports, reportcolumns],
    //end
  );


  useEffect(() => {
    refetch()
  }, [hidden])

  useEffect(() => {
    if (isSuccess && data) {
      setReports(data.data.rows);
      setReportColumns(data.data.columns)
    }
  }, [isSuccess, data]);

  const table = useMaterialReactTable({
    //@ts-ignore
    columns, columnFilterDisplayMode: 'popover',
    data: reports ? reports : [], //10,000 rows       
    enableColumnResizing: true,
    enableRowVirtualization: true,
    rowVirtualizerInstanceRef, //optional
    // , //optionally customize the row virtualizr
    // columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizr
    enableStickyFooter: true,
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
      rowsPerPageOptions: [10, 100, 200, 500, 1000, 2000, 5000, 7000, 10000],
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
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    state: {
      isLoading: isLoading,
      columnVisibility,
      sorting,
      columnSizing: columnSizing
    }
  });


  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_table_1',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_table_1',
    );


    const sorting = localStorage.getItem('mrt_sorting_table_1');


    if (columnVisibility) {
      setColumnVisibility(JSON.parse(columnVisibility));
    }

    if (columnSizing)
      setColumnSizing(JSON.parse(columnSizing))
    if (sorting) {
      setSorting(JSON.parse(sorting));
    }
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

  console.log(obj)
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

          {`SALES REPRESENTATIVE/CUSTOMER WISE BILLS AGEING REPORT <70,70-90,90-120,>120`}
          <Refresh sx={{ cursor: 'pointer', color: 'green' }} onClick={() => window.location.reload()} />
        </Typography>
        <Stack direction={'row'}>
          <FormControlLabel control={<Switch
            defaultChecked={Boolean(hidden)}
            onChange={() => setHidden(!hidden)}
          />} label="Hidden" />

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

            {LoggedInUser?.assigned_permissions.includes('grp_excel_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('grp_excel_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>
      </Stack >
      {id && obj && <CreateOrEditExcelDBRemarkDialog dialog={dialog} setDialog={setDialog} category={id} obj={obj} />}
      {id && obj && <ViewExcelDBRemarksDialog dialog={dialog} setDialog={setDialog} id={id} obj={obj} />}
      {isRefetching && <LinearProgress />}
      {obj && <ViewPartyDetailDialog dialog={dialog} setDialog={setDialog} party={obj} />}
      <MaterialReactTable table={table} />
    </>

  )

}

