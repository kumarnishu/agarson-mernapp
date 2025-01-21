import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, FormControlLabel, IconButton, Menu, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit, FilterAltOff } from '@mui/icons-material'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import { GetSampleSystemDto } from '../../dtos/PartyPageDto'
import { PartyPageService } from '../../services/PartyPageService'
import DeleteSampleSystemDialog from '../../components/dialogs/party/DeleteSampleSystemDialog'
import ViewSampleRemarksDialog from '../../components/dialogs/party/ViewSampleRemarksDialog'
import CreateOrEditSampleSystemDialog from '../../components/dialogs/party/CreateOrEditSampleSystemDialog'

function SampleUpdateSystemPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [sample, setSample] = useState<GetSampleSystemDto>()
  const [samples, setSamples] = useState<GetSampleSystemDto[]>([])
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date(new Date().setDate(1)).setMonth(new Date().getMonth())).format("YYYY-MM-DD"),
    end_date: moment(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() + 1)).format("YYYY-MM-DD")
  })
  const [hidden, setHidden] = useState(false)

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [dialog, setDialog] = useState<string | undefined>()
  let previous_date = new Date()
  let day = previous_date.getDate() - 1
  previous_date.setDate(day)
  previous_date.setHours(0, 0, 0, 0)

  const { data, isLoading } = useQuery<AxiosResponse<GetSampleSystemDto[]>, BackendError>(["samples", hidden, dates?.start_date, dates?.end_date], async () => new PartyPageService().GetSampleSystems({ start_date: dates?.start_date, end_date: dates?.end_date, hidden }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetSampleSystemDto>[]>(
    //column definitions...
    () => samples && [
      {
        accessorKey: 'actions', enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        header: 'Actions',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.role == "admin" && LoggedInUser?.assigned_permissions.includes('sample_update_system_delete') && <Tooltip title="delete">
                <IconButton color="error"
                  onClick={() => {

                    setDialog('DeleteSampleSystemDialog')
                    setSample(cell.row.original)


                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('sample_update_system_edit') &&
                <Tooltip title="Edit">
                  <IconButton
                    disabled={LoggedInUser.role !== "admin" && new Date(cell.row.original.date) < previous_date}
                    onClick={() => {

                      setDialog('CreateOrEditSampleSystemDialog')
                      setSample(cell.row.original)

                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },
      {
        accessorKey: 'stage',
        header: ' Stage',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.stage || "" })} />,
        Cell: (cell) => <span title={cell.row.original.stage && cell.row.original.stage}>{cell.row.original.stage && cell.row.original.stage}</span>
      },
      {
        accessorKey: 'last_remark',
        header: ' Remarks',
        Cell: (cell) =>
          <Typography
            onClick={() => {
              setSample(cell.row.original)
              setDialog('ViewSampleRemarksDialog')
            }}
            sx={{
              width: '100%',
              '&:hover': {
                color: 'primary.main', // change color on hover
                cursor: 'pointer', // change cursor to pointer
              },
            }}
          > {cell.row.original.last_remark || "..."}
          </Typography >,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.last_remark || "" })} />,
      },
      {
        accessorKey: 'next_call',
        header: 'Next Call',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.next_call || "" })} />,
        Cell: (cell) => <>{cell.row.original.next_call || ""}</>,

      },

      {
        accessorKey: 'party',
        header: ' Party',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.party || "" })} />,
        Cell: (cell) => <span title={cell.row.original.party && cell.row.original.party}>{cell.row.original.party && cell.row.original.party}</span>
      },
      {
        accessorKey: 'date',
        header: 'Date',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.date || "" })} />,
        Cell: (cell) => <span >{cell.row.original.date && cell.row.original.date}</span>

      },
      {
        accessorKey: 'samples',
        header: ' Samples',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.samples || "" })} />,
        aggregationFn: 'count',

      },

      {
        accessorKey: 'state',
        header: ' State',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.state || "" })} />,
        aggregationFn: 'count'

      },

      {
        accessorKey: 'updated_at',
        header: 'Last Updated At',

        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.updated_at || "" })} />,

        Cell: (cell) => <>{cell.row.original.updated_at}</>
      },
      {
        accessorKey: 'updated_by.label',
        header: 'Last Updated By',

        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={samples.map((item) => { return item.updated_by.label || "" })} />,

        Cell: (cell) => <>{cell.row.original.updated_by.label}</>
      },
    ],
    [samples, data],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: samples, //10,000 rows       
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
    muiTableBodyCellProps: (props) => ({
      sx: {
        border: '1px solid #c2beba;',
        color: props.row.original.stage !== "ordered" ? props.row.original.stage == "pending" ? 'black' : 'red' : 'green',
      },
    }),
    muiTableBodyRowProps: () => ({
      sx: {
        // backgroundColor: props.row.original.stage !== "ordered" ? props.row.original.stage == "pending" ? 'orange' : 'red' : 'green',
      }
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
    onColumnVisibilityChange: setColumnVisibility,  //optional

    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });


  useEffect(() => {
    if (data) {
      setSamples(data.data)

    }
  }, [data])


  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_SalesmanSamplePage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_SalesmanSamplePage',
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
      'mrt_columnVisibility_SalesmanSamplePage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_SalesmanSamplePage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_SalesmanSamplePage', JSON.stringify(columnSizing));
  }, [columnSizing]);

  return (
    <>
      <Box minWidth={'100vw'} >
        <Stack sx={{ p: 1 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant='h6'>Samples System</Typography>
          <Stack
            pt={1}
            direction="row"
            alignItems={'center'}
            justifyContent="right">

            <Stack justifyContent={'right'} direction={'row'} gap={1}>
              < TextField
                size="small"
                type="date"
                id="start_date"
                label="Start Date"
                fullWidth

                value={dates.start_date}
                onChange={(e) => {
                  if (e.currentTarget.value) {
                    setDates({
                      ...dates,
                      start_date: moment(e.target.value).format("YYYY-MM-DD")
                    })
                  }
                }}
              />
              < TextField
                type="date"
                id="end_date"
                size="small"
                label="End Date"
                value={dates.end_date}

                fullWidth
                onChange={(e) => {
                  setDates({
                    ...dates,
                    end_date: moment(e.target.value).format("YYYY-MM-DD")
                  })
                }}
              />

              <FormControlLabel control={<Switch
                defaultChecked={Boolean(hidden)}
                onChange={() => setHidden(!hidden)}
              />} label="Hidden" />
              <Button size="small" color="inherit" variant='contained'
                onClick={() => {
                  table.resetColumnFilters(true)
                }
                }
              >
                <FilterAltOff />
              </Button>


              <Button size="small" color="inherit" variant='contained'
                onClick={(e) => setAnchorEl(e.currentTarget)
                }
              >
                <MenuIcon />
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Box >
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

        {LoggedInUser?.assigned_permissions.includes('sample_update_system_create') && <MenuItem

          onClick={() => {
            setDialog('CreateOrEditSampleSystemDialog')
            setSample(undefined)
            setAnchorEl(null)
          }}
        > Add New</MenuItem>}


        {LoggedInUser?.assigned_permissions.includes('sample_update_system_export') && < MenuItem onClick={() => {

          let data = table.getRowModel().rows;
          ExportToExcel(data, "Samples Data")
        }
        }
        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('sample_update_system_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data = table.getSelectedRowModel().rows
          ExportToExcel(data, "Samples Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>
      <MaterialReactTable table={table} />
      <CreateOrEditSampleSystemDialog dialog={dialog} setDialog={setDialog} sample={sample} />
      {sample && <ViewSampleRemarksDialog dialog={dialog} setDialog={setDialog} sample={sample} />}
      {sample && <DeleteSampleSystemDialog dialog={dialog} setDialog={setDialog} sample={sample} />}
    </>
  )
}

export default SampleUpdateSystemPage