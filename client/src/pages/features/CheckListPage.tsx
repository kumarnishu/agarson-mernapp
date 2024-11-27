import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { GetUsers } from '../../services/UserServices'
import moment from 'moment'
import { GetChecklistFromExcelDto, GetUserDto } from '../../dtos'
import { DropDownDto } from '../../dtos'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { CheckListChoiceActions, ChoiceContext } from '../../contexts/dialogContext'
import { FilterAltOff, Fullscreen, FullscreenExit } from '@mui/icons-material'
import { DownloadFile } from '../../utils/DownloadFile'
import DBPagination from '../../components/pagination/DBpagination'
import { ChangeChecklistNextDate, GetAllCheckCategories, GetChecklists } from '../../services/CheckListServices'
import { GetChecklistBoxDto, GetChecklistDto } from '../../dtos'
import { queryClient } from '../../main'
import { currentYear, getNextMonday, getPrevMonday, nextMonth, nextYear, previousMonth, previousYear } from '../../utils/datesHelper'
import { toTitleCase } from '../../utils/TitleCase'
import ViewChecklistBoxRemarksDialog from '../../components/dialogs/checklists/ViewChecklistBoxRemarksDialog'
import ViewChecklistRemarksDialog from '../../components/dialogs/checklists/ViewChecklistRemarksDialog'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'


function ChecklistPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<GetUserDto[]>([])
  const [stage, setStage] = useState('open')
  const [checklist, setChecklist] = useState<GetChecklistDto>()
  const [checklists, setChecklists] = useState<GetChecklistDto[]>([])
  const [paginationData, setPaginationData] = useState({ limit: 1000, page: 1, total: 1 });
  const [checklistBox, setChecklistBox] = useState<GetChecklistBoxDto>()
  const [categories, setCategories] = useState<DropDownDto[]>([])
  const [userId, setUserId] = useState<string>('all')
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const { data: categorydata, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("checklist_categories", GetAllCheckCategories)
  const { setChoice } = useContext(ChoiceContext)
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  let previous_date = new Date()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  let day = previous_date.getDate() - 1
  previous_date.setDate(day)
  previous_date.setHours(0, 0, 0, 0)
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
        accessorKey: 'serial_no',
        header: ' #',
       
      },
      {
        accessorKey: 'last_checked_box',
        header: 'Stage',
        
        Cell: (cell) => <Tooltip title={cell.row.original.last_checked_box ? cell.row.original.last_checked_box.last_remark : ""}>
          <Button onClick={() => {
            setChecklist(cell.row.original)
            setChoice({ type: CheckListChoiceActions.view_checklist_remarks });
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
       
        enableColumnFilter: true,
        Cell: (cell) => <>{cell.row.original.assigned_users.map((user) => { return user.value }).toString() || ""}</>,
        filter: 'custom',
        filterFn: (row, columnId, filterValue) => {
          console.log(columnId)
          if (!Array.isArray(row.original.assigned_users)) return false;
          return row.original.assigned_users.some((user) =>
            user.value.toLowerCase().includes(filterValue.toLowerCase())
          );
        },
      },
      {
        accessorKey: 'last_10_boxes',
        header: 'Filtered Dates',
       
        filter: 'custom',
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          console.log(columnId)
          if (!Array.isArray(row.original.last_10_boxes)) return false;
          return row.original.last_10_boxes.some((box) => {
            if (row.original.frequency == 'daily')
              return String(new Date(box.date).getDate()).toLowerCase() == filterValue
            else if (row.original.frequency == 'weekly')
              return String(new Date(box.date).getDate()).toLowerCase() == filterValue
            else if (row.original.frequency == 'monthly')
              return String(monthNames[new Date(box.date).getMonth()]).toLowerCase() == filterValue
            else
              return String(new Date(box.date).getFullYear()).toLowerCase() == filterValue
          }
          );
        },
        Cell: (cell) => <>
          <Stack direction="row" className="scrollable-stack" sx={{ height: '20px' }}>
            {cell.row.original && cell.row.original.last_10_boxes.map((b) => (
              <>
                {
                  cell.row.original.frequency == 'daily' && <Tooltip title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark} key={b.date}>
                    <Button
                      sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > new Date(previous_date)) {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setChoice({ type: CheckListChoiceActions.view_checklist_box_remarks });
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
                      sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0.3, pl: 1 }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < new Date(getNextMonday()) && new Date(new Date(b.date).setHours(0, 0, 0, 0)) >= new Date(getPrevMonday())) {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setChoice({ type: CheckListChoiceActions.view_checklist_box_remarks });
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
                      sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3 }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < nextMonth && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > previousMonth) {

                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setChoice({ type: CheckListChoiceActions.view_checklist_box_remarks });
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
                      sx={{ borderRadius: 4, maxHeight: '15px', minWidth: '10px', m: 0.3, }}
                      onClick={() => {
                        if (b && new Date(new Date(b.date).setHours(0, 0, 0, 0)) > previousYear && new Date(new Date(b.date).setHours(0, 0, 0, 0)) < nextYear) {
                          setChecklistBox(b);
                          setChecklist(cell.row.original)
                          setChoice({ type: CheckListChoiceActions.view_checklist_box_remarks });
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
          </Stack>
        </>
      },

      {
        accessorKey: 'category.value',
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '71vh' }
    }),
    muiTableHeadRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
        border: '1px solid lightgrey;',
      },
    }),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box minWidth={'100vw'} >
        <Stack sx={{ p: 1 }} direction='row' gap={1} pb={1} alignItems={'center'} justifyContent={'space-between'}>
          <Typography variant='h6'>Checklists : {checklists.length}</Typography>
          <Stack
            pt={1}
            direction="row"
            alignItems={'center'}
            justifyContent="right">

            <Stack justifyContent={'right'} pr={2} direction={'row'} gap={1}>

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
              </TextField>

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

                      return (<option key={index} value={user._id}>
                        {toTitleCase(user.username)}
                      </option>)

                    })
                  }
                </TextField>}

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
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 2 },
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
        {LoggedInUser?.assigned_permissions.includes('checklist_export') && < MenuItem onClick={() => {

          let data: GetChecklistFromExcelDto[] = []
          data = table.getRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
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
        {LoggedInUser?.assigned_permissions.includes('checklist_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          let data: GetChecklistFromExcelDto[] = []
          data = table.getSelectedRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
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
      <MaterialReactTable table={table} />
      {checklist && checklistBox && <ViewChecklistBoxRemarksDialog checklist={checklist} checklist_box={checklistBox} />}
      {checklist && <ViewChecklistRemarksDialog checklist={checklist} />}
    </>
  )
}

export default ChecklistPage