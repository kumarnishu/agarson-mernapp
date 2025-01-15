import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Edit, RestartAlt } from '@mui/icons-material'
import { Fade, FormControlLabel, IconButton, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import ToogleDyeDialog from '../../components/dialogs/dropdown/ToogleDyeDialog'
import CreateOrEditDyeDialog from '../../components/dialogs/dropdown/CreateOrEditDyeDialog'

import { AxiosResponse } from "axios"
import { GetDyeDto } from '../../dtos/DropDownDto'
import { BackendError } from '../..'
import { DropdownService } from '../../services/DropDownServices'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'


export default function DyePage() {
  const [dye, setDye] = useState<GetDyeDto>()
  const [dyes, setDyes] = useState<GetDyeDto[]>([])
  const [hidden, setHidden] = useState(false)
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetDyeDto[]>, BackendError>(["dyes", hidden], async () => new DropdownService().GetDyes(String(hidden)))


  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetDyeDto>[]>(
    //column definitions...
    () => dyes && [
      {
        accessorKey: 'actions', enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        header: 'Actions',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.assigned_permissions.includes('dye_edit') && <Tooltip title="Toogle">
                  <IconButton color="primary"

                    onClick={() => {
                      setDye(cell.row.original)
                      setDialog('ToogleDyeDialog')

                    }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('dye_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setDye(cell.row.original)
                      setDialog('CreateOrEditDyeDialog')
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
        enableColumnFilter: false,
        Cell: (cell) => <>{cell.row.original.active ? "active" : "inactive"}</>,

      },
      {
        accessorKey: 'dye_number',
        header: 'Dye',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.dye_number.toString() || "" ? cell.row.original.dye_number.toString() || "" : ""}</>,

      },
      {
        accessorKey: 'size',
        header: 'Size',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={dyes.map((item) => { return item.size || "" })} />, 
        Cell: (cell) => <>{cell.row.original.size ? cell.row.original.size : ""}</>,
      },
      {
        accessorKey: 'stdshoe_weight',
        header: 'St. Weight',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        aggregationFn: 'sum',
        Cell: (cell) => <>{cell.row.original.stdshoe_weight ? cell.row.original.stdshoe_weight : ""}</>,

      },
      {
        accessorKey: 'articlenames',
        header: 'Articles',
        Cell: (cell) => <>{cell.row.original.articlenames.toString() ? cell.row.original.articles.map((a) => { return a.label }).toString() : ""}</>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={dyes.map((item) => { return item.articlenames || "" })} />, 
      }
    ],
    [dyes],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: dyes, //10,000 rows       
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
    enableRowNumbers: true,
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
    if (isSuccess) {
      setDyes(data.data);
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
          Dyes
        </Typography>
        <Stack
          spacing={2}
          padding={1}
          direction="row"
          justifyContent="space-between"
          alignItems={'end'}
        >

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
            {LoggedInUser?.assigned_permissions.includes("dye_create") && <MenuItem
              onClick={() => {
                setDye(undefined)
                setAnchorEl(null)
                setDialog('CreateOrEditDyeDialog')
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_export') && < MenuItem onClick={() => {

              let data: { _id: string, dye: number, size: string, st_weight: number, articles: string }[] = []
              data = table.getRowModel().rows.map((row) => {
                return {
                  _id: row.original._id,
                  dye: row.original.dye_number,
                  size: row.original.size,
                  st_weight: row.original.stdshoe_weight,
                  articles: row.original.articles ? row.original.articles.map((a) => { return a.label }).toString() : ""
                }
              })
              ExportToExcel(data, "Exported Data")
            }
            }

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
              let data: { _id: string, dye: number, size: string, st_weight: number, articles: string }[] = []
              data = table.getRowModel().rows.map((row) => {
                return {
                  _id: row.original._id,
                  dye: row.original.dye_number,
                  size: row.original.size,
                  st_weight: row.original.stdshoe_weight,
                  articles: row.original.articles ? row.original.articles.map((a) => { return a.label }).toString() : ""
                }
              })

              ExportToExcel(data, "Exported Data")
            }
            }

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>

        <CreateOrEditDyeDialog dialog={dialog} setDialog={setDialog} dye={dye} />
        {
          dye ?
            <>
              <ToogleDyeDialog dialog={dialog} setDialog={setDialog} dye={dye} />
            </>
            : null
        }
      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

