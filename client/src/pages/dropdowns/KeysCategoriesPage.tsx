import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { KeyChoiceActions, ChoiceContext } from '../../contexts/dialogContext'
import { Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import { GetKeyCategoryDto } from '../../dtos'
import { GetAllKeyCategories } from '../../services/KeyServices'
import CreateOrEditKeyCategoryDialog from '../../components/dialogs/keys/CreateOrEditKeyCategoryDialog'
import AssignKeyCategoriesDialog from '../../components/dialogs/keys/AssignKeyCategoriesDialog'



export default function KeysCategoriesPage() {
  const [categories, setKeyCategorys] = useState<GetKeyCategoryDto[]>([])
  const [category, setKeyCategory] = useState<GetKeyCategoryDto>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [flag, setFlag] = useState(1);
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetKeyCategoryDto[]>, BackendError>(["key_categories"], async () => GetAllKeyCategories())

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetKeyCategoryDto>[]>(
    //column definitions...
    () => categories && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        minSize: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>
                {LoggedInUser?.assigned_permissions.includes('key_category_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setKeyCategory(cell.row.original)
                      setChoice({ type: KeyChoiceActions.create_or_edit_key_category })
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
        minSize: 350,
        grow: false,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category : ""}</>,
        filterSelectOptions: categories && categories.map((i) => {
          return i.category;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'skip_bottom_rows',
        header: 'Skip Bottom Rows',
        minSize: 350,
        grow: false,
        Cell: (cell) => <>{cell.row.original.skip_bottom_rows ? cell.row.original.skip_bottom_rows.toString() || "" : ""}</>,
      },

      {
        accessorKey: 'assigned_users',
        header: 'Assigned Users',
        minSize: 350,
        grow: false,
        Cell: (cell) => <>{cell.row.original.assigned_users ? cell.row.original.assigned_users : ""}</>,

      },

    ],
    [categories],
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
    initialState: {
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
    onSortingChange: setSorting,
    state: { isLoading, sorting }
  });


  useEffect(() => {
    if (isSuccess) {
      setKeyCategorys(data.data);
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
                setChoice({ type: KeyChoiceActions.create_or_edit_key_category })
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('key_category_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some key_category")
                }
                else {
                  setChoice({ type: KeyChoiceActions.assign_categories })
                  setKeyCategory(undefined)
                  setFlag(1)
                }
                setAnchorEl(null)
              }}
            > Assign Categories</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('key_category_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some key_category")
                }
                else {
                  setChoice({ type: KeyChoiceActions.assign_categories })
                  setKeyCategory(undefined)
                  setFlag(0)
                }
                setAnchorEl(null)
              }}
            > Remove Categories</MenuItem>}


            {LoggedInUser?.assigned_permissions.includes('key_category_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('key_category_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditKeyCategoryDialog category={category} />
          {<AssignKeyCategoriesDialog flag={flag} categories={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
        </>


      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

