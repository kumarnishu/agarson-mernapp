import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { AddBoxOutlined, Input } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import IssueExpenseItemDialog from '../../components/dialogs/expense/IssueExpenseItemDialog'
import AddExpenseItemDialog from '../../components/dialogs/expense/AddExpenseItemDialog'
import { ExpenseService } from '../../services/ExpenseService'
import { GetExpenseItemDto } from '../../dtos/ExpenseDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'




export default function ExpenseStorePage() {
  const [item, setItem] = useState<GetExpenseItemDto>()
  const [items, setItems] = useState<GetExpenseItemDto[]>([])
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetExpenseItemDto[]>, BackendError>(["expense-store"], async () => new ExpenseService().GetExpenseStore())



  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  
  const columns = useMemo<MRT_ColumnDef<GetExpenseItemDto>[]>(
    //column definitions...
    () => items && [
      {
        accessorKey: 'actions',  enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
        header:'Actions',
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>
                {cell.row.original.to_maintain_stock && LoggedInUser?.assigned_permissions.includes('expense_item_edit') && <Tooltip title="add more items">
                  <IconButton
                    color='success'
                    onClick={() => {
                      setItem(cell.row.original)
                      setDialog('AddExpenseItemDialog')
                    }}

                  >
                    <AddBoxOutlined />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('expense_item_edit') && <Tooltip title="issue item">
                  <IconButton
                    onClick={() => {
                      setItem(cell.row.original)
                      setDialog('IssueExpenseItemDialog')
                    }}

                  >
                    < Input />
                  </IconButton>
                </Tooltip>}
              </>

            </Stack>}
        />
      },


      {
        accessorKey: 'item',
        header: 'Name',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={items.map((item) => { return item.item || "" })} />,
        Cell: (cell) => <>{cell.row.original.item ? cell.row.original.item : ""}</>,
       
      },
      {
        accessorKey: 'last_remark',
        header: 'Last Remark',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={items.map((item) => { return item.last_remark || "" })} />,
      },
     
      {
        accessorKey: 'category.label',
        header: 'Category',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={items.map((item) => { return item.category.label || "" })} />,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.stock == 0 ? "" : cell.row.original.stock}</>,
      }
      ,
      {
        accessorKey: 'price',
        header: 'Price',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
      }
      ,
      {
        accessorKey: 'pricetolerance',
        header: 'Price Tolerance',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.pricetolerance == 0 ? "" : cell.row.original.pricetolerance}</>,
      }
      ,
      {
        accessorKey: 'stock_limit',
        header: 'Stock Limit',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.stock_limit == 0 ? "" : cell.row.original.stock_limit}</>,
      }
      ,
      {
        accessorKey: 'to_maintain_stock',
        header: 'Maintain Stock',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.to_maintain_stock ? "yes" : ""}</>,
      }
      ,
      {
        accessorKey: 'unit.label',
        header: 'Unit',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={items.map((item) => { return item.unit.label || "" })} />,
      }
    ],
    [items],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: items, //10,000 rows       
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
    //enableRowNumbers: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    onColumnVisibilityChange: setColumnVisibility,  //optional

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
      'mrt_columnVisibility_ExpenseStorePage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_ExpenseStorePage',
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
      'mrt_columnVisibility_ExpenseStorePage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_ExpenseStorePage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_ExpenseStorePage', JSON.stringify(columnSizing));
  }, [columnSizing]);

  useEffect(() => {
    if (isSuccess) {
      setItems(data.data);
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
          Expense Store
        </Typography>
        <Stack
          spacing={2}
          padding={1}
          direction="row"
          justifyContent="space-between"
          alignItems={'end'}
        >

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

            {LoggedInUser?.assigned_permissions.includes('expense_item_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('expense_item_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>

        {item && <IssueExpenseItemDialog item={item} dialog={dialog} setDialog={setDialog} />}
        {item && <AddExpenseItemDialog item={item} dialog={dialog} setDialog={setDialog} />}
      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

