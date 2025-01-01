import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import CreateOrEditCityDialog from '../../components/dialogs/authorization/CreateOrEditCityDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import { UserContext } from '../../contexts/userContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import FindUknownCrmCitiesDialog from '../../components/dialogs/authorization/FindUknownCrmCitiesDialog'
import AssignCrmCitiesDialog from '../../components/dialogs/authorization/AssignCrmCitiesDialog'
import { toTitleCase } from '../../utils/TitleCase'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { GetCrmCityDto } from '../../dtos/crm-city.dto'
import { GetCrmStateDto } from '../../dtos/crm-state.dto'
import { AuthorizationService } from '../../services/AuthorizationService'


export default function CrmCitiesPage() {
  const [state, setState] = useState<string | undefined>('haryana');
  const [states, setStates] = useState<GetCrmStateDto[]>([])
  const [city, setCity] = useState<GetCrmCityDto>()
  const [cities, setCities] = useState<GetCrmCityDto[]>([])
  const [flag, setFlag] = useState(1);
  const { user: LoggedInUser } = useContext(UserContext)
  const { data: citiesdata, isSuccess, isLoading } = useQuery<AxiosResponse<GetCrmCityDto[]>, BackendError>(["crm_cities", state], async () => new AuthorizationService().GetAllCities({ state: state }))
  const { data, isSuccess: isStateSuccess } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>("crm_cities", new AuthorizationService().GetAllStates)

  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

  // const handleExportRows = (rows: MRT_Row<GetCrmStateDto>[]) => {
  //   const doc = new jsPDF();
  //   const tableData = rows.map((row) => Object.values(row.original.state));
  //   const tableHeaders = columns.map((c) => c.header);

  //   autoTable(doc, {
  //     head: [tableHeaders],
  //     body: tableData,
  //   });

  //   doc.save('mrt-pdf-example.pdf');
  // };

  useEffect(() => {
    if (isSuccess) {
      setCities(citiesdata.data)
    }
  }, [isSuccess, citiesdata])

  useEffect(() => {
    if (isStateSuccess) {
      setStates(data.data)
    }
  }, [isSuccess, states, data])
  const columns = useMemo<MRT_ColumnDef<GetCrmCityDto>[]>(
    //column definitions...
    () => cities && [
      {
        accessorKey: 'actions',
        header: '',

        Footer: <b></b>,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('city_delete') &&
                  <Tooltip title="delete">
                    <IconButton color="error"

                      onClick={() => {
                        setDialog('DeleteCrmItemDialog')
                        setCity(cell.row.original)

                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                }
                {LoggedInUser?.assigned_permissions.includes('city_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setCity(cell.row.original)
                      setDialog('CreateOrEditCityDialog')
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
        accessorKey: 'city',
        header: 'City',

        Cell: (cell) => <> {
          [cell.row.original.city, String(cell.row.original.alias1 || ""), String(cell.row.original.alias2 || "")].filter(value => value)
            .join(", ")
        }</>,
      },
      {
        accessorKey: 'state',
        header: 'State',


      },

      {
        // accessorKey: 'assigned_users.value',
        accessorFn: (Cell) => { return Cell.assigned_users },
        header: 'Assigned Users',

        filterVariant: 'text',
        Cell: (cell) => <>{cell.row.original.assigned_users && cell.row.original.assigned_users.length > 0 ? cell.row.original.assigned_users : ""}</>,
      }
    ],
    [cities],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: cities, //10,000 rows       
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
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
        fontSize: '13px'
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [100, 200, 500, 1000, 2000],
      shape: 'rounded',
      variant: 'outlined',
    },
   enableDensityToggle: false, initialState: {
      density: 'compact', showGlobalFilter: true, pagination: { pageIndex: 0, pageSize: 2000 }
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
    onColumnSizingChange: setColumnSizing,
    state: {
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
          Cities : {cities && cities.length}
        </Typography>
        < Stack direction="row" spacing={2}>

          < TextField
            select
            SelectProps={{
              native: true
            }}
            id="state"
            size="small"
            label="Select State"
            sx={{ width: '200px' }}
            value={state}
            onChange={(e) => {
              setState(e.target.value);
            }
            }
          >
            <option key={0} value={"all"}>
              Select State
            </option>
            {
              states.map(state => {
                return (<option key={state._id} value={state.state}>
                  {toTitleCase(state.state)}
                </option>)
              })
            }
          </TextField>
        </Stack >
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
            {LoggedInUser?.assigned_permissions.includes('city_create') && <MenuItem

              onClick={() => {
                setDialog('CreateOrEditCityDialog')
                setCity(undefined)
                setAnchorEl(null)
              }}
            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some cities")
                }
                else {
                  setDialog('AssignCrmCitiesDialog')
                  setCity(undefined)
                  setFlag(1)
                }
                setAnchorEl(null)
              }}
            > Assign Cities</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some cities")
                }
                else {
                  setDialog('AssignCrmCitiesDialog')
                  setCity(undefined)
                  setFlag(0)
                }
                setAnchorEl(null)
              }}
            > Remove Cities</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_create') && <MenuItem
              sx={{ color: 'red' }}

              onClick={() => {
                setDialog('FindUknownCrmCitiesDialog')
                setCity(undefined)
                setAnchorEl(null)
              }}
            > Find Unknown Cities</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}


          </Menu >
          <CreateOrEditCityDialog dialog={dialog} setDialog={setDialog} />
          {LoggedInUser?.is_admin && <FindUknownCrmCitiesDialog dialog={dialog} setDialog={setDialog} />}
          {<AssignCrmCitiesDialog dialog={dialog} setDialog={setDialog} flag={flag} cities={table.getSelectedRowModel().rows.map((item) => { return { id: item.original._id, label: item.original.city, value: item.original.city } })} />}
          <>
            {
              city ?
                <>

                  <DeleteCrmItemDialog dialog={dialog} setDialog={setDialog} city={city} />
                  <CreateOrEditCityDialog dialog={dialog} setDialog={setDialog} city={city} />
                  <DeleteCrmItemDialog dialog={dialog} setDialog={setDialog} city={city} />
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

