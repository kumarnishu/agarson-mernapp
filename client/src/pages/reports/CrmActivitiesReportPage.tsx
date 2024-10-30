import { useContext, useEffect, useMemo, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { GetActivitiesTopBarDeatils, GetAllStages, GetRemarks } from '../../services/LeadsServices'
import { BackendError } from '../..'
import { Button, Fade, IconButton, LinearProgress, Menu, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import { GetUsers } from '../../services/UserServices'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import { GetUserDto } from '../../dtos'
import { DropDownDto } from '../../dtos'
import { GetActivitiesOrRemindersDto, GetActivitiesTopBarDetailsDto } from '../../dtos'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import ViewRemarksDialog from '../../components/dialogs/crm/ViewRemarksDialog'
import CreateOrEditRemarkDialog from '../../components/dialogs/crm/CreateOrEditRemarkDialog'
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import PopUp from '../../components/popup/PopUp'
import { Comment, FilterAlt, FilterAltOff, Fullscreen, FullscreenExit, Visibility } from '@mui/icons-material'
import { onlyUnique } from '../../utils/UniqueArray'
import { DownloadFile } from '../../utils/DownloadFile'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'

function CrmActivitiesReportPage() {
    const { user } = useContext(UserContext)
    const [users, setUsers] = useState<GetUserDto[]>([])
    const [paginationData, setPaginationData] = useState({ limit: 500, page: 1, total: 1 });
    const [stage, setStage] = useState<string>('undefined');
    const [stages, setStages] = useState<DropDownDto[]>([])
    const [remark, setRemark] = useState<GetActivitiesOrRemindersDto>()
    const [remarks, setRemarks] = useState<GetActivitiesOrRemindersDto[]>([])
    const [userId, setUserId] = useState<string>()
    const [dates, setDates] = useState<{ start_date: string, end_date: string }>({
        start_date: moment(new Date().setDate(new Date().getDate())).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
    })
    const { user: LoggedInUser } = useContext(UserContext)
    const { data: stagedata, isSuccess: stageSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("crm_stages", GetAllStages)

    const { data: activitiesTopBarData } = useQuery<AxiosResponse<GetActivitiesTopBarDetailsDto[]>, BackendError>(["activities_topbar", dates, userId], async () => GetActivitiesTopBarDeatils({ start_date: dates?.start_date, end_date: dates?.end_date, id: userId }))

    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'report_menu', show_assigned_only: true }))
    const { data, isLoading, refetch: ReftechRemarks, isRefetching } = useQuery<AxiosResponse<{ result: GetActivitiesOrRemindersDto[], page: number, total: number, limit: number }>, BackendError>(["activities", stage, userId, dates?.start_date, dates?.end_date], async () => GetRemarks({ stage: stage, limit: paginationData?.limit, page: paginationData?.page, id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const { setChoice } = useContext(ChoiceContext)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const columns = useMemo<MRT_ColumnDef<GetActivitiesOrRemindersDto>[]>(
        //column definitions...
        () => remarks && [
            {
                accessorKey: 'actions',
                header: '',
                maxSize: 50,
                enableColumnFilter: false,
                Footer: <b></b>,
                size: 120,
                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row" spacing={1}>
                            {LoggedInUser?.assigned_permissions.includes('activities_view') && <Tooltip title="view remarks">
                                <IconButton color="primary"

                                    onClick={() => {

                                        setChoice({ type: LeadChoiceActions.view_remarks })
                                        setRemark(cell.row.original)


                                    }}
                                >
                                    <Visibility />
                                </IconButton>
                            </Tooltip>}
                            {LoggedInUser?.assigned_permissions.includes('activities_create') &&
                                <Tooltip title="Add Remark">
                                    <IconButton

                                        color="success"
                                        onClick={() => {

                                            setChoice({ type: LeadChoiceActions.create_or_edt_remark })
                                            setRemark(cell.row.original)

                                        }}
                                    >
                                        <Comment />
                                    </IconButton>
                                </Tooltip>}

                        </Stack>}
                />
            },
            {
                accessorKey: 'remark',
                header: ' Last Remark',
                size: 320,
                Cell: (cell) => <>{cell.row.original.remark ? cell.row.original.remark : ""}</>
            },
            {
                accessorKey: 'created_by.label',
                header: 'Creator',
                size: 100,
                Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
            },
            {
                accessorKey: 'created_at',
                header: 'TimeStamp',
                size: 200,
                Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
            },
            {
                accessorKey: 'stage',
                header: 'Stage',
                size: 120,
                Cell: (cell) => <>{cell.row.original.stage ? cell.row.original.stage : ""}</>
            },

            {
                accessorKey: 'remind_date',
                header: 'Next Call',
                size: 140,
                Cell: (cell) => <>{cell.row.original.remind_date ? cell.row.original.remind_date : ""}</>
            },

            {
                accessorKey: 'name',
                header: 'Name',
                size: 250,
                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
                filterSelectOptions: remarks && remarks.map((i) => {
                    return i.name;
                }).filter(onlyUnique)
            },


            {
                accessorKey: 'mobile',
                header: 'Mobile1',
                size: 120,
                Cell: (cell) => <>{cell.row.original.mobile ? cell.row.original.mobile : ""}</>
            }, {
                accessorKey: 'alternate_mobile1',
                header: 'Mobile2',
                size: 120,
                Cell: (cell) => <>{cell.row.original.alternate_mobile1 ? cell.row.original.alternate_mobile1 : ""}</>
            }, {
                accessorKey: 'alternate_mobile2',
                header: 'Mobile3',
                size: 120,
                Cell: (cell) => <>{cell.row.original.alternate_mobile2 ? cell.row.original.alternate_mobile2 : ""}</>
            },

            {
                accessorKey: 'referred_party_name',
                header: 'Refer Party',
                size: 320,
                Cell: (cell) => <>{cell.row.original.referred_party_name ? cell.row.original.referred_party_name : ""}</>
            },
            {
                accessorKey: 'referred_party_mobile',
                header: 'Refer Mobile',
                size: 120,
                Cell: (cell) => <>{cell.row.original.referred_party_mobile ? cell.row.original.referred_party_mobile : ""}</>
            },
            {
                accessorKey: 'referred_date',
                header: 'Refer Date',
                size: 120,
                Cell: (cell) => <>{cell.row.original.referred_date ? cell.row.original.referred_date : ""}</>
            },
            {
                accessorKey: 'city',
                header: 'City',
                filterVariant: 'multi-select',
                size: 120,
                Cell: (cell) => <>{cell.row.original.city ? cell.row.original.city : ""}</>,
                filterSelectOptions: remarks && remarks.map((i) => {
                    return i.city;
                }).filter(onlyUnique)
            },
            {
                accessorKey: 'state',
                header: 'State',
                filterVariant: 'multi-select',
                size: 120,
                Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
                filterSelectOptions: remarks && remarks.map((i) => {
                    return i.state;
                }).filter(onlyUnique)
            },


            {
                accessorKey: 'customer_name',
                header: 'Customer',
                size: 120,
                Cell: (cell) => <>{cell.row.original.customer_name ? cell.row.original.customer_name : ""}</>
            }
            , {
                accessorKey: 'customer_designation',
                header: 'Designitaion',
                size: 120,
                Cell: (cell) => <>{cell.row.original.customer_designation ? cell.row.original.customer_designation : ""}</>
            }

            ,
            {
                accessorKey: 'email',
                header: 'Email',
                size: 120,
                Cell: (cell) => <>{cell.row.original.email ? cell.row.original.email : ""}</>
            }
            ,
            {
                accessorKey: 'alternate_email',
                header: 'Email2',
                size: 120,
                Cell: (cell) => <>{cell.row.original.alternate_email ? cell.row.original.alternate_email : ""}</>
            }
            ,

            {
                accessorKey: 'address',
                header: 'Address',
                size: 320,
                Cell: (cell) => <>{cell.row.original.address ? cell.row.original.address : ""}</>
            },
            {
                accessorKey: 'source',
                header: 'Lead Source',
                size: 120,
                Cell: (cell) => <>{cell.row.original.lead_source ? cell.row.original.lead_source : ""}</>
            },
            {
                accessorKey: 'type',
                header: 'Lead Type',
                size: 120,
                Cell: (cell) => <>{cell.row.original.lead_type ? cell.row.original.lead_type : ""}</>
            },
            {
                accessorKey: 'country',
                header: 'Country',
                size: 120,
                Cell: (cell) => <>{cell.row.original.country ? cell.row.original.country : ""}</>
            },
            {
                accessorKey: 'visiting_card',
                header: 'Visiting Card',
                size: 120,
                Cell: (cell) => <span onDoubleClick={() => {
                    if (cell.row.original.visiting_card && cell.row.original.visiting_card) {
                        DownloadFile(cell.row.original.visiting_card, 'visiting card')
                    }
                }}>
                    {cell.row.original.visiting_card && cell.row.original.visiting_card ? < img height="20" width="55" src={cell.row.original.visiting_card && cell.row.original.visiting_card} alt="visiting card" /> : "na"}</span>
            },
        ],
        [remarks],
        //end
    );
    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover', 
        data: remarks, //10,000 rows       
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
            },
        }),
        renderTopToolbarCustomActions: ({ table }) => (

            <Stack
                sx={{ width: '100%' }}
                pt={1}
                direction="row"
                alignItems={'center'}
                justifyContent="space-between">
                <Stack direction={'row'} gap={1} p={1} sx={{background:'whitesmoke'}}>
                    {activitiesTopBarData && activitiesTopBarData.data && activitiesTopBarData.data.map((stage, index) => (
                        <span key={index} style={{ paddingLeft: '25px'}}>{toTitleCase(stage.stage)} - {stage.value}</span>
                    ))}
                </Stack>

                <Stack justifyContent={'right'} direction={'row'} gap={1}>
                    <Tooltip title="Toogle Filter">
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
            <DBPagination paginationData={paginationData} refetch={ReftechRemarks} setPaginationData={setPaginationData} />

        ),
        muiTableBodyCellProps: () => ({
            sx: {
                border: '1px solid lightgrey;',
            },
        }),
        enableToolbarInternalActions: false,
        initialState: { density: 'compact' },
        enableRowSelection: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        onSortingChange: setSorting,
        enableTableFooter: true,
        enableRowVirtualization: true,
        state: { sorting, isLoading: isLoading },
        enableBottomToolbar: true,
        enableGlobalFilter: false,
        enablePagination: false,
        manualPagination: true
    });
    useEffect(() => {
        if (stageSuccess)
            setStages(stagedata?.data)
    }, [stageSuccess])

    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [users, isUsersSuccess, usersData])

    useEffect(() => {
        if (data) {
            setRemarks(data.data.result)
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

            {
                isLoading || isRefetching && <LinearProgress color='secondary' />
            }
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

                {LoggedInUser?.assigned_permissions.includes('activities_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                >Export All</MenuItem>}
                {LoggedInUser?.assigned_permissions.includes('activities_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

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
                        if (e.currentTarget.value) {
                            setDates({
                                ...dates,
                                end_date: moment(e.target.value).format("YYYY-MM-DD")
                            })
                        }
                    }}
                />
                {user?.assigned_users && user?.assigned_users.length > 0 && <Select
                    sx={{ m: 1, width: 300 }}
                    labelId="demo-multiple-name-label"
                    id="demo-multiple-name"
                    value={stage}
                    onChange={(e) => {
                        setStage(e.target.value);
                    }}
                    size='small'
                >
                    <MenuItem
                        key={'00'}
                        value={'undefined'}
                        onChange={() => setStage('undefined')}
                    >
                        All
                    </MenuItem>
                    {stages.map((stage, index) => (
                        <MenuItem
                            key={index}
                            value={stage.value}
                        >
                            {toTitleCase(stage.label)}
                        </MenuItem>
                    ))}
                </Select>}

                {user?.assigned_users && user?.assigned_users.length > 0 &&
                    < TextField
                        select

                        size="small"
                        SelectProps={{
                            native: true,
                        }}
                        onChange={(e) => {
                            setUserId(e.target.value)
                            ReftechRemarks()
                        }}
                        required
                        id="lead_owners"
                        label="Filter Remarks Of Indivdual"
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
            {remark && <ViewRemarksDialog id={remark.lead_id} />}
            {remark && <CreateOrEditRemarkDialog lead={remark ? {
                _id: remark.lead_id,
                has_card: remark.has_card,
                stage: remark.stage
            } : undefined} />}
            <MaterialReactTable table={table} />


        </>
    )
}

export default CrmActivitiesReportPage