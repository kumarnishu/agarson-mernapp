import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import CreateOrEditCityDialog from '../../components/dialogs/crm/CreateOrEditCityDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { GetAllCities, GetAllStates } from '../../services/LeadsServices'
import FindUknownCrmCitiesDialog from '../../components/dialogs/crm/FindUknownCrmCitiesDialog'
import { GetCrmCityDto, GetCrmStateDto } from '../../dtos'
import AssignCrmCitiesDialog from '../../components/dialogs/crm/AssignCrmCitiesDialog'
import { toTitleCase } from '../../utils/TitleCase'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."


export default function CrmCitiesPage() {
  const [state, setState] = useState<string | undefined>('haryana');
  const [states, setStates] = useState<GetCrmStateDto[]>([])
  const [city, setCity] = useState<GetCrmCityDto>()
  const [cities, setCities] = useState<GetCrmCityDto[]>([])
  const [flag, setFlag] = useState(1);
  const { user: LoggedInUser } = useContext(UserContext)
  const { data: citiesdata, isSuccess, isLoading } = useQuery<AxiosResponse<GetCrmCityDto[]>, BackendError>(["crm_cities", state], async () => GetAllCities({ state: state }))
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const { data, isSuccess: isStateSuccess } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>("crm_cities", GetAllStates)

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);


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
        maxSize: 50,
        Footer: <b></b>,
        grow: false,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('city_delete') &&
                  <Tooltip title="delete">
                    <IconButton color="error"

                      onClick={() => {
                        setChoice({ type: LeadChoiceActions.delete_crm_item })
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
                      setChoice({ type: LeadChoiceActions.create_or_edit_city })
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
        minSize: 350,
        grow: false,
        Cell: (cell) => <> {
          [cell.row.original.city, String(cell.row.original.alias1 || ""), String(cell.row.original.alias2 || "")].filter(value => value)
            .join(", ")
        }</>,
      },
      {
        accessorKey: 'state',
        header: 'State',
        minSize: 350,
        grow: false
      },

      {
        // accessorKey: 'assigned_users.value',
        accessorFn: (Cell) => { return Cell.assigned_users },
        header: 'Assigned Users',
        minSize: 650,
        grow: false,
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
    onSortingChange: setSorting,
    state: { isLoading, sorting }
  });

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
                setChoice({ type: LeadChoiceActions.create_or_edit_city })
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
                  setChoice({ type: LeadChoiceActions.bulk_assign_crm_cities })
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
                  setChoice({ type: LeadChoiceActions.bulk_assign_crm_cities })
                  setCity(undefined)
                  setFlag(0)
                }
                setAnchorEl(null)
              }}
            > Remove Cities</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_create') && <MenuItem
              sx={{ color: 'red' }}

              onClick={() => {
                setChoice({ type: LeadChoiceActions.find_unknown_cities })
                setCity(undefined)
                setAnchorEl(null)
              }}
            > Find Unknown Cities</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('city_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}


          </Menu >
          <CreateOrEditCityDialog />
          {LoggedInUser?.is_admin && <FindUknownCrmCitiesDialog />}
          {<AssignCrmCitiesDialog flag={flag} cities={table.getSelectedRowModel().rows.map((item) => { return { id: item.original._id, label: item.original.city, value: item.original.city } })} />}
          <>
            {
              city ?
                <>

                  <DeleteCrmItemDialog city={city} />
                  <CreateOrEditCityDialog city={city} />
                  <DeleteCrmItemDialog city={city} />
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

