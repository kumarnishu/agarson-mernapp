import { Fade, FormControlLabel, IconButton, LinearProgress, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, MRT_ColumnSizingState, useMaterialReactTable } from 'material-react-table'
import { useParams } from 'react-router-dom'
import PopUp from '../../components/popup/PopUp'
import { UserContext } from '../../contexts/userContext'
import { Comment, Refresh, Visibility } from '@mui/icons-material'
import CreateOrEditExcelDBRemarkDialog from '../../components/dialogs/excel-db/CreateOrEditExcelDBRemarkDialog'
import ViewExcelDBRemarksDialog from '../../components/dialogs/excel-db/ViewExcelDBRemarksDialog'
import { HandleNumbers } from '../../utils/IsDecimal'
import { DropDownDto } from '../../dtos/dropdown.dto'
import { IColumnRowData } from '../../dtos/table.dto'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { AuthorizationService } from '../../services/AuthorizationService'
import { ExcelReportsService } from '../../services/ExcelReportsServices'

export default function ExcelDBPage() {
  const [hidden, setHidden] = useState(false)
  const [reports, setReports] = useState<IColumnRowData['rows']>([])
  const [reportcolumns, setReportColumns] = useState<IColumnRowData['columns']>([])
  const [category, setCategory] = useState<DropDownDto>()
  const [obj, setObj] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [dialog, setDialog] = useState<string | undefined>()
  const { id } = useParams()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { data: categorydata, refetch: RefetchCategory, isSuccess: isSuccessCategorydata } = useQuery<AxiosResponse<DropDownDto>, BackendError>(["key_categories"], async () => new AuthorizationService().GetKeyCategoryById(id || ""), { enabled: false })

  const { data, isLoading, isSuccess, refetch, isRefetching } = useQuery<AxiosResponse<IColumnRowData>, BackendError>(["exceldb", hidden], async () => new ExcelReportsService().GetExcelDbReport(id || "", hidden), { enabled: false })
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

  let columns = useMemo<MRT_ColumnDef<IColumnRowData['columns']>[]>(
    () => reportcolumns && reportcolumns.map((item, index) => {
      if (item.type == "action")
        return {
          accessorKey: item.key,
          header: item.header,

          Cell: (cell) => <PopUp key={item.key}
            element={
              <Stack direction="row" spacing={1} >
                {LoggedInUser?.assigned_permissions.includes('grp_excel_view') && <Tooltip title="view remarks">
                  <IconButton color="primary"

                    onClick={() => {

                      setDialog('ViewExcelDBRemarksDialog')
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
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('grp_excel_edit') &&
                  <Tooltip title="Add Remark">
                    <IconButton

                      color="success"
                      onClick={() => {

                        setDialog('CreateOrEditExcelDBRemarkDialog')
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
                      }}
                    >
                      <Comment />
                    </IconButton>
                  </Tooltip>}

              </Stack>}
          />,
          Footer: ""
        }
      else if (item.type == "string") {
        if (item.key == 'last remark' || item.key == 'next call')
          return {
            accessorKey: item.key,
            header: item.header,
            Footer: "", Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip>
          }
        return {
          accessorKey: item.key,
          header: item.header,
          Footer: "",
        }
      }
      else if (item.type == "timestamp")
        return { accessorKey: item.key, header: item.header, Footer: "", }
      else if (item.type == "date")
        return {
          accessorKey: item.key,
          header: item.header,
          Footer: <b>Total</b>,
        }
      else
        return {
          accessorKey: item.key, header: item.header,
          filterVariant: 'range',
          filterFn: 'between',
          aggregationFn: 'sum',
          AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
          Cell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
          //@ts-ignore
          Footer: ({ table }) => <b>{index < 2 ? table.getFilteredRowModel().rows.length : table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original[item.key]) }, 0).toFixed()}</b>
        }
    })
    ,
    [reports, reportcolumns],
    //end
  );

  useEffect(() => {
    if (id != "") {
      refetch()
      RefetchCategory()
    }
  }, [id, hidden])

  useEffect(() => {
    if (isSuccess && data) {
      setReports(data.data.rows);
      setReportColumns(data.data.columns)
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isSuccessCategorydata && categorydata) {
      setCategory(categorydata.data);
    }
  }, [isSuccessCategorydata, categorydata]);


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
        '& div:nth-child(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially hidden
        },
        '& div:nth-child(2)': {
          display: (column.getIsFiltered() || column.getIsGrouped()) ? 'inline-block' : 'none'
        },
        '&:hover div:nth-child(1) span': {
          display: 'inline', // Visible on hover
        },
        '&:hover div:nth-child(2)': {
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
    initialState: {
      density: 'compact', pagination: { pageIndex: 0, pageSize: 7000 }
    },
    enableGrouping: true,
    enableRowSelection: true,
    manualPagination: false,
    enablePagination: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableDensityToggle: false,

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

          {category ? category.label : "Excel DB"}
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
      <MaterialReactTable table={table} />
    </>

  )

}

