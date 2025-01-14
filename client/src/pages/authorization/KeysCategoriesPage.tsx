import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import CreateOrEditKeyCategoryDialog from '../../components/dialogs/authorization/CreateOrEditKeyCategoryDialog'
import AssignKeyCategoriesDialog from '../../components/dialogs/authorization/AssignKeyCategoriesDialog'
import { AuthorizationService } from '../../services/AuthorizationService'
import { GetKeyCategoryDto } from '../../dtos/response/AuthorizationDto'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'


export default function KeysCategoriesPage() {
  const [categories, setKeyCategorys] = useState<GetKeyCategoryDto[]>([])
  const [category, setKeyCategory] = useState<GetKeyCategoryDto>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [flag, setFlag] = useState(1);
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetKeyCategoryDto[]>, BackendError>(["key_categories"], async () => new AuthorizationService().GetAllKeyCategories())


  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetKeyCategoryDto>[]>(
    //column definitions...
    () => [
      {
        accessorKey: 'actions', enableColumnFilter: false,
        header: '',
        size: 50,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>
                {LoggedInUser?.assigned_permissions.includes('key_category_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setKeyCategory(cell.row.original)
                      setDialog('CreateOrEditKeyCategoryDialog')
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
        accessorKey: 'category',
        header: 'Category',

        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category : ""}</>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={categories.map((item) => {
          return item.category
        })} />,
      },
      {
        accessorKey: 'display_name',
        header: 'Display Name',
        Cell: (cell) => <>{cell.row.original.display_name ? cell.row.original.display_name : ""}</>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={categories.map((item) => {
          return item.display_name
        })} />,
      },
      {
        accessorKey: 'skip_bottom_rows',
        header: 'Skip Bottom Rows',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={categories.map((item) => {
          return item.skip_bottom_rows
        })} />,
        Cell: (cell) => <>{cell.row.original.skip_bottom_rows ? cell.row.original.skip_bottom_rows.toString() || "" : ""}</>,
      },

      {
        accessorKey: 'assigned_users',
        header: 'Assigned Users',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={categories.map((item) => {
          return item.assigned_users
        })} />,
        Cell: (cell) => <span title={cell.row.original.assigned_users}>{cell.row.original.assigned_users ? cell.row.original.assigned_users : ""}</span>,

      },

    ],
    [],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: categories, //10,000 rows       
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
    enableRowNumbers: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //
    columnVirtualizerOptions: { overscan: 2 },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });


  useEffect(() => {
    if (isSuccess) {
      setKeyCategorys(data.data);
    }
  }, [data, isSuccess]);

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
          Key Category
        </Typography>



        <>

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
            {LoggedInUser?.assigned_permissions.includes("key_category_create") && <MenuItem
              onClick={() => {
                setKeyCategory(undefined)
                setAnchorEl(null)
                setDialog('CreateOrEditKeyCategoryDialog')
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('key_category_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some key_category")
                }
                else {
                  setDialog('AssignKeyCategoriesDialog')
                  setKeyCategory(undefined)
                  setFlag(1)
                }
                setAnchorEl(null)
              }}
            > Assign Users</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('key_category_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some key_category")
                }
                else {
                  setDialog('AssignKeyCategoriesDialog')
                  setKeyCategory(undefined)
                  setFlag(0)
                }
                setAnchorEl(null)
              }}
            > Remove Users</MenuItem>}


            {LoggedInUser?.assigned_permissions.includes('key_category_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('key_category_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditKeyCategoryDialog dialog={dialog} setDialog={setDialog} category={category} />
          {<AssignKeyCategoriesDialog dialog={dialog} setDialog={setDialog} flag={flag} categories={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
        </>


      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

