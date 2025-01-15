import { Delete, Edit, FilterAlt, FilterAltOff, Recycling, Search, Upload, Visibility } from '@mui/icons-material'
import { Button, Fade, IconButton, InputAdornment, LinearProgress, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext.tsx'
import DBPagination from '../../components/pagination/DBpagination.tsx';
import { BackendError } from '../../index'
import { Menu as MenuIcon } from '@mui/icons-material';
import CreateOrEditReferDialog from '../../components/dialogs/crm/CreateOrEditReferDialog.tsx'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import PopUp from '../../components/popup/PopUp.tsx'
import { onlyUnique } from '../../utils/UniqueArray.ts'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog.tsx'
import AllReferralPageDialog from '../../components/dialogs/crm/AllReferralPageDialog.tsx'
import ViewReferRemarksDialog from '../../components/dialogs/crm/ViewReferRemarksDialog.tsx'
import CreateOrEditBillDialog from '../../components/dialogs/crm/CreateOrEditBillDialog.tsx'
import ViewRefersBillHistoryDialog from '../../components/dialogs/crm/ViewRefersBillHistoryDialog.tsx'
import MergeTwoRefersDialog from '../../components/dialogs/crm/MergeTwoRefersDialog.tsx'
import ExportToExcel from '../../utils/ExportToExcel.tsx'
import ToogleReferConversionDialog from '../../components/dialogs/crm/ToogleReferConversionDialog.tsx.tsx'

import { ReferExcelButtons } from '../../components/buttons/ReferExcelButtons.tsx'
import { CrmService } from '../../services/CrmService.ts'
import { GetReferDto } from '../../dtos/CrmDto.ts'


export default function RefersPage() {
  const [filter, setFilter] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [refer, setRefer] = useState<GetReferDto>()
  const [refers, setRefers] = useState<GetReferDto[]>([])

  const isFirstRender = useRef(true);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const [preFilteredData, setPreFilteredData] = useState<GetReferDto[]>([])
  const [filterCount, setFilterCount] = useState(0)
  const { data, isLoading, refetch, isRefetching } = useQuery<AxiosResponse<
     GetReferDto[]>, BackendError>(["refers"], async () => new CrmService().GetPaginatedRefers())


  const { data: fuzzyrefers, isLoading: isFuzzyLoading, refetch: refetchFuzzy, isFetching: isFuzzyRefetching } = useQuery<AxiosResponse<GetReferDto[]>, BackendError>(["fuzzyrefers", filter], async () => new CrmService().FuzzySearchRefers({ searchString: filter }), {
    enabled: false
  })

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  useEffect(() => {
    if (!filter) {
      setRefers(preFilteredData)
    }
  }, [filter])

  useEffect(() => {
    if (filter) {
      refetchFuzzy()
    }
  }, [filter])

  useEffect(() => {
    if (data && !filter) {
      setRefers(data.data)
      setPreFilteredData(data.data)
    
    }
  }, [data])

  useEffect(() => {
    if (fuzzyrefers && filter) {
      setRefers(fuzzyrefers.data)
      let count = filterCount
      count = filterCount + 1
      setFilterCount(count)
    }
  }, [fuzzyrefers])

  const columns = useMemo<MRT_ColumnDef<GetReferDto>[]>(
    //column definitions...
    () => refers && [
      {
        accessorKey: 'actions', enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        header: 'Actions',

        Footer: <b></b>,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>

              {LoggedInUser?.role == "admin" && LoggedInUser.assigned_permissions.includes('refer_delete') &&
                <Tooltip title="delete">
                  <IconButton color="error"

                    onClick={() => {
                      setDialog('DeleteCrmItemDialog')
                      setRefer(cell.row.original)

                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('create_refer_bills') && <Tooltip title="upload bill">
                <IconButton color="error"

                  onClick={() => {
                    setDialog('CreateOrEditBillDialog')
                    setRefer(cell.row.original)

                  }}
                >
                  <Upload />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('refer_conversion_manual') && <Tooltip title="Convert to Old & New Customer">
                <IconButton color="error"

                  onClick={() => {
                    setDialog('ToogleReferConversionDialog')
                    setRefer(cell.row.original)

                  }}
                >
                  <Recycling />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('view_refer_bills') && <Tooltip title="view bills">
                <IconButton color="primary"

                  onClick={() => {

                    setDialog('ViewRefersBillHistoryDialog')
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('refer_edit') && <Tooltip title="edit">
                <IconButton color="secondary"

                  onClick={() => {

                    setDialog('CreateOrEditReferDialog')
                    setRefer(cell.row.original)
                  }}

                >
                  <Edit />
                </IconButton>
              </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('refer_view') && <Tooltip title="view all referred parties">
                <IconButton color="inherit"

                  onClick={() => {
                    setDialog('AllReferralPageDialog')
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('refer_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {
                    setDialog('ViewReferRemarksDialog')
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}

            </Stack>}
        />
      },

      {
        accessorKey: 'name',
        header: 'Name',

        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'city',
        header: 'City',
        filterVariant: 'multi-select',

        Cell: (cell) => <>{cell.row.original.city ? cell.row.original.city : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.city;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'state',
        header: 'State',
        filterVariant: 'multi-select',

        Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.state;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'mobile',
        header: 'Mobile1',

        Cell: (cell) => <>{cell.row.original.mobile ? cell.row.original.mobile : ""}</>
      }, {
        accessorKey: 'mobile2',
        header: 'Mobile2',

        Cell: (cell) => <>{cell.row.original.mobile2 ? cell.row.original.mobile2 : ""}</>
      }, {
        accessorKey: 'mobile3',
        header: 'Mobile3',

        Cell: (cell) => <>{cell.row.original.mobile3 ? cell.row.original.mobile3 : ""}</>
      },

      {
        accessorKey: 'last_remark',
        header: 'Remark',

        Cell: (cell) => <>{cell.row.original.last_remark ? cell.row.original.last_remark : ""}</>,
      },

      {
        accessorKey: 'refers',
        header: 'Refers',

        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.refers ? cell.row.original.refers.toString() : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.refers.toString();
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'customer_name',
        header: 'Customer Name',

        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.customer_name ? cell.row.original.customer_name : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.customer_name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'gst',
        header: 'GST',

        Cell: (cell) => <>{cell.row.original.gst ? cell.row.original.gst : ""}</>
      },

      {
        accessorKey: 'address',
        header: 'Address',

        Cell: (cell) => <>{cell.row.original.address ? cell.row.original.address : ""}</>
      },

      {
        accessorKey: 'created_at',
        header: 'Created on',

        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
      },

      {
        accessorKey: 'created_by.label',
        header: 'Creator',

        Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
      }
    ],
    [refers],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: refers, //10,000 rows       
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
      density: 'compact', pagination: { pageIndex: 0, pageSize: 500 }
    },
    enableGrouping: true,
    enableRowSelection: true,
    manualPagination: true,
    enablePagination: false,
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
        isFuzzyLoading || isFuzzyRefetching && <LinearProgress color='secondary' />
      }
      {
        isLoading || isRefetching && <LinearProgress color='secondary' />
      }
      <Stack
        sx={{ width: '100%' }}
        p={1}
        direction="row"
        alignItems={'center'}
        justifyContent="space-between">

        <Typography variant="h6">Customers</Typography>
        <TextField
          sx={{ width: '40vw', p: 0 }}
          size='small'
          onChange={(e) => {
            setFilter(e.currentTarget.value)
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ cursor: 'pointer' }} onClick={() => {
                  if (filter)
                    refetchFuzzy()
                }} />
              </InputAdornment>
            ),
          }}
          placeholder={`Search  `}
          style={{
            border: '0',
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              refetchFuzzy()
            }
          }}
        />
        <Stack justifyContent={'right'} direction={'row'} gap={1}>

          {LoggedInUser?.role == "admin" && LoggedInUser?.assigned_permissions.includes('refer_export') && <Tooltip title="Export">
            <ReferExcelButtons />
          </Tooltip>}
          <Button color="inherit" variant='contained'
            onClick={() => {
              if (table.getState().showColumnFilters)
                table.resetColumnFilters(true)
              table.setShowColumnFilters(!table.getState().showColumnFilters)
            }
            }
          >
            {table.getState().showColumnFilters ? <FilterAltOff /> : <FilterAlt />}
          </Button>

          <Button color="inherit" variant='contained'
            onClick={(e) => setAnchorEl(e.currentTarget)
            }
          >
            <MenuIcon />
          </Button>
        </Stack>
      </Stack>
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
        {LoggedInUser?.assigned_permissions.includes('refer_create') && <MenuItem
          onClick={() => {
            setDialog('CreateOrEditReferDialog')
            setRefer(undefined);
            setAnchorEl(null)
          }}

        > Add New</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('refers_merge') && <MenuItem
          onClick={() => {
            if (table.getSelectedRowModel().rows.length == 2) {
              setDialog('MergeTwoRefersDialog')
              setRefer(undefined);
              setAnchorEl(null)
            } else {
              alert("please select two refers only");
              setRefer(undefined);
              setAnchorEl(null)
              return;
            }
          }
          }
        > Merge Refers</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('refer_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('refer_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

        >Export Selected</MenuItem>}
      </Menu>

      <CreateOrEditReferDialog dialog={dialog} setDialog={setDialog} refer={refer} />
      {table.getSelectedRowModel().rows.length == 2 && <MergeTwoRefersDialog dialog={dialog} setDialog={setDialog} refers={table.getSelectedRowModel().rows.map((l) => { return l.original })} removeSelectedRefers={() => { table.resetRowSelection() }} />}
      <>

        {
          refer ?
            <>

              <DeleteCrmItemDialog dialog={dialog} setDialog={setDialog} refer={refer ? { id: refer._id, label: refer.name } : undefined} />
              <AllReferralPageDialog dialog={dialog} setDialog={setDialog} refer={refer} />
              <ViewReferRemarksDialog dialog={dialog} setDialog={setDialog} id={refer._id} />
              <CreateOrEditBillDialog dialog={dialog} setDialog={setDialog} refer={refer} bill={undefined} />
              <ViewRefersBillHistoryDialog dialog={dialog} setDialog={setDialog} id={refer._id} />
              <ToogleReferConversionDialog dialog={dialog} setDialog={setDialog} refer={refer} />
            </>
            : null
        }
      </>
      <MaterialReactTable table={table} />
    </>

  )

}

