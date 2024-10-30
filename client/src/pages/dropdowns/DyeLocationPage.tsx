import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, ProductionChoiceActions } from '../../contexts/dialogContext'
import { Edit, RestartAltRounded } from '@mui/icons-material'
import { Fade, FormControlLabel, IconButton, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { GetAllDyeLocations } from '../../services/ProductionServices'
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import { GetDyeLocationDto } from '../../dtos'
import CreateOrEditDyeLocationDialog from '../../components/dialogs/production/CreateOrEditDyeLocationDialog'
import ToogleDyeLocationDialog from '../../components/dialogs/production/ToogleDyeLocationDialog'



export default function DyeLocationPage() {
  const [dyelocation, setDyeLocation] = useState<GetDyeLocationDto>()
  const [dyelocations, setDyeLocations] = useState<GetDyeLocationDto[]>([])
  const [hidden, setHidden] = useState(false)
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetDyeLocationDto[]>, BackendError>(["dyelocations", hidden], async () => GetAllDyeLocations(String(hidden)))

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetDyeLocationDto>[]>(
    //column definitions...
    () => dyelocations && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('dye_location_edit') &&
                  <Tooltip title="toogle status">
                    <IconButton color="error"

                      onClick={() => {
                        setChoice({ type: ProductionChoiceActions.toogle_dye_location })
                        setDyeLocation(cell.row.original)

                      }}
                    >
                      <RestartAltRounded />
                    </IconButton>
                  </Tooltip>
                }
                {LoggedInUser?.assigned_permissions.includes('dye_location_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setDyeLocation(cell.row.original)
                      setChoice({ type: ProductionChoiceActions.create_or_edit_location })
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
        accessorKey: 'active',
        header: 'Status',
        size: 120,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.active ? "active" : "inactive"}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.active ? "active" : "inactive";
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
     
      {
        accessorKey: 'display_name',
        header: 'Display Name',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.display_name ? cell.row.original.display_name : ""}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.display_name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'created_by.value',
        header: 'Created By',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.created_by.value ? cell.row.original.created_by.value : ""}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.created_by.value;
        }).filter(onlyUnique)
      }
    ],
    [dyelocations],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover', 
    data: dyelocations, //10,000 rows       
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
      setDyeLocations(data.data);
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
          Dye Location
        </Typography>



        <>
          <FormControlLabel control={<Switch
            defaultChecked={Boolean(hidden)}
            onChange={() => setHidden(!hidden)}
          />} label="Show Inactive" />

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
            {LoggedInUser?.assigned_permissions.includes("dye_location_create") && <MenuItem
              onClick={() => {
                setDyeLocation(undefined)
                setAnchorEl(null)
                setChoice({ type: ProductionChoiceActions.create_or_edit_location })
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_location_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_location_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditDyeLocationDialog location={dyelocation} />
          <>
            {
              dyelocation ?
                <>
                  <ToogleDyeLocationDialog location={dyelocation} />
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

