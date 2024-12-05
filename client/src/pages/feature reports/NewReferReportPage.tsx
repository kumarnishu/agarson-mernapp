import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import moment from 'moment'
import { GetNewRefers } from '../../services/LeadsServices'
import CreateOrEditReferDialog from '../../components/dialogs/crm/CreateOrEditReferDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import AllReferralPageDialog from '../../components/dialogs/crm/AllReferralPageDialog'
import ViewReferRemarksDialog from '../../components/dialogs/crm/ViewReferRemarksDialog'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import { Delete, Edit, Recycling, Upload, Visibility } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import CreateOrEditBillDialog from '../../components/dialogs/crm/CreateOrEditBillDialog'
import ViewRefersBillHistoryDialog from '../../components/dialogs/crm/ViewRefersBillHistoryDialog'
import ToogleReferConversionDialog from '../../components/dialogs/crm/ToogleReferConversionDialog.tsx'
import { GetReferDto } from '../../dtos/refer.dto.ts'



export default function NewReferReportPage() {
  const [refer, setRefer] = useState<GetReferDto>()
  const [refers, setRefers] = useState<GetReferDto[]>([])
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date(new Date().setDate(1)).setFullYear(2023)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(30)).format("YYYY-MM-DD")
  })
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetReferDto[]>, BackendError>(["new_refer_reports", dates.start_date, dates.end_date], async () => GetNewRefers({ start_date: dates.start_date, end_date: dates.end_date }))


  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetReferDto>[]>(
    //column definitions...
    () => refers && [
      {
        accessorKey: 'actions',
        header: '',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('create_refer_bills') && <Tooltip title="upload bill">
                <IconButton color="error"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.create_or_edit_bill })
                    setRefer(cell.row.original)

                  }}
                >
                  <Upload />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('view_refer_bills') && <Tooltip title="view bills">
                <IconButton color="primary"

                  onClick={() => {

                    setChoice({ type: LeadChoiceActions.view_bills })
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('refer_conversion_manual') && cell.row.original.convertedfromlead && <Tooltip title="Convert to Old ">
                <IconButton color="error"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.toogle_refer })
                    setRefer(cell.row.original)

                  }}
                >
                  <Recycling />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('newrefer_delete') &&
                <Tooltip title="delete">
                  <IconButton color="error"

                    onClick={() => {
                      setChoice({ type: LeadChoiceActions.delete_crm_item })
                      setRefer(cell.row.original)

                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              }
              {LoggedInUser?.assigned_permissions.includes('newrefer_edit') && <Tooltip title="edit">
                <IconButton color="secondary"

                  onClick={() => {

                    setChoice({ type: LeadChoiceActions.create_or_edit_refer })
                    setRefer(cell.row.original)
                  }}

                >
                  <Edit />
                </IconButton>
              </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('newrefer_view') && <Tooltip title="view all refer reports">
                <IconButton color="inherit"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.view_referrals })
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('newrefer_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.view_refer_remarks })
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
        accessorKey: 'uploaded_bills',
        header: 'Uploaded Bills',

        Cell: (cell) => <>{cell.row.original.uploaded_bills ? cell.row.original.uploaded_bills : ""}</>
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
    [refers, data],
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
    if (isSuccess && data) {
      setRefers(data.data);
    }
  }, [isSuccess, data]);
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
          New Customers : {refers && refers.length}
        </Typography>
        <Stack direction="row" gap={2}>
          < TextField
            size="small"
            type="date"
            id="start_date"
            label="Start Date"
            fullWidth
            value={dates.start_date}
            focused
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
            focused
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
        </Stack>
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
            {LoggedInUser?.assigned_permissions.includes('newrefer_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('newrefer_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditReferDialog refer={refer} />
          <>
            {
              refer ?
                <>

                  <DeleteCrmItemDialog refer={refer ? { id: refer._id, label: refer.name } : undefined} />
                  <AllReferralPageDialog refer={refer} />
                  <ViewReferRemarksDialog id={refer._id} />
                  <CreateOrEditBillDialog refer={refer} bill={undefined} />
                  <ViewRefersBillHistoryDialog id={refer._id} />
                  <ToogleReferConversionDialog refer={refer} />
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

