import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit, FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import { DownloadFile } from '../../utils/DownloadFile'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { ChangeChecklistNextDate, GetChecklistReports, GetChecklistTopBarDetails } from '../../services/CheckListServices'
import DeleteCheckListDialog from '../../components/dialogs/checklists/DeleteCheckListDialog'
import CreateOrEditCheckListDialog from '../../components/dialogs/checklists/CreateOrEditCheckListDialog'
import { queryClient } from '../../main'
import { currentYear, getNextMonday, nextMonth } from '../../utils/datesHelper'
import { ChecklistExcelButtons } from '../../components/buttons/ChecklistExcelButtons'
import AssignChecklistsDialog from '../../components/dialogs/checklists/AssignChecklistsDialog'
import BulkDeleteCheckListDialog from '../../components/dialogs/checklists/BulkDeleteCheckListDialog'
import ViewChecklistBoxRemarksDialog from '../../components/dialogs/checklists/ViewChecklistBoxRemarksDialog'
import ViewChecklistRemarksDialog from '../../components/dialogs/checklists/ViewChecklistRemarksDialog'
import { GetChecklistBoxDto } from '../../dtos/checklist-box.dto'
import { GetChecklistDto, GetChecklistFromExcelDto } from '../../dtos/checklist.dto'
import { GetUsersForDropdown } from '../../services/UserServices'
import { DropDownDto } from '../../dtos/dropdown.dto'


function CheckListAdminPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [checklist, setChecklist] = useState<GetChecklistDto>()
  const [checklists, setChecklists] = useState<GetChecklistDto[]>([])
  const [paginationData, setPaginationData] = useState({ limit: 1000, page: 1, total: 1 });
  const [flag, setFlag] = useState(1);
  const [stage, setStage] = useState('open')
  const [checklistBox, setChecklistBox] = useState<GetChecklistBoxDto>()
  const [categoriesData, setCategoriesData] = useState<{ category: string, count: number }[]>([])
  const [userId, setUserId] = useState<string>('all')
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date().setDate(new Date().getDate() - 4)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(new Date().getDate() + 2)).format("YYYY-MM-DD")
  })

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<{ category: string, count: number }[]>, BackendError>("checklists", GetChecklistTopBarDetails)
  const [dialog, setDialog] = useState<string | undefined>()
  let previous_date = new Date()
  let day = previous_date.getDate() - 3
  previous_date.setDate(day)
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("users", async () => GetUsersForDropdown({ hidden: false, permission: 'checklist_view', show_assigned_only: false }))
  const { data, isLoading, refetch } = useQuery<AxiosResponse<{ result: GetChecklistDto[], page: number, total: number, limit: number }>, BackendError>(["checklists", userId, dates?.start_date, dates?.end_date, stage], async () => GetChecklistReports({ limit: paginationData?.limit, page: paginationData?.page, id: userId, start_date: dates?.start_date, end_date: dates?.end_date, stage: stage }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { mutate: changedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, next_date: string }>
    (ChangeChecklistNextDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('checklists')
      }
    })



  const columns = useMemo<MRT_ColumnDef<GetChecklistDto>[]>(
    //column definitions...
    () => checklists && [
      {
        accessorKey: 'actions',
        header: '',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('checklist_admin_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {
                    setDialog('DeleteCheckListDialog')
                    setChecklist(cell.row.original)
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('checklist_admin_edit') &&
                <Tooltip title="Edit">
                  <IconButton

                    onClick={() => {

                      setDialog('CreateOrEditCheckListDialog')
                      setChecklist(cell.row.original)

                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },
      {
        accessorKey: 'serial_no',
        header: ' No',

      },
      {
        accessorKey: 'last_checked_box',
        header: 'Stage',

        Cell: (cell) => <Tooltip title={cell.row.original.last_checked_box ? cell.row.original.last_checked_box.last_remark : ""}>
          <Button onClick={() => {
            setChecklist(cell.row.original)
            setDialog('ViewChecklistRemarksDialog')
          }} size="small" sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0, p: 0.5 }} color={cell.row.original.last_checked_box?.stage != 'done' ? (cell.row.original.last_checked_box?.stage == 'pending' ? "warning" : 'error') : 'success'} variant='contained'>{cell.row.original.last_checked_box ? toTitleCase(cell.row.original.last_checked_box.stage) : "Open"}</Button>
        </Tooltip>
      },
      {
        accessorKey: 'work_title',
        header: ' Work Title',

        Cell: (cell) => <span title={cell.row.original.work_description} >
          {cell.row.original.link && cell.row.original.link != "" ?
            <a style={{ fontSize: 11, fontWeight: '400', textDecoration: 'none' }} target='blank' href={cell.row.original.link}>{cell.row.original.work_title}</a>
            :
            <span style={{ fontSize: 11, fontWeight: '400', textDecoration: 'none' }}>
              {cell.row.original.work_title}
            </span>
          }
        </span>
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
        accessorKey: 'last_10_boxes',
        header: 'Filtered Dates',

        Cell: (cell) => <>
          {userId == "all" ?
            <Stack direction="row" className="scrollable-stack" sx={{ height: '20px' }}>
              {cell.row.original && cell.row.original.last_10_boxes.map((b) => (
                <>
                  {
                    cell.row.original.frequency == 'daily' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                        onClick={() => {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) > new Date()}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {new Date(b.date).getDate()}
                      </Button>
                    </Tooltip>
                  }
                  {
                    cell.row.original.frequency == 'weekly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                        onClick={() => {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= new Date(getNextMonday())}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {new Date(b.date).getDate()}
                      </Button>
                    </Tooltip>
                  }
                  {
                    cell.row.original.frequency == 'monthly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3 }}
                        onClick={() => {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')

                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= nextMonth}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {monthNames[new Date(b.date).getMonth()]}
                      </Button>
                    </Tooltip>
                  }
                  {
                    cell.row.original.frequency == 'yearly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3 }}
                        onClick={() => {
                          console.log(new Date(b.date))
                          console.log(new Date(previous_date))
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) > currentYear}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {new Date(b.date).getFullYear()}
                      </Button>
                    </Tooltip>
                  }
                </>
              ))}
            </Stack>
            :
            <Stack direction="row" className="scrollable-stack" sx={{ height: '20px' }}>
              {cell.row.original && cell.row.original.boxes.map((b) => (
                <>
                  {
                    cell.row.original.frequency == 'daily' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                        onClick={() => {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) > new Date()}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {new Date(b.date).getDate()}
                      </Button>
                    </Tooltip>
                  }
                  {
                    cell.row.original.frequency == 'weekly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                        onClick={() => {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= new Date(getNextMonday())}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {new Date(b.date).getDate()}
                      </Button>
                    </Tooltip>
                  }
                  {
                    cell.row.original.frequency == 'monthly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3 }}
                        onClick={() => {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')

                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= nextMonth}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {monthNames[new Date(b.date).getMonth()]}
                      </Button>
                    </Tooltip>
                  }
                  {
                    cell.row.original.frequency == 'yearly' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                      <Button
                        sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3 }}
                        onClick={() => {
                          console.log(new Date(b.date))
                          console.log(new Date(previous_date))
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setDialog('ViewChecklistBoxRemarksDialog')
                        }}
                        size="small"
                        disabled={new Date(new Date(b.date).setHours(0, 0, 0, 0)) > currentYear}
                        variant="contained"
                        color={b.stage != 'done' ? (b.stage == 'pending' ? "warning" : 'error') : 'success'}
                      >
                        {new Date(b.date).getFullYear()}
                      </Button>
                    </Tooltip>
                  }
                </>
              ))}
            </Stack>
          }
        </>
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
        accessorKey: 'next_date',
        header: 'Next Check Date',

        Cell: (cell) => <>
          < input
            type="date"
            id="remind_date"
            disabled={!LoggedInUser?.assigned_permissions.includes('checklist_edit')}
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
        accessorKey: 'photo',
        header: 'Photo',

        Cell: (cell) => <span onDoubleClick={() => {
          if (cell.row.original.photo && cell.row.original.photo) {
            DownloadFile(cell.row.original.photo, 'photo')
          }
        }}>
          {cell.row.original.photo && cell.row.original.photo ? < img height="20" width="55" src={cell.row.original.photo && cell.row.original.photo} alt="visiting card" /> : "na"}</span>
      },
      {
        accessorKey: 'updated_at',
        header: 'Last Updated At',

        Cell: (cell) => <>{cell.row.original.updated_at ? moment(cell.row.original.updated_at).format("DD/MM/YYYY") : ""}</>
      },
      {
        accessorKey: 'updated_by',
        header: 'Last Updated By',

        Cell: (cell) => <>{cell.row.original.updated_by ? cell.row.original.updated_by.label : ""}</>
      },
    ],
    [checklists, data],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: checklists, //10,000 rows       
    enableColumnResizing: true,
    enableGrouping: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { maxHeight: table.table.getState().isFullScreen ? 'auto' : '64vh' }
    }),
    muiTableHeadCellProps: () => ({
      sx: {
        border: '1px solid lightgrey;',
      }
    }),
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',

      },
    }),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box minWidth={'100vw'} >
        <Stack direction={'row'} gap={1} sx={{ maxWidth: '100vw', height: 40, background: 'whitesmoke', p: 1, borderRadius: 1 }} className='scrollable-stack'>
          {categoriesData.map((category, index) => (
            <Stack style={{ minWidth: '100px', overflowY: 'hidden' }}
              key={index}
            >
              <span key={category.category} style={{ paddingLeft: '5px', fontSize: '13px' }}> {category.count} : {toTitleCase(category.category).slice(0, 10)} </span>
            </Stack>
          ))}
        </Stack>
        <Stack sx={{ p: 1 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant='h6'>Checklists : {checklists.length}</Typography>
          <Stack
            pt={1}
            direction="row"
            alignItems={'center'}
            justifyContent="right">

            <Stack justifyContent={'right'} direction={'row'} gap={1}>
              < TextField
                variant='filled'
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
                variant='filled'
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



              {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 &&
                < TextField
                  variant='filled'
                  select
                  size="small"
                  SelectProps={{
                    native: true,
                  }}
                  onChange={(e) => {
                    setStage(e.target.value)
                  }}
                  value={stage}

                  required
                  id="Stage"
                  label="Checklist Stage"
                  fullWidth
                >
                  {
                    ['all', 'open', 'pending', 'done'].map((st, index) => {

                      return (<option key={index} value={st}>
                        {toTitleCase(st)}
                      </option>)
                    })
                  }
                </TextField>}

              {LoggedInUser?.assigned_users && LoggedInUser?.assigned_users.length > 0 &&
                < TextField
                  variant='filled'
                  select
                  size="small"
                  SelectProps={{
                    native: true,
                  }}
                  onChange={(e) => {
                    setUserId(e.target.value)
                  }}
                  required
                  id="checklist_owners"
                  label="Person"
                  fullWidth
                >
                  <option key={'00'} value={'all'}>All
                  </option>
                  {
                    users.map((user, index) => {

                      return (<option key={index} value={user.id}>
                        {toTitleCase(user.label)}
                      </option>)

                    })
                  }
                </TextField>}
              {LoggedInUser?._id === LoggedInUser?.created_by.id && LoggedInUser?.assigned_permissions.includes('checklist_admin_delete') &&
                <Button variant='contained' color='inherit' size='large'
                  onClick={() => {
                    let data: any[] = [];
                    data = table.getSelectedRowModel().rows
                    if (data.length == 0)
                      alert("select some checklists")
                    else
                      setDialog('BulkDeleteCheckListDialog')
                  }}
                >
                  <Delete sx={{ width: 15, height: 15 }} />
                </Button>}
              {LoggedInUser?.assigned_permissions.includes('checklist_create') && <ChecklistExcelButtons />}
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

              <Tooltip title="Toogle FullScreen" >
                <Button size="small" color="inherit" variant='contained'
                  onClick={() => table.setIsFullScreen(!table.getState().isFullScreen)
                  }
                >
                  {table.getState().isFullScreen ? <FullscreenExit /> : <Fullscreen />}
                </Button>
              </Tooltip>
              <Tooltip title="Menu" sx={{ pl: 1 }}>
                <Button size="small" color="inherit" variant='contained'
                  onClick={(e) => setAnchorEl(e.currentTarget)
                  }
                >
                  <MenuIcon />
                  <Typography pl={1}> {`Menu `}</Typography>
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Box >
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
    if (data) {
      setChecklists(data.data.result)
      setPaginationData({
        ...paginationData,
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total
      })
    }
  }, [data])
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

        {LoggedInUser?.assigned_permissions.includes('checklist_admin_create') && <MenuItem

          onClick={() => {
            setDialog('CreateOrEditCheckListDialog')
            setChecklist(undefined)
            setAnchorEl(null)
          }}
        > Add New</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('checklist_admin_edit') && <MenuItem

          onClick={() => {
            if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
              alert("select some checklists")
            }
            else {
              setDialog('AssignChecklistsDialog')
              setChecklist(undefined)
              setFlag(1)
            }
            setAnchorEl(null)
          }}
        > Assign Users</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('checklist_admin_edit') && <MenuItem

          onClick={() => {
            if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
              alert("select some checklists")
            }
            else {
              setDialog('AssignChecklistsDialog')
              setChecklist(undefined)
              setFlag(0)
            }
            setAnchorEl(null)
          }}
        > Remove Users</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('checklist_admin_export') && < MenuItem onClick={() => {

          let data: GetChecklistFromExcelDto[] = []
          data = table.getRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
              work_title: row.original.work_title,
              work_description: row.original.work_description,
              category: row.original.category.label,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.label }).toString(),
              status: ""
            }
          })
          ExportToExcel(data, "Checklists Data")
        }
        }
        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('checklist_admin_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data: GetChecklistFromExcelDto[] = []
          data = table.getSelectedRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
              work_title: row.original.work_title,
              work_description: row.original.work_description,
              category: row.original.category.label,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.label }).toString(),
              status: ""
            }
          }
          )
          ExportToExcel(data, "Checklists Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>

      <CreateOrEditCheckListDialog dialog={dialog} setDialog={setDialog} checklist={checklist} setChecklist={setChecklist} />
      {checklist && <DeleteCheckListDialog dialog={dialog} setDialog={setDialog} checklist={checklist} />}
      {checklist && <CreateOrEditCheckListDialog dialog={dialog} setDialog={setDialog} checklist={checklist} setChecklist={setChecklist} />}
      {checklist && checklistBox && <ViewChecklistBoxRemarksDialog dialog={dialog} setDialog={setDialog} checklist={checklist} checklist_box={checklistBox} />}
      {checklist && <ViewChecklistRemarksDialog dialog={dialog} setDialog={setDialog} checklist={checklist} />}
      <MaterialReactTable table={table} />
      {<AssignChecklistsDialog dialog={dialog} setDialog={setDialog} flag={flag} checklists={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
      {table.getSelectedRowModel().rows && table.getSelectedRowModel().rows.length > 0 && <BulkDeleteCheckListDialog dialog={dialog} setDialog={setDialog} ids={table.getSelectedRowModel().rows.map((l) => { return l.original._id })} clearIds={() => { table.resetRowSelection() }} />}
    </>
  )
}

export default CheckListAdminPage