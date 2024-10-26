import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { Cyclone,  Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, MaintenanceChoiceActions,  } from '../../contexts/dialogContext'
import { onlyUnique } from '../../utils/UniqueArray'
import { Menu as MenuIcon } from '@mui/icons-material';
import PopUp from '../../components/popup/PopUp'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import ExportToExcel from "../../utils/ExportToExcel"
import { DropDownDto } from '../../dtos/common/dropdown.dto'
import { GetAllMaintenanceCategory } from '../../services/MaintenanceServices'
import CreateOrEditMaintenanceCategoryDialog from '../../components/dialogs/maintenance/CreateOrEditMaintenanceCategoryDialog'
import ToogleMaintenanceCategoryDialog from '../../components/dialogs/maintenance/ToogleMaintenanceCategoryDialog'


export default function MaintenanceCategoriesPage() {
  const [categories, setcategories] = useState<DropDownDto>()
  const [categoriess, setcategoriess] = useState<DropDownDto[]>([])
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["maintenance_categoriess"], async () => GetAllMaintenanceCategory())

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<DropDownDto>[]>(
    //column definitions...
    () => categoriess && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        Footer: <b></b>,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('maintenance_category_edit') &&
                  <Tooltip title="Toogle">
                    <IconButton color="success"

                      onClick={() => {
                        setChoice({ type: MaintenanceChoiceActions.toogle_maintenance_category })
                        setcategories(cell.row.original)

                      }}
                    >
                      <Cyclone />
                    </IconButton>
                  </Tooltip>
                }
                {LoggedInUser?.assigned_permissions.includes('maintenance_category_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setcategories(cell.row.original)
                      setChoice({ type: MaintenanceChoiceActions.create_or_edit_maintenance_category })
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
        accessorKey: 'value',
        header: 'Category',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.value ? cell.row.original.value : ""}</>,
        filterSelectOptions: categoriess && categoriess.map((i) => {
          return i.value;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'label',
        header: 'Display Name',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.label ? cell.row.original.label : ""}</>,
        filterSelectOptions: categoriess && categoriess.map((i) => {
          return i.label;
        }).filter(onlyUnique)
      }
    ],
    [categoriess, data],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: categoriess, //10,000 rows     
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
        fontSize: '14px'
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '68vh' }
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
        fontSize: '13px'
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
      setcategoriess(data.data);
    }
  }, [isSuccess, data]);


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
          Categoriess 
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
            {LoggedInUser?.assigned_permissions.includes('maintenance_category_create') && <MenuItem

              onClick={() => {
                setChoice({ type: MaintenanceChoiceActions.create_or_edit_maintenance_category })
                setcategories(undefined)
                setAnchorEl(null)
              }}
            > Add New</MenuItem>}
           

            {LoggedInUser?.assigned_permissions.includes('maintenance_category_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('maintenance_category_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditMaintenanceCategoryDialog />
        
          <>
            {
              categories ?
                <>

                  <ToogleMaintenanceCategoryDialog category={categories} />
                  <CreateOrEditMaintenanceCategoryDialog category={categories} />
                </>
                : null
            }
          </>
        </>


      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

