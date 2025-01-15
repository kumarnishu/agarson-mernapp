import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useMutation, useQuery } from 'react-query'
import { BackendError } from '../..'
import { Button, CircularProgress, Fade, IconButton, LinearProgress, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_Row, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import PopUp from '../../components/popup/PopUp'
import { Delete, Edit } from '@mui/icons-material'
import { DownloadFile } from '../../utils/DownloadFile'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import DeleteCheckListDialog from '../../components/dialogs/checklists/DeleteCheckListDialog'
import CreateOrEditCheckListDialog from '../../components/dialogs/checklists/CreateOrEditCheckListDialog'
import { queryClient } from '../../main'
import { currentYear, getNextMonday, nextMonth } from '../../utils/datesHelper'
import { ChecklistExcelButtons } from '../../components/buttons/ChecklistExcelButtons'
import AssignChecklistsDialog from '../../components/dialogs/checklists/AssignChecklistsDialog'
import BulkDeleteCheckListDialog from '../../components/dialogs/checklists/BulkDeleteCheckListDialog'
import ViewChecklistBoxRemarksDialog from '../../components/dialogs/checklists/ViewChecklistBoxRemarksDialog'
import ViewChecklistRemarksDialog from '../../components/dialogs/checklists/ViewChecklistRemarksDialog'
import { jsPDF } from 'jspdf'; //or use your library of choice here
import autoTable from 'jspdf-autotable';

import { UserService } from '../../services/UserServices'
import { ChecklistService } from '../../services/ChecklistService'
import FixCheckListBoxesDialog from '../../components/dialogs/checklists/FixCheckListBoxesDialog'
import { GetChecklistBoxDto, GetChecklistDto, GetChecklistTopBarDto } from '../../dtos/ChecklistDto'
import { DropDownDto } from '../../dtos/DropDownDto'
import { CreateChecklistFromExcelDto } from '../../dtos/ChecklistDto'

function CheckListAdminPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [users, setUsers] = useState<DropDownDto[]>([])
  const [checklist, setChecklist] = useState<GetChecklistDto>()
  const [checklists, setChecklists] = useState<GetChecklistDto[]>([])
  const [flag, setFlag] = useState(1);
  const [stage, setStage] = useState('all')
  const [checklistBox, setChecklistBox] = useState<GetChecklistBoxDto>()
  const [categoriesData, setCategoriesData] = useState<GetChecklistTopBarDto>()
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

  const { data: categorydata, isSuccess: categorySuccess, isLoading: isScoreLoading } = useQuery<AxiosResponse<GetChecklistTopBarDto>, BackendError>(["checklists_top_bar", userId], async () => new ChecklistService().GetChecklistTopBarDetails(userId || "all"))
  const [dialog, setDialog] = useState<string | undefined>()
  let previous_date = new Date()
  let day = previous_date.getDate() - 3
  previous_date.setDate(day)
  const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'checklist_view', show_assigned_only: false }))
  const { data, isLoading } = useQuery<AxiosResponse<GetChecklistDto[]>, BackendError>(["checklists", userId, dates?.start_date, dates?.end_date, stage], async () => new ChecklistService().GetChecklistReports({ id: userId, start_date: dates?.start_date, end_date: dates?.end_date, stage: stage }))
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { mutate: changedate } = useMutation
    <AxiosResponse<any>, BackendError, { id: string, next_date: string }>
    (new ChecklistService().ChangeChecklistNextDate, {
      onSuccess: () => {
        queryClient.invalidateQueries('checklists')
      }
    })

  const handleExportRows = (rows: MRT_Row<GetChecklistDto>[], filename: string) => {
    const doc = new jsPDF();
    const tableData = rows.map((row) => Object.values(row.original));
    const tableHeaders = columns.map((c) => c.header);

    autoTable(doc, {
      head: [tableHeaders],
      //@ts-ignore
      body: tableData,
    });

    doc.save(`${filename}`);
  };

  const columns = useMemo<MRT_ColumnDef<GetChecklistDto>[]>(
    //column definitions...
    () => checklists && [
      {
        accessorKey: 'actions',  enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
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
          }} size="small" sx={{ borderRadius: 10, maxHeight: '15px', minWidth: '10px', m: 0, p: 0.5, fontSize: 9 }} color={cell.row.original.last_checked_box?.stage != 'done' ? (cell.row.original.last_checked_box?.stage == 'pending' ? "warning" : 'error') : 'success'} variant='contained'>{cell.row.original.last_checked_box ? toTitleCase(cell.row.original.last_checked_box.stage) : "Open"}</Button>
        </Tooltip>
      },
      {
        accessorKey: 'work_title',
        header: ' Work Title',
        Footer: "Score",
        AggregatedCell: (cell) => <h4 style={{
          textAlign: 'left', fontSize: '1.1em', width: '100%', wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal'
        }} title={cell.row.original.group_title && cell.row.original.group_title.toUpperCase()}>{cell.row.original.group_title && cell.row.original.group_title.toUpperCase()}</h4>,
        Cell: (cell) => <span title={cell.row.original.work_title} >
          {cell.row.original.link && cell.row.original.link != "" ?
            <a style={{ fontSize: '1.1em', fontWeight: '400', textDecoration: 'none' }} target='blank' href={cell.row.original.link}><pre>{cell.row.original.work_title}</pre></a>
            :
            <pre style={{ fontSize: '1.1em', fontWeight: '400', textDecoration: 'none' }}>
              {cell.row.original.work_title}
            </pre>
          }
        </span>
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
                    cell.row.original.frequency == 'daily' &&
                    <Button title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark}
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

                  }
                  {
                    cell.row.original.frequency == 'weekly' &&
                    <Button title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark}
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
                  }
                  {
                    cell.row.original.frequency == 'monthly' &&
                    <Button title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark}
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

                  }
                  {
                    cell.row.original.frequency == 'yearly' &&
                    <Button title={b.stage == "open" ? moment(new Date(b.date)).format('LL') : b.last_remark}
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
        accessorKey: 'last_remark',
        header: ' Last Remark',
        Cell: (cell) => cell.row.original.last_remark && cell.row.original.last_remark.includes("\n") ? <pre title={cell.row.original.last_remark || ""}>{cell.row.original.last_remark || ""}</pre> : <p style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal'
        }} title={cell.row.original.last_remark || ""}>{cell.row.original.last_remark || ""}</p>
      },
      {
        accessorKey: 'group_title',
        header: ' Group Title',

        Cell: (cell) => <>{cell.row.original.group_title || ""}</>
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
        accessorKey: 'filtered_score',
        header: 'Filtered Score',
        Cell: (cell) => <>{cell.row.original.filtered_score || 0}</>,
        Footer: ({ table }) => <b>{parseFloat(Number(table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.filtered_score) }, 0) / table.getFilteredRowModel().rows.length).toFixed(2))}</b>
      },
      {
        accessorKey: 'today_score',
        header: 'Today Score',
        Cell: (cell) => <>{cell.row.original.today_score || 0}</>,
        Footer: ({ table }) => <b>{parseFloat(Number(table.getFilteredRowModel().rows.reduce((a, b) => { return Number(a) + Number(b.original.today_score) }, 0) / table.getFilteredRowModel().rows.length).toFixed(2))}</b>
      },
      {
        accessorKey: 'expected_number',
        header: 'Expected No'
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
    positionToolbarAlertBanner: 'none',
    enableColumnVirtualization: true,
    enableStickyFooter: true,
    enableDensityToggle: false, initialState: { sorting: [{ id: "group_title", desc: false }], density: 'compact', grouping: ['group_title'], showGlobalFilter: true, expanded: true, pagination: { pageIndex: 0, pageSize: 1000 } },
    enableGrouping: true,
    enableRowSelection: true,
    enablePagination: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '78vh' }
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
    renderTopToolbarCustomActions: () => (
      < >
        {isScoreLoading ? <CircularProgress /> :
          <Typography sx={{ overflow: 'hidden', fontSize: '1.1em', fontWeight: 'bold', textAlign: 'center' }} >Checklists : {`${checklists.length} - `} LM:{`${categoriesData?.lastmonthscore} - `}CM: {categoriesData?.currentmonthscore}</Typography>}
        <Stack justifyContent={'center'} direction={'row'} gap={1} sx={{ backgroundColor: 'white' }} >

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

        </Stack>

      </>
    ),
    muiTableBodyRowProps: (row) => ({
      sx: {
        backgroundColor: row.row.getIsGrouped() ? 'lightgrey' : 'inherit', // Light blue for grouped rows
        visibility: row.row.getIsGrouped() && row.row.original.work_title == "" ? 'none' : 'block',
        fontWeight: row.row.getIsGrouped() ? 'bold' : 'normal', // Bold text for grouped rows
      },
    }),
    muiTableBodyCellProps: (cell) => ({
      sx: {
        border: '1px solid lightgrey;',
        borderBottom: cell.row.original.group_title != "" ? 'none' : '1px solid lightgrey;',
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
      shape: 'rounded',
      variant: 'outlined',
    },

    enableRowVirtualization: true,
    rowVirtualizerInstanceRef, //optional
    //optionally customize the column virtualizer
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      columnVisibility: { ...columnVisibility, 'group_title': false, "mrt-row-expand": false, },
      columnSizing: columnSizing
    },
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
      setChecklists(data.data)
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
      {isLoading && <LinearProgress />}
      <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} p={1}>
        <Stack direction={'row'} gap={1} sx={{ maxWidth: '70vw', borderRadius: 1 }} className='scrollable-stack'>
          {categoriesData?.categorydData.map((category, index) => (
            <Stack style={{ minWidth: '150px', overflowY: 'hidden' }}
              key={index}
            >
              <span key={category.category} style={{ fontSize: '1.1em' }}> {category.count} : {toTitleCase(category.category).slice(0, 10)} </span>
            </Stack>
          ))}
        </Stack>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'right', gap: 1 }}>
          {LoggedInUser?._id === LoggedInUser?.created_by.id && LoggedInUser?.assigned_permissions.includes('checklist_admin_delete') &&
            <Button variant='text' color='inherit' size='large'
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

          <Button size="small" color="inherit" variant='text'
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
        {LoggedInUser?.assigned_permissions.includes('checklist_admin_edit') && <MenuItem
          onClick={() => {
            setDialog('FixCheckListBoxesDialog')
            setAnchorEl(null)
          }}
        > Fixed Date Boxes</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('checklist_admin_export') && < MenuItem onClick={() => {

          let data: CreateChecklistFromExcelDto[] = []
          data = table.getRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
              work_title: row.original.work_title,
              group_title: row.original.group_title,
              category: row.original.category.label,
              condition: row.original.condition,
              expected_number: row.original.expected_number,
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
          let data: CreateChecklistFromExcelDto[] = []
          data = table.getSelectedRowModel().rows.map((row) => {
            return {
              _id: row.original._id,
              serial_no: row.original.serial_no,
              work_title: row.original.work_title,
              group_title: row.original.group_title,
              condition: row.original.condition,
              expected_number: row.original.expected_number,
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

        >Export Selected </MenuItem>}

        {LoggedInUser?.assigned_permissions.includes('checklist_admin_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
          handleExportRows(table.getSelectedRowModel().rows, "Checklists Data")
        }}

        >Export PDF</MenuItem>}


      </Menu>
      <MaterialReactTable table={table} />


      <CreateOrEditCheckListDialog dialog={dialog} setDialog={setDialog} checklist={checklist} setChecklist={setChecklist} />
      {checklist && <DeleteCheckListDialog dialog={dialog} setDialog={setDialog} checklist={checklist} />}
      <FixCheckListBoxesDialog dialog={dialog} setDialog={setDialog} />
      {checklist && <CreateOrEditCheckListDialog dialog={dialog} setDialog={setDialog} checklist={checklist} setChecklist={setChecklist} />}
      {checklist && checklistBox && <ViewChecklistBoxRemarksDialog dialog={dialog} setDialog={setDialog} is_admin={true} checklist={checklist} checklist_box={checklistBox} />}
      {checklist && <ViewChecklistRemarksDialog dialog={dialog} setDialog={setDialog} checklist={checklist} />}
      {<AssignChecklistsDialog dialog={dialog} setDialog={setDialog} flag={flag} checklists={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
      <BulkDeleteCheckListDialog dialog={dialog} setDialog={setDialog} ids={table.getSelectedRowModel().rows.map((l) => { return l.original._id })} clearIds={() => { table.resetRowSelection() }} />
    </>
  )
}

export default CheckListAdminPage