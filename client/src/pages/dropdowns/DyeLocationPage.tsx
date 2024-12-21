import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
   import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { Edit, RestartAltRounded } from '@mui/icons-material'
import { Fade, FormControlLabel, IconButton, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import CreateOrEditDyeLocationDialog from '../../components/dialogs/production/CreateOrEditDyeLocationDialog'
import ToogleDyeLocationDialog from '../../components/dialogs/production/ToogleDyeLocationDialog'
import { GetDyeLocationDto } from '../../dtos/dye-location.dto'



export default function DyeLocationPage() {
  const [dyelocation, setDyeLocation] = useState<GetDyeLocationDto>()
  const [dyelocations, setDyeLocations] = useState<GetDyeLocationDto[]>([])
  const [hidden, setHidden] = useState(false)
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetDyeLocationDto[]>, BackendError>(["dyelocations", hidden], async () => GetAllDyeLocations(String(hidden)))


  const [dialog,setDialog]=useState<string|undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
   const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetDyeLocationDto>[]>(
    //column definitions...
    () => dyelocations && [
      {
        accessorKey: 'actions',
        header: '',
     
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('dye_location_edit') &&
                  <Tooltip title="toogle status">
                    <IconButton color="error"

                      onClick={() => {
                      setDialog('ToogleDyeLocationDialog')
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
                   setDialog('CreateOrEditDyeLocationDialog')
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
      
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.active ? "active" : "inactive"}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.active ? "active" : "inactive";
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'name',
        header: 'Name',
       
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
     
      {
        accessorKey: 'display_name',
        header: 'Display Name',
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.display_name ? cell.row.original.display_name : ""}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.display_name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'created_by.label',
        header: 'Created By',
      
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>,
        filterSelectOptions: dyelocations && dyelocations.map((i) => {
          return i.created_by.label;
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
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '62vh' }
    }), muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-child(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted()|| column.getIsGrouped())?'inline':'none', // Initially hidden
        },
        '& div:nth-child(2)': {
          display: (column.getIsFiltered() || column.getIsGrouped())?'inline-block':'none'
        },
        '&:hover div:nth-child(1) span': {
          display: 'inline', // Visible on hover
        },
        '&:hover div:nth-child(2)': {
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
    onColumnVisibilityChange: setColumnVisibility,rowVirtualizerInstanceRef, //
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
      setDyeLocations(data.data);
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
                setDialog('CreateOrEditDyeLocationDialog')
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_location_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_location_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditDyeLocationDialog dialog={dialog} setDialog={setDialog} location={dyelocation} />
          <>
            {
              dyelocation ?
                <>
                  <ToogleDyeLocationDialog dialog={dialog} setDialog={setDialog} location={dyelocation} />
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

