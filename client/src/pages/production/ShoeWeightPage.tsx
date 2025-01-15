import { Button, Fade, IconButton, LinearProgress, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { Check, Delete, FilterAlt, FilterAltOff, Menu as MenuIcon, Photo } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import PopUp from '../../components/popup/PopUp'
import moment from 'moment'
import CreateOrEditShoeWeightDialog from '../../components/dialogs/production/CreateOrEditShoeWeightDialog'
import DeleteProductionItemDialog from '../../components/dialogs/dropdown/DeleteProductionItemDialog'
import ValidateShoeWeightDialog from '../../components/dialogs/production/ValidateShoeWeightDialog'
import { months } from '../../utils/months'
import ViewShoeWeightPhotoDialog from '../../components/dialogs/production/ViewShoeWeightPhotoDialog'
import { UserService } from '../../services/UserServices'
import { ProductionService } from '../../services/ProductionService'
import { DropDownDto } from '../../dtos/DropDownDto'
import { GetShoeWeightDto } from '../../dtos/ProductionDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'


export default function ShoeWeightPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [weight, setWeight] = useState<GetShoeWeightDto>()
  const [weights, setWeights] = useState<GetShoeWeightDto[]>([])
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [userId, setUserId] = useState<string>()
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date()).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
  })
  const { data, isLoading, isSuccess, isRefetching } = useQuery<AxiosResponse<GetShoeWeightDto[]>, BackendError>(["shoe_weights", userId, dates?.start_date, dates?.end_date], async () => new ProductionService().GetShoeWeights({ id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))

  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'shoe_weight_view', show_assigned_only: true }))

  useEffect(() => {
    if (isUsersSuccess)
      setUsers(usersData?.data)
  }, [users, isUsersSuccess, usersData])



  useEffect(() => {
    if (data && isSuccess) {
      setWeights(data.data)

    }
  }, [data, isSuccess])


  const columns = useMemo<MRT_ColumnDef<GetShoeWeightDto>[]>(
    () => weights && [
      {
        accessorKey: 'actions', enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        header: 'Actions',


        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>

              <>
                {LoggedInUser?.assigned_permissions.includes('shoe_weight_edit') && <>
                  <IconButton color="info"
                    onClick={() => {
                      setDialog('CreateOrEditShoeWeightDialog')
                      setWeight(cell.row.original)
                    }}

                  >
                    1
                  </IconButton>
                  <IconButton color="info"
                    onClick={() => {
                      setDialog('CreateOrEditShoeWeightDialog2')
                      setWeight(cell.row.original)
                    }}

                  >
                    2
                  </IconButton>
                  <IconButton color="info"
                    onClick={() => {
                      setDialog('CreateOrEditShoeWeightDialog3')
                      setWeight(cell.row.original)
                    }}

                  >
                    3
                  </IconButton>
                </>}
                {LoggedInUser?.assigned_permissions.includes('shoe_weight_edit') && <Tooltip title="validate">
                  <IconButton color="error"
                    onClick={() => {
                      setDialog('ValidateShoeWeightDialog')
                      setWeight(cell.row.original)
                    }}
                  >
                    <Check />
                  </IconButton>
                </Tooltip>}
                {LoggedInUser?.role == "admin" && LoggedInUser?.assigned_permissions.includes('shoe_weight_delete') && <Tooltip title="delete">
                  <IconButton color="error"

                    onClick={() => {
                      setDialog('DeleteProductionItemDialog')
                      setWeight(cell.row.original)
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>}
              </>


            </Stack>}
        />
      },

      {
        accessorKey: 'shoe_photo1',
        header: 'Photos',
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,

        Cell: (cell) => <>
          {cell.row.original.shoe_photo1 && <Photo onClick={() => {
            setWeight(cell.row.original)
            setDialog('ViewShoeWeightPhotoDialog')
          }} sx={{ height: 15, width: 15, color: 'grey', cursor: 'pointer' }} />
          }
          {cell.row.original.shoe_photo2 && <Photo onClick={() => {
            setWeight(cell.row.original)
            setDialog('ViewShoeWeightPhotoDialog2')
          }} sx={{ height: 15, width: 15, color: 'grey', cursor: 'pointer' }} />
          }
          {cell.row.original.shoe_photo3 && <Photo onClick={() => {
            setWeight(cell.row.original)
            setDialog('ViewShoeWeightPhotoDialog3')
          }} sx={{ height: 15, width: 15, color: 'grey', cursor: 'pointer' }} />
          }
        </>
      },
      {
        accessorKey: 'machine.label',
        header: 'Machine',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.machine.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.machine.label.toString() || ""}</>,
      },
      {
        accessorKey: 'month',
        header: 'Clock In',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{months.find(x => x.month == cell.row.original.month) && months.find(x => x.month == cell.row.original.month)?.label}</>
      },

      {
        accessorKey: 'dye.label',
        header: 'Dye',

        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.dye.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.dye.label.toString() || ""}</>,
        filterSelectOptions: weights && weights.map((i) => {
          return i.dye.label.toString() || "";
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'article.label',
        header: 'Article',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.article.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.article.label.toString() || ""}</>,

      },
      {
        accessorKey: 'size',
        header: 'Size',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.size || "" })} />,
        Cell: (cell) => <>{cell.row.original.size.toString() || ""}</>
      },
      {
        accessorKey: 'std_weigtht',
        header: 'Std Sole Weight',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{cell.row.original.std_weigtht.toString() || ""}</>
      },
      {
        accessorKey: 'upper_weight1',
        header: 'Upper Weight1',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{cell.row.original.upper_weight1.toString() || ""}</>
      },
      {
        accessorKey: 'shoe_weight1',
        header: 'Shoe Weight1',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{cell.row.original.shoe_weight1.toString() || ""}</>
      },
      {
        accessorKey: 'weighttime1',
        header: 'Weight Time1',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.weighttime1 || "" })} />,
        Cell: (cell) => <>{cell.row.original.weighttime1.toString() || ""}</>
      },
      {
        accessorKey: 'upper_weight2',
        header: 'Upper Weight2',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{cell.row.original.upper_weight2 && cell.row.original.upper_weight2.toString() || ""}</>
      },
      {
        accessorKey: 'shoe_weight2',
        header: 'Shoe Weight2',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{cell.row.original.shoe_weight2 && cell.row.original.shoe_weight2.toString() || ""}</>
      },
      {
        accessorKey: 'weighttime2',
        header: 'Weight Time2',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.weighttime2 || "" })} />,
        Cell: (cell) => <>{cell.row.original.weighttime2 && cell.row.original.weighttime2.toString() || ""}</>
      },
      {
        accessorKey: 'upper_weight3',
        header: 'Upper Weight3',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{cell.row.original.upper_weight3 && cell.row.original.upper_weight3.toString() || ""}</>
      },
      {
        accessorKey: 'shoe_weight3',
        header: 'Shoe Weight3',
        aggregationFn: 'sum',
        filterVariant: 'range',
        filterFn: 'betweenInclusive',
        Cell: (cell) => <>{cell.row.original.shoe_weight3 && cell.row.original.shoe_weight3.toString() || ""}</>
      },
      {
        accessorKey: 'weighttime3',
        header: 'Weight Time3',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.weighttime3 || "" })} />,
        Cell: (cell) => <>{cell.row.original.weighttime3 && cell.row.original.weighttime3.toString() || ""}</>
      }, {
        accessorKey: 'created_at',
        header: 'Created At',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.created_at || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_at || ""}</>
      },
      {
        accessorKey: 'created_by',
        header: 'Creator',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={weights.map((item) => { return item.created_by.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_by.label.toString() || "" ? cell.row.original.created_by.label.toString() || "" : ""}</>,

      },
    ],
    [weights],
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: weights, //10,000 rows       
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
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);
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
      {
        isLoading || isRefetching && <LinearProgress color='secondary' />
      }
      <Stack
        spacing={2}
        p={1}
        direction="row"
        sx={{ width: '100%' }}
        justifyContent="space-between"

      >
        <Typography
          variant={'h6'}
          component={'h1'}
          sx={{ pl: 1 }}

        >
          Shoe Weights
        </Typography>
        {/* filter dates and person */}
        <Stack direction="row" gap={2} justifyContent={'end'}>
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
            size="small"
            type="date"
            id="end_date"
            label="End Date"
            value={dates.end_date}
            fullWidth
            onChange={(e) => {
              if (e.currentTarget.value) {
                setDates({
                  ...dates,
                  end_date: moment(e.target.value).format("YYYY-MM-DD")
                })
              }
            }}
          />
          {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 && < TextField
            size="small"
            select
            SelectProps={{
              native: true,
            }}
            onChange={(e) => {
              setUserId(e.target.value)
            }}
            required
            id="weight_owner"
            label="Person"
            fullWidth
          >
            <option key={'00'} value={undefined}>

            </option>
            {
              users.map((user, index) => {

                return (<option key={index} value={user.id}>
                  {user.label}
                </option>)

              })
            }
          </TextField>}
          <Button size="small" color="inherit" variant='contained'
            onClick={() => {
              if (table.getState().showColumnFilters)
                table.resetColumnFilters(true)
              table.setShowColumnFilters(!table.getState().showColumnFilters)
            }
            }
          >
            {table.getState().showColumnFilters ? <FilterAltOff /> : <FilterAlt />}
          </Button>

          <Button size="small" color="inherit" variant='contained'
            onClick={(e) => setAnchorEl(e.currentTarget)
            }
          >
            <MenuIcon />
          </Button>
        </Stack>
      </Stack >
      <>
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
          {LoggedInUser?.assigned_permissions.includes('shoe_weight_create') && <MenuItem
            onClick={() => {
              setDialog('CreateOrEditShoeWeightDialog')
              setWeight(undefined);
              setAnchorEl(null)
            }}


          > Add New</MenuItem>}

          {LoggedInUser?.assigned_permissions.includes('shoe_weight_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export All</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('shoe_weight_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export Selected</MenuItem>}

        </Menu >
        <CreateOrEditShoeWeightDialog dialog={dialog} setDialog={setDialog} shoe_weight={weight} />
      </>
      {
        weight ?
          <>

            <DeleteProductionItemDialog dialog={dialog} setDialog={setDialog} weight={weight} />
            <ViewShoeWeightPhotoDialog dialog={dialog} setDialog={setDialog} weight={weight} />
            <ValidateShoeWeightDialog dialog={dialog} setDialog={setDialog} weight={weight} />
          </>
          : null
      }
      <MaterialReactTable table={table} />

    </>

  )

}