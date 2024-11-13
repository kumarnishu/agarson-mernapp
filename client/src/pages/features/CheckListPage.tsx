import { useContext, useEffect, useMemo, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { GetUsers } from '../../services/UserServices'
import moment from 'moment'
import { GetUserDto } from '../../dtos'
import { DropDownDto } from '../../dtos'
import {  MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { CheckListChoiceActions, ChoiceContext } from '../../contexts/dialogContext'
import { FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import { DownloadFile } from '../../utils/DownloadFile'
import DBPagination from '../../components/pagination/DBpagination'
import { ChangeChecklistNextDate, GetAllCheckCategories, GetChecklists } from '../../services/CheckListServices'
import { GetChecklistBoxDto, GetChecklistDto } from '../../dtos'
import ViewChecklistRemarksDialog from '../../components/dialogs/checklists/ViewChecklistRemarksDialog'
import { queryClient } from '../../main'
import { currentYear, getNextMonday, getPrevMonday, nextMonth, nextYear, previousMonth, previousYear } from '../../utils/datesHelper'
import { toTitleCase } from '../../utils/TitleCase'



function ChecklistPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<GetUserDto[]>([])
  const [stage, setStage] = useState('open')
  const [checklist, setChecklist] = useState<GetChecklistDto>()
  const [checklists, setChecklists] = useState<GetChecklistDto[]>([])
  const [paginationData, setPaginationData] = useState({ limit: 1000, page: 1, total: 1 });
  const [checklistBox, setChecklistBox] = useState<GetChecklistBoxDto>()
  const [categories, setCategories] = useState<DropDownDto[]>([])
  const [userId, setUserId] = useState<string>()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("checklist_categories", GetAllCheckCategories)
  const { setChoice } = useContext(ChoiceContext)
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  let previous_date = new Date()
  let day = previous_date.getDate() - 3
  previous_date.setDate(day)
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'checklist_view', show_assigned_only: true }))
  const { data, isLoading, refetch } = useQuery<AxiosResponse<{ result: GetChecklistDto[], page: number, total: number, limit: number }>, BackendError>(["checklists", userId, stage], async () => GetChecklists({ limit: paginationData?.limit, page: paginationData?.page, id: userId, stage: stage }))
  const { mutate: changedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, next_date: string }>
    (ChangeChecklistNextDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('checklists')
      }
    })


  useEffect(() => {
    if (LoggedInUser?.assigned_users && LoggedInUser.assigned_users.length == 0) {
      setUserId(LoggedInUser._id)
    }
  }, [LoggedInUser])
  console.log(categories[0])
  const columns = useMemo<MRT_ColumnDef<GetChecklistDto>[]>(
    //column definitions...
    () => checklists && [

      {
        accessorKey: 'work_title',
        header: ' Work Title',
        size: 300,
        Cell: (cell) => <Tooltip sx={{ width: 300 }} title={
          cell.row.original.work_description && cell.row.original.work_description.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))
        } >
          {cell.row.original.link && cell.row.original.link != "" ?
            <a  style={{ fontSize: 11, fontWeight: '400', textDecoration: 'none' }} target='blank' href={cell.row.original.link}>{cell.row.original.work_title}</a>
            :
            <span  style={{ fontSize: 11, fontWeight: '400', textDecoration: 'none' }}>
              {cell.row.original.work_title}
            </span>
          }

        </Tooltip>
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
        size: 350,
        Cell: (cell) => userId ? <Stack direction="row" className="scrollable-stack" sx={{ height: '30px' }}>
          {cell.row.original && cell.row.original.boxes.map((b) => (
            <>
              {
                cell.row.original.frequency == 'daily' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                  <Button
                    sx={{ borderRadius: 20, maxHeight: '20px', minWidth: '20px', m: 0.3, pl: 1 }}
                    onClick={() => {
                      if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > new Date(previous_date)) {
                        setChecklistBox(b);
                        setChecklist(cell.row.original)
                        setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
                      }
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
                      if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < new Date(getNextMonday()) && new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= new Date(getPrevMonday())) {
                        setChecklistBox(b);
                        setChecklist(cell.row.original)
                        setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
                      }
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
                      console.log(new Date(b.date))
                      console.log(new Date(previous_date))
                      if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < nextMonth && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > previousMonth) {
                        setChecklistBox(b);
                        setChecklist(cell.row.original)
                        setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
                      }

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
                      if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > previousYear && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < nextYear) {
                        setChecklistBox(b);
                        setChecklist(cell.row.original)
                        setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
                      }
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
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
        <Stack direction={'row'} gap={1}>

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
    if (categorySuccess)
      setCategories(categorydata?.data)
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
      <Stack sx={{ p: 2 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
        < Typography variant='h6' >
          Checklists :  {checklists.length || 0}
        </Typography >
        <Stack direction="row" spacing={2} >

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
          </TextField>
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

        </Stack>
      </Stack>
      <MaterialReactTable table={table} />
      {checklist && checklistBox && <ViewChecklistRemarksDialog checklist={checklist} checklist_box={checklistBox} />}
    </>
  )
}

export default ChecklistPage