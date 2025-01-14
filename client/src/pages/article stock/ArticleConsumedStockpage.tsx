import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Button, Fade, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { StockSchmeService } from '../../services/StockSchmeService'
import DiscardConsumptionDialog from '../../components/dialogs/stockschme/DiscardConsumptionDialog'
import { HandleNumbers } from '../../utils/IsDecimal'
import { GetConsumedStockDto } from '../../dtos/response/StockSchemeDto'


export default function ArticleConsumedStockpage() {
  const [consumes, setConsumes] = useState<GetConsumedStockDto[]>([])
  const [rejected, setRejected] = useState(false)
  const [consume, setConsume] = useState<GetConsumedStockDto>()
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetConsumedStockDto[]>, BackendError>(["consumed", rejected], async () => new StockSchmeService().GetAllConsumedStocks({ rejected: rejected }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const [dialog, setDialog] = useState<string | undefined>()
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetConsumedStockDto>[]>(
    //column definitions...
    () => consumes && [
      {
        accessorKey: 'actions',
        header: 'Actions',
        enableColumnFilter: false,
        Cell: ({ cell }) => <>
          {LoggedInUser?.is_admin && <Button color="error"
            onClick={() => {
              setConsume(cell.row.original)
              setDialog('DiscardConsumptionDialog')
            }}
          >
            Discard
          </Button>}
        </>
      },
      {
        accessorKey: 'scheme.label',
        header: 'Scheme',
        Cell: (cell) => <>{cell.row.original.scheme ? cell.row.original.scheme.label : ""}</>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: (cell) => <>{cell.row.original.status ? cell.row.original.status : ""}</>,
      },
      {
        accessorKey: 'party',
        header: 'party',
        Cell: (cell) => <>{cell.row.original.party ? cell.row.original.party : ""}</>,
      },

      {
        accessorKey: 'article',
        header: 'article',
        Cell: (cell) => <>{cell.row.original.article ? cell.row.original.article : ""}</>,
      },
      {
        accessorKey: 'size',
        header: 'size',
        Cell: (cell) => <>{cell.row.original.size ? cell.row.original.size : ""}</>,
      },
      {
        accessorKey: 'consumed',
        header: 'consumed',
        aggregationFn: 'sum',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
        Cell: (cell) => <>{cell.row.original.consumed ? cell.row.original.consumed : ""}</>,
        Footer: ({ table }) => <b>{ table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.consumed) }, 0).toFixed()}</b>
      },

      {
        accessorKey: 'employee.label',
        header: 'Employee',
        Cell: (cell) => <>{cell.row.original.employee.label ? cell.row.original.employee.label : ""}</>,
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        Cell: (cell) => <>{cell.row.original.created_at || ""}</>,
      },
      {
        accessorKey: 'updated_by',
        header: 'Last updated by',
        Cell: (cell) => <>{cell.row.original.updated_by ? cell.row.original.updated_by.label : ""}</>,
      },

    ],
    [consumes],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: consumes, //10,000 rows       
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
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-of-type(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially status
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
      rowsPerPageOptions: [100, 200, 500, 1000, 2000],
      shape: 'rounded',
      variant: 'outlined',
    },
    enableDensityToggle: false, initialState: {
      density: 'compact', showGlobalFilter: true, pagination: { pageIndex: 0, pageSize: 500 }
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

  useEffect(() => {
    if (isSuccess) {
      setConsumes(data.data);
    }
  }, [data, isSuccess]);

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
          Stock Consumed
        </Typography>


        < Stack direction="row" spacing={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <input type='checkbox' onChange={() => setRejected(!rejected)} /> <span style={{ paddingLeft: '5px' }}>Rejected</span>
          </Stack >

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

            {LoggedInUser?.assigned_permissions.includes('consumed_stock_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('consumed_stock_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack >

      </Stack>
      {/* table */}
      {consume && <DiscardConsumptionDialog consumtion={consume} dialog={dialog} setDialog={setDialog} />}
      < MaterialReactTable table={table} />
    </>

  )

}

