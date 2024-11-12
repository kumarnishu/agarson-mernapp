import { useContext, useEffect, useMemo, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, Fade, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { GetUsers } from '../../services/UserServices'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { GetChecklistFromExcelDto, GetUserDto } from '../../dtos'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { CheckListChoiceActions, ChoiceContext } from '../../contexts/dialogContext'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit, FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import { DownloadFile } from '../../utils/DownloadFile'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { ChangeChecklistNextDate, GetChecklistReports, GetChecklistTopBarDetails } from '../../services/CheckListServices'
import { GetChecklistBoxDto, GetChecklistDto } from '../../dtos'
import DeleteCheckListDialog from '../../components/dialogs/checklists/DeleteCheckListDialog'
import CreateOrEditCheckListDialog from '../../components/dialogs/checklists/CreateOrEditCheckListDialog'
import ViewChecklistRemarksDialog from '../../components/dialogs/checklists/ViewChecklistRemarksDialog'
import { queryClient } from '../../main'
import { currentYear, getNextMonday, nextMonth } from '../../utils/datesHelper'
import { ChecklistExcelButtons } from '../../components/buttons/ChecklistExcelButtons'
import AssignChecklistsDialog from '../../components/dialogs/checklists/AssignChecklistsDialog'
import BulkDeleteCheckListDialog from '../../components/dialogs/checklists/BulkDeleteCheckListDialog'


function CheckListAdminPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<GetUserDto[]>([])
  const [checklist, setChecklist] = useState<GetChecklistDto>()
  const [checklists, setChecklists] = useState<GetChecklistDto[]>([])
  const [paginationData, setPaginationData] = useState({ limit: 1000, page: 1, total: 1 });
  const [flag, setFlag] = useState(1);
  const [stage, setStage] = useState('all')
  const [checklistBox, setChecklistBox] = useState<GetChecklistBoxDto>()
  const [categoriesData, setCategoriesData] = useState<{ category: string, count: number }[]>([])
  const [userId, setUserId] = useState<string>()
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date().setDate(new Date().getDate() - 6)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(new Date().getDate() + 4)).format("YYYY-MM-DD")
  })
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<{ category: string, count: number }[]>, BackendError>("checklists", GetChecklistTopBarDetails)
  const { setChoice } = useContext(ChoiceContext)
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  let previous_date = new Date()
  let day = previous_date.getDate() - 3
  previous_date.setDate(day)
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'checklist_view', show_assigned_only: false }))
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
        maxSize: 50,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('checklist_admin_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {

                    setChoice({ type: CheckListChoiceActions.delete_checklist })
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

                      setChoice({ type: CheckListChoiceActions.create_or_edit_checklist })
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
        accessorKey: 'work_title',
        header: ' Work Title',
        size: 300,
        Cell: (cell) => <>{!cell.row.original.link ? <Tooltip title={cell.row.original.work_description}><span>{cell.row.original.work_title ? cell.row.original.work_title : ""}</span></Tooltip> :
          <Tooltip title={cell.row.original.work_description}>
            <a style={{ fontSize: 11, fontWeight: 'bold', textDecoration: 'none' }} target='blank' href={cell.row.original.link}>{cell.row.original.work_title}</a>
          </Tooltip>}
        </>
      },
      {
        accessorKey: 'assigned_users.value',
        header: 'Responsible',
        size: 160,
        filter: 'custom',
        enableColumnFilter: true,
        Cell: (cell) => <>{cell.row.original.assigned_users.map((user) => { return user.value }).toString() || ""}</>,
        filterFn: (row, columnId, filterValue) => {
          console.log(columnId)
          if (!Array.isArray(row.original.assigned_users)) return false;
          return row.original.assigned_users.some((user) =>
            user.value.toLowerCase().includes(filterValue.toLowerCase())
          );
        },
      },
      {
        accessorKey: 'category.value',
        header: ' Category',
        size: 120,
        Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.label : ""}</>
      },
      {
        accessorKey: 'frequency',
        header: ' Frequency',
        size: 120,
        Cell: (cell) => <>{cell.row.original.frequency ? cell.row.original.frequency : ""}</>
      },
      {
        accessorKey: 'boxes',
        header: 'Dates',
        size: 100,
        Cell: (cell) => userId ? <Stack direction="row" className="scrollable-stack" sx={{ height: '30px' }}>
          {cell.row.original && cell.row.original.boxes.map((b) => (
            <>
              {
                cell.row.original.frequency == 'daily' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                  <Button
                    sx={{ borderRadius: 20, maxHeight: '20px', minWidth: '20px', m: 0.3, pl: 1 }}
                    onClick={() => {
                      setChecklistBox(b);
                      setChecklist(cell.row.original)
                      setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
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
                    sx={{ borderRadius: 20, maxHeight: '20px', minWidth: '15px', m: 0.3, pl: 1 }}
                    onClick={() => {
                      setChecklistBox(b);
                      setChecklist(cell.row.original)
                      setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
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
                    sx={{ borderRadius: 20, m: 0.3, pl: 1 }}
                    onClick={() => {
                      setChecklistBox(b);
                      setChecklist(cell.row.original)
                      setChoice({ type: CheckListChoiceActions.view_checklist_remarks });

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
                    sx={{ borderRadius: 20, m: 0.3, pl: 1 }}
                    onClick={() => {
                      console.log(new Date(b.date))
                      console.log(new Date(previous_date))
                      setChecklistBox(b);
                      setChecklist(cell.row.original)
                      setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
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
        </Stack> : <Tooltip title={cell.row.original.last_checked_box ? cell.row.original.last_checked_box.last_remark : ""}>
            <Button size="small" color={cell.row.original.last_checked_box?.stage != 'done' ? (cell.row.original.last_checked_box?.stage == 'pending' ? "warning" : 'error') : 'success'} variant='contained'>{cell.row.original.last_checked_box ? toTitleCase(cell.row.original.last_checked_box.stage) : "Open"}</Button>
        </Tooltip>
      },
      {
        accessorKey: 'last_checked_date',
        header: 'Last Checked Date',
        size: 100,
        Cell: (cell) => <>{cell.row.original.updated_at ? moment(cell.row.original.updated_at).format('DD/MM/YYYY') : ""}</>
      },
      {
        accessorKey: 'next_date',
        header: 'Next Check Date',
        size: 120,
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
        size: 120,
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
        size: 100,
        Cell: (cell) => <>{cell.row.original.updated_at ? moment(cell.row.original.updated_at).format("DD/MM/YYYY") : ""}</>
      },
      {
        accessorKey: 'updated_by',
        header: 'Last Updated By',
        size: 100,
        Cell: (cell) => <>{cell.row.original.updated_by ? cell.row.original.updated_by.value : ""}</>
      },
    ],
    [checklists, data],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: checklists, //10,000 rows       
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
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
        border: '1px solid lightgrey;',
        '& span': {
          display: 'none',  // This hides any span within header cells
        },
        '&:hover span': {
          display: 'flex',  // Hide span when hovering over the header cell
        },
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
    state: { sorting, isLoading: isLoading, showAlertBanner: false },
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
            setChoice({ type: CheckListChoiceActions.create_or_edit_checklist })
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
              setChoice({ type: CheckListChoiceActions.assign_checklist_to_users })
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
              setChoice({ type: CheckListChoiceActions.assign_checklist_to_users })
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
              work_title: row.original.work_title,
              work_description: row.original.work_description,
              category: row.original.category.value,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.value }).toString(),
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
              work_title: row.original.work_title,
              work_description: row.original.work_description,
              category: row.original.category.value,
              frequency: row.original.frequency,
              link: row.original.link,
              assigned_users: row.original.assigned_users.map((u) => { return u.value }).toString(),
              status: ""
            }
          }
          )
          ExportToExcel(data, "Checklists Data")
        }}

        >Export Selected</MenuItem>}
      </Menu>
      <Stack sx={{ p: 2 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'center'}>
        < TextField
          size="small"
          type="date"
          id="start_date"
          label="Start Date"
          fullWidth
          focused
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
          focused
          fullWidth
          onChange={(e) => {
            setDates({
              ...dates,
              end_date: moment(e.target.value).format("YYYY-MM-DD")
            })
          }}
        />

        {LoggedInUser?._id === LoggedInUser?.created_by.id && LoggedInUser?.assigned_permissions.includes('checklist_admin_delete') && <Tooltip title="Delete Selected">
          <Button variant='contained' color='error'

            onClick={() => {
              let data: any[] = [];
              data = table.getSelectedRowModel().rows
              if (data.length == 0)
                alert("select some checklists")
              else
                setChoice({ type: CheckListChoiceActions.bulk_delete_checklist })
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
            id="checklist_owners"
            label="Person"
            fullWidth
          >
            <option key={'00'} value={undefined}>
            </option>
            {
              users.map((user, index) => {

                return (<option key={index} value={user._id}>
                  {user.username}
                </option>)

              })
            }
          </TextField>}

        {LoggedInUser?.assigned_permissions.includes('checklist_create') && <ChecklistExcelButtons />}
      </Stack>
      <CreateOrEditCheckListDialog checklist={checklist} setChecklist={setChecklist} />
      {checklist && <DeleteCheckListDialog checklist={checklist} />}
      {checklist && <CreateOrEditCheckListDialog checklist={checklist} setChecklist={setChecklist} />}
      {checklist && checklistBox && <ViewChecklistRemarksDialog checklist={checklist} checklist_box={checklistBox} />}
      <MaterialReactTable table={table} />
      {<AssignChecklistsDialog flag={flag} checklists={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
      {table.getSelectedRowModel().rows && table.getSelectedRowModel().rows.length > 0 && <BulkDeleteCheckListDialog ids={table.getSelectedRowModel().rows.map((l) => { return l.original._id })} clearIds={() => { table.resetRowSelection() }} />}

    </>
  )
}

export default CheckListAdminPage