import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, Fade, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit, FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { queryClient } from '../../main'
import { PaymentsExcelButtons } from '../../components/buttons/PaymentsExcelButtons'
import AssignPaymentsDialog from '../../components/dialogs/payments/AssignPaymentsDialog'
import BulkDeletePaymentsDialog from '../../components/dialogs/payments/BulkDeletePaymentsDialog'
import { GetPaymentDto, GetPaymentsFromExcelDto } from '../../dtos/payment.dto'
import { DropDownDto } from '../../dtos/dropdown.dto'

import { UserService } from '../../services/UserServices'
import { PaymentsService } from '../../services/PaymentsService'


function PaymentsPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [payment, setPayment] = useState<GetPaymentDto>()
  const [payments, setPayments] = useState<GetPaymentDto[]>([])
  const [paginationData, setPaginationData] = useState({ limit: 1000, page: 1, total: 1 });
  const [flag, setFlag] = useState(1);
  const [stage, setStage] = useState('all')
  const [categoriesData, setCategoriesData] = useState<{ category: string, count: number }[]>([])
  const [userId, setUserId] = useState<string>()
  const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<{ category: string, count: number }[]>, BackendError>("payments", new PaymentsService().GetPaymentsTopBarDetails)
  const [dialog, setDialog] = useState<string | undefined>()
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'payments_view', show_assigned_only: false }))


  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const { data, isSuccess, isLoading, refetch } = useQuery<AxiosResponse<{ result: GetPaymentDto[], page: number, total: number, limit: number }>, BackendError>(["payments", userId, stage], async () => new PaymentsService().GetPaymentss({ limit: paginationData?.limit, page: paginationData?.page, id: userId, stage: stage }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { mutate: changedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, next_date: string }>
    (new PaymentsService().ChangePaymentsNextDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('payments')
      }
    })
  const { mutate: changeDuedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, due_date: string }>
    (new PaymentsService().ChangePaymentsDueDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('payments')
      }
    })


  const columns = useMemo<MRT_ColumnDef<GetPaymentDto>[]>(
    //column definitions...
    () => payments && [
      {
        accessorKey: 'actions',
        header: '',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('payments_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {

                    setPayment(cell.row.original)


                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('payments_edit') &&
                <Tooltip title="Edit">
                  <IconButton

                    onClick={() => {

                      setPayment(cell.row.original)

                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },
      {
        accessorKey: 'payment_title',
        header: ' Payment Title',

        Cell: (cell) => <>{!cell.row.original.link ? <Tooltip title={cell.row.original.payment_description}><span>{cell.row.original.payment_title ? cell.row.original.payment_title : ""}</span></Tooltip> :
          <Tooltip title={cell.row.original.payment_description}>
            <a style={{ fontSize: 11, fontWeight: 'bold', textDecoration: 'none' }} target='blank' href={cell.row.original.link}>{cell.row.original.payment_title}</a>
          </Tooltip>}
        </>
      },

      {
        accessorKey: 'assigned_users.value',
        header: 'Responsible',

        filter: 'custom',
        enableColumnFilter: true,
        Cell: (cell) => <>{cell.row.original.assigned_users.map((user) => { return user.label }).toString() || ""}</>,
        filterFn: (row, columnId, filterValue) => {
          console.log(columnId)
          if (!Array.isArray(row.original.assigned_users)) return false;
          return row.original.assigned_users.some((user) =>
            user.label.toLowerCase().includes(filterValue.toLowerCase())
          );
        },
      },
      {
        accessorKey: 'category.label',
        header: ' Category',

        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.label : ""}</>
      },
      {
        accessorKey: 'frequency',
        header: ' Frequency',

        Cell: (cell) => <>{cell.row.original.frequency ? cell.row.original.frequency : ""}</>
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date',

        Cell: (cell) => <>
          < input
            type="date"
            id="remind_date"
            disabled={!LoggedInUser?.assigned_permissions.includes('payments_edit')}
            value={moment(new Date(cell.row.original.due_date)).format("YYYY-MM-DD")}
            onChange={(e) => {
              if (e.target.value) {
                changeDuedate({ id: cell.row.original._id, due_date: e.target.value })
              }
            }}
          />

        </>
      },
      {
        accessorKey: 'next_date',
        header: 'Next Check Date',

        Cell: (cell) => <>
          < input
            type="date"
            id="remind_date"
            disabled={!LoggedInUser?.assigned_permissions.includes('payments_edit')}
            value={moment(new Date(cell.row.original.next_date)).format("YYYY-MM-DD")}
            onChange={(e) => {
              if (e.target.value) {
                changedate({ id: cell.row.original._id, next_date: e.target.value })
              }
            }}
          />

        </>
      },
      {
        accessorKey: 'updated_by',
        header: 'Last Updated By',

        Cell: (cell) => <>{cell.row.original.updated_by ? cell.row.original.updated_by.label : ""}</>
      },
    ],
    [payments, data],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: payments, //10,000 rows       
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
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
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
        border: '1px solid lightgrey;',
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => (

      <Stack
        sx={{ width: '100%' }}
        pt={1}
        direction="row"
        alignItems={'center'}
        justifyContent="space-between">
        <Stack direction={'row'} gap={1} sx={{ maxWidth: '70vw', background: 'whitesmoke', p: 1, borderRadius: 5 }} className='scrollable-stack'>
          {categoriesData.map((category, index) => (
            <Stack style={{ minWidth: '100px', overflowY: 'hidden' }}
              key={index}
            >
              <span key={category.category} style={{ paddingLeft: '5px', fontSize: '13px' }}> {category.count} : {toTitleCase(category.category)} </span>
            </Stack>
          ))}
        </Stack>
        <Stack justifyContent={'right'} direction={'row'} gap={1}>
          <Tooltip title="Toogle Filter">
            <Button size="small" color="inherit" variant='contained'
              onClick={() => {
                table.resetColumnFilters(true)
              }
              }
            >
              <FilterAltOff />
            </Button>
          </Tooltip>
          <Tooltip title="Toogle FullScreen">
            <Button size="small" color="inherit" variant='contained'
              onClick={() => table.setIsFullScreen(!table.getState().isFullScreen)
              }
            >
              {table.getState().isFullScreen ? <FullscreenExit /> : <Fullscreen />}
            </Button>
          </Tooltip>
          <Tooltip title="Menu">
            <Button size="small" color="inherit" variant='contained'
              onClick={(e) => setAnchorEl(e.currentTarget)
              }
            >
              <MenuIcon />
              <Typography pl={1}> Menu</Typography>
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
    ),
    renderBottomToolbarCustomActions: () => (
      <DBPagination paginationData={paginationData} refetch={refetch} setPaginationData={setPaginationData} />

    ),
    muiTableBodyCellProps: () => ({
      sx: {
        border: '1px solid lightgrey;',
      },
    }),
    positionToolbarAlertBanner: 'none',
    enableToolbarInternalActions: false,
    initialState: { density: 'compact' },
    enableRowSelection: true,
    enableRowNumbers: true,
    enableColumnPinning: true,
    onSortingChange: setSorting,
    enableTableFooter: true,
    enableRowVirtualization: true,
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //optional

    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    },
    enableBottomToolbar: true,
    enableGlobalFilter: false,
    enablePagination: false,
    manualPagination: true
  });

  useEffect(() => {
    if (categorySuccess && categorydata)
      setCategoriesData(categorydata.data)
  }, [categorySuccess])

  useEffect(() => {
    if (isUsersSuccess)
      setUsers(usersData?.data)
  }, [users, isUsersSuccess, usersData])

  useEffect(() => {
    if (data && isSuccess) {
      setPayments(data.data.result)
      setPaginationData({
        ...paginationData,
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total
      })
    }
  }, [isSuccess, data])

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
  console.log(payment)
  return (
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

        {LoggedInUser?.assigned_permissions.includes('payments_create') && <MenuItem

          onClick={() => {
            setPayment(undefined)
            setAnchorEl(null)
          }}
        > Add New</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_edit') && <MenuItem

          onClick={() => {
            if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
              alert("select some payments")
            }
            else {
              setDialog('AssignPaymentsDialog')
              setPayment(undefined)
              setFlag(1)
            }
            setAnchorEl(null)
          }}
        > Assign Users</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_edit') && <MenuItem

          onClick={() => {
            if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
              alert("select some payments")
            }
            else {
              setDialog('AssignPaymentsDialog')
              setPayment(undefined)
              setFlag(0)
            }
            setAnchorEl(null)
          }}
        > Remove Users</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_export') && < MenuItem onClick={() => {

          let data: GetPaymentsFromExcelDto[] = []
          data = table.getRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              payment_title: row.original.payment_title,
              payment_description: row.original.payment_description,
              category: row.original.category.label,
              duedate: row.original.due_date,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.label }).toString(),
              status: ""
            }
          })
          ExportToExcel(data, "payments Data")
        }
        }
        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('payments_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data: GetPaymentsFromExcelDto[] = []
          data = table.getSelectedRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              payment_title: row.original.payment_title,
              payment_description: row.original.payment_description,
              category: row.original.category.label,
              duedate: row.original.due_date,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.label }).toString(),
              status: ""
            }
          }
          )
          ExportToExcel(data, "payments Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>
      <Stack sx={{ p: 2 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant='h6'>Payments</Typography>
        <Stack direction='row' gap={2}>
          {LoggedInUser?._id === LoggedInUser?.created_by.id && LoggedInUser?.assigned_permissions.includes('payments_delete') && <Tooltip title="Delete Selected">
            <Button variant='contained' color='error'

              onClick={() => {
                let data: any[] = [];
                data = table.getSelectedRowModel().rows
                if (data.length == 0)
                  alert("select some payments")
                else
                  setDialog('BulkDeletePaymentsDialog')
              }}
            >
              <Delete />
            </Button>
          </Tooltip>}

          {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 &&
            < TextField
              select
              size="small"
              SelectProps={{
                native: true,
              }}
              onChange={(e) => {
                setStage(e.target.value)
              }}
              focused
              required
              id="Stage"
              label="payment Stage"
              fullWidth
            >
              {
                ['all', 'completed', 'pending'].map((st, index) => {

                  return (<option key={index} value={st}>
                    {toTitleCase(st)}
                  </option>)
                })
              }
            </TextField>}

          {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 &&
            < TextField
              select

              size="small"
              SelectProps={{
                native: true,
              }}
              onChange={(e) => {
                setUserId(e.target.value)
              }}
              focused
              required
              id="payment_owners"
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

          {LoggedInUser?.assigned_permissions.includes('payments_create') && <PaymentsExcelButtons />}
        </Stack>
      </Stack>
      <MaterialReactTable table={table} />
      {/* <CreateOrEditCheckListDialog payment={payment} setPayment={setPayment} />
      {payment && <DeleteCheckListDialog payment={payment} />}
      {payment && <CreateOrEditCheckListDialog payment={payment} setPayment={setPayment} />}
      {payment && paymentBox && <ViewpaymentRemarksDialog payment={payment} payment_box={paymentBox} />} */}

      {<AssignPaymentsDialog dialog={dialog} setDialog={setDialog} flag={flag} payments={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
      {table.getSelectedRowModel().rows && table.getSelectedRowModel().rows.length > 0 && <BulkDeletePaymentsDialog dialog={dialog} setDialog={setDialog} ids={table.getSelectedRowModel().rows.map((l) => { return l.original._id })} clearIds={() => { table.resetRowSelection() }} />}

    </>
  )
}

export default PaymentsPage