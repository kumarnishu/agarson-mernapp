import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import CreateOrEditExpenseItemDialog from '../../components/dialogs/dropdown/CreateOrEditExpenseItemDialog'
import { ExpenseItemButtons } from '../../components/buttons/ExpenseItemButtons'
import { DropdownService } from '../../services/DropDownServices'
import { GetExpenseItemDto } from '../../dtos/ExpenseDto'



export default function ExpenseItemsPage() {
  const [item, setItem] = useState<GetExpenseItemDto>()
  const [items, setItems] = useState<GetExpenseItemDto[]>([])
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetExpenseItemDto[]>, BackendError>(["items"], async () =>new DropdownService(). GetExpenseItems())

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const columns = useMemo<MRT_ColumnDef<GetExpenseItemDto>[]>(
    //column definitions...
    () => items && [
      {
        accessorKey: 'actions',  enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
        header: '',
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>
                {LoggedInUser?.assigned_permissions.includes('expense_item_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setItem(cell.row.original)
                      setDialog('CreateOrEditExpenseItemDialog')
                    }}

                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

              </>

            </Stack>}
        />
      },


      {
        accessorKey: 'item',
        header: 'Name',
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.item ? cell.row.original.item : ""}</>,
        filterSelectOptions: items && items.map((i) => {
          return i.item;
        }).filter(onlyUnique)
      },

      {
        accessorKey: 'category.label',
        header: 'Category',

        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.label : ""}</>,
        filterSelectOptions: items && items.map((i) => {
          return i.category.label;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        Cell: (cell) => <>{cell.row.original.stock == 0 ? "" : cell.row.original.stock}</>,
      }
      ,
      {
        accessorKey: 'price',
        header: 'Price',
      }
      ,
      {
        accessorKey: 'pricetolerance',
        header: 'Price Tolerance',
        Cell: (cell) => <>{cell.row.original.pricetolerance == 0 ? "" : cell.row.original.pricetolerance}</>,
      }
      ,
      {
        accessorKey: 'stock_limit',
        header: 'Stock Limit',
        Cell: (cell) => <>{cell.row.original.stock_limit == 0 ? "" : cell.row.original.stock_limit}</>,
      }
      ,
      {
        accessorKey: 'to_maintain_stock',
        header: 'Maintain Stock',
        Cell: (cell) => <>{cell.row.original.to_maintain_stock ? "yes" : ""}</>,
      }
      ,
      {
        accessorKey: 'unit.label',
        header: 'Unit',
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
          Expense Items
        </Typography>
        <Stack
          spacing={2}
          padding={1}
          direction="row"
          justifyContent="space-between"
          alignItems={'end'}
        >

          {LoggedInUser?.assigned_permissions.includes('expense_item_create') && <ExpenseItemButtons />}
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
            {LoggedInUser?.assigned_permissions.includes("expense_item_create") && <MenuItem
              onClick={() => {
                setItem(undefined)
                setAnchorEl(null)
                setDialog('CreateOrEditExpenseItemDialog')
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('expense_item_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('expense_item_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>

        <CreateOrEditExpenseItemDialog dialog={dialog} setDialog={setDialog} item={item} />
      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

