import { TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { UserContext } from '../../contexts/userContext'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { DropDownDto, IColumnRowData } from '../../dtos'
import { GetExcelDbReport } from '../../services/ExcelDbService'
import { ExcelDbButtons } from '../../components/buttons/ExcelDbButtons'
import { GetAllKeyCategoriesForDropdown } from '../../services/KeyServices'
import moment from 'moment'


export default function ExcelDBPage() {
  const [reports, setReports] = useState<IColumnRowData['rows']>([])
  const [categories, setKeyCategorys] = useState<DropDownDto[]>([])
  const [category, setKeyCategory] = useState<string>("")
  const [reportcolumns, setReportColumns] = useState<IColumnRowData['columns']>([])
  const { user } = useContext(UserContext)
  const { data, isLoading, isSuccess, refetch } = useQuery<AxiosResponse<IColumnRowData>, BackendError>(["exceldb", category], async () => GetExcelDbReport(category), { enabled: false })
  const { data: categoryData, isSuccess: isSuccessCategories } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_categories"], async () => GetAllKeyCategoriesForDropdown({ show_assigned_only: true }))

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const columns = useMemo<MRT_ColumnDef<IColumnRowData['columns']>[]>(
    () => reportcolumns && reportcolumns.map((item) => {

      if (item.type == "string")
        return { accessorKey: item.key, header: item.header, Footer: "", grow: true }
      else if (item.type == "timestamp")
        return { accessorKey: item.key, header: item.header, Footer: "", grow: true }
      else if (item.type == "date")
        return {
          accessorKey: item.key,
          header: item.header,
          grow: true,
          Footer: <b>Total</b>,
          filterSelectOptions: reports
            ? [...new Set(reports.map(i => moment(i['date']).format("DD/MM/YYYY")))]
            : [], // Unique formatted dates
          //@ts-ignore
          Cell: (cell) => moment(cell.cell.getValue()).isValid()
            //@ts-ignore
            ? moment(cell.cell.getValue()).format("DD/MM/YYYY")
            : "", // Format cell as date if valid
        }
      else
        return {
          accessorKey: item.key, header: item.header,
          aggregationFn: 'sum', grow: true,
          Cell: (cell) => parseFloat(Number(cell.cell.getValue()).toFixed(2)),
          AggregatedCell: ({ cell }) => <div> {Number(cell.getValue()) == 0 ? "" : Number(cell.getValue())}</div>,
          //@ts-ignore
          Footer: ({ table }) => <b>{table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original[item.key]) }, 0).toFixed()}</b>
        }
    })
    ,
    [reports, reportcolumns],
    //end
  );


  useEffect(() => {
    if (category !== "")
      refetch()
  }, [category])


  useEffect(() => {
    if (isSuccessCategories && categoryData) {
      setKeyCategorys(categoryData.data);
    }
  }, [categoryData, isSuccessCategories]);

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
          Excel DB
        </Typography>

        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <>
            < TextField
              select
              sx={{ minWidth: 200 }}
              value={category}
              size="small"
              SelectProps={{
                native: true,
              }}
              onChange={(e) => {
                setKeyCategory(e.target.value)
              }}
              required
              id="sheets"
              label="Select Sheet"
              fullWidth
            >
              <option key={'00'} value={undefined}>

              </option>
              {
                categories.map((cat, index) => {

                  return (<option key={index} value={cat.id}>
                    {cat.value}
                  </option>)
                })
              }
            </TextField>

            {user?.assigned_permissions.includes("excel_db_create") && <ExcelDbButtons />}
          </>
        </Stack>


      </Stack >

      <MaterialReactTable table={table} />
    </>

  )

}

