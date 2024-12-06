import { IconButton, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, MRT_ColumnSizingState, useMaterialReactTable } from 'material-react-table'
import { GetExcelDbReport } from '../../services/ExcelDbService'
import { useParams } from 'react-router-dom'
import PopUp from '../../components/popup/PopUp'
import { UserContext } from '../../contexts/userContext'
import { Comment, Refresh, Visibility } from '@mui/icons-material'
import { GetKeyCategoryById } from '../../services/KeyServices'
import CreateOrEditExcelDBRemarkDialog from '../../components/dialogs/excel-db/CreateOrEditExcelDBRemarkDialog'
import ViewExcelDBRemarksDialog from '../../components/dialogs/excel-db/ViewExcelDBRemarksDialog'
import { HandleNumbers } from '../../utils/IsDecimal'
import { DropDownDto } from '../../dtos/dropdown.dto'
import { IColumnRowData } from '../../dtos/table.dto'


export default function ExcelDBPage() {
  const [reports, setReports] = useState<IColumnRowData['rows']>([])
  const [reportcolumns, setReportColumns] = useState<IColumnRowData['columns']>([])
  const [category, setCategory] = useState<DropDownDto>()
  const [obj, setObj] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [dialog, setDialog] = useState<string | undefined>()
  const { id } = useParams()

  const { data: categorydata, refetch: RefetchCategory, isSuccess: isSuccessCategorydata } = useQuery<AxiosResponse<DropDownDto>, BackendError>(["key_categories"], async () => GetKeyCategoryById(id || ""), { enabled: false })

  const { data, isLoading, isSuccess, refetch, isRefetching } = useQuery<AxiosResponse<IColumnRowData>, BackendError>(["exceldb"], async () => GetExcelDbReport(id || ""), { enabled: false })
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
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('grp_excel_view') &&
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
          return { accessorKey: item.key, header: item.header, Footer: "", Cell: (cell) => <Tooltip title={String(cell.cell.getValue()) || ""}><span>{String(cell.cell.getValue()) !== 'undefined' && String(cell.cell.getValue())}</span></Tooltip> }
        return { accessorKey: item.key, header: item.header, Footer: "", }
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
  }, [id])

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
      isLoading: isLoading || isRefetching,
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
        justifyContent="left"
        alignItems={'center'}
      >
        <Typography
          variant={'h6'}
          component={'h1'}
          sx={{ pl: 1 }}
        >

          {category ? category.label : "Excel DB"}
        </Typography>
        <Refresh sx={{ cursor: 'pointer', color: 'green' }} onClick={() => window.location.reload()} />
      </Stack >
      {id && obj && <CreateOrEditExcelDBRemarkDialog dialog={dialog} setDialog={setDialog} category={id} obj={obj} />}
      {id && obj && <ViewExcelDBRemarksDialog dialog={dialog} setDialog={setDialog} id={id} obj={obj} />}

      <MaterialReactTable table={table} />
    </>

  )

}

