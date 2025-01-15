import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { Box, Button, Fade, IconButton, LinearProgress, Menu, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { UserContext } from '../../contexts/userContext'
import moment from 'moment'
import { toTitleCase } from '../../utils/TitleCase'
import ViewRemarksDialog from '../../components/dialogs/crm/ViewRemarksDialog'
import CreateOrEditRemarkDialog from '../../components/dialogs/crm/CreateOrEditRemarkDialog'
import PopUp from '../../components/popup/PopUp'
import { Comment, FilterAlt, FilterAltOff, Fullscreen, FullscreenExit, Visibility } from '@mui/icons-material'
import { onlyUnique } from '../../utils/UniqueArray'
import { DownloadFile } from '../../utils/DownloadFile'
import DBPagination from '../../components/pagination/DBpagination'
import { Menu as MenuIcon } from '@mui/icons-material';
import ExportToExcel from '../../utils/ExportToExcel'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'


import { DropdownService } from '../../services/DropDownServices'
import { UserService } from '../../services/UserServices'
import { CrmService } from '../../services/CrmService'
import { GetActivitiesOrRemindersDto, GetActivitiesTopBarDetailsDto } from '../../dtos/CrmDto'
import { DropDownDto } from '../../dtos/DropDownDto'


function CrmActivitiesReportPage() {
    const { user } = useContext(UserContext)
    const [users, setUsers] = useState<DropDownDto[]>([])
    const [paginationData, setPaginationData] = useState({ limit: 5000, page: 1, total: 1 });
    const [stage, setStage] = useState<string>('all');
    const [stages, setStages] = useState<DropDownDto[]>([])
    const [remark, setRemark] = useState<GetActivitiesOrRemindersDto>()
    const [remarks, setRemarks] = useState<GetActivitiesOrRemindersDto[]>([])
    const [userId, setUserId] = useState<string>()
    const [dates, setDates] = useState<{ start_date: string, end_date: string }>({
        start_date: moment(new Date().setDate(new Date().getDate())).format("YYYY-MM-DD")
        , end_date: moment(new Date().setDate(new Date().getDate() + 1)).format("YYYY-MM-DD")
    })
    const { user: LoggedInUser } = useContext(UserContext)
    const { data: stagedata, isSuccess: stageSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("crm_stages", new DropdownService().GetAllStages)

    const { data: activitiesTopBarData } = useQuery<AxiosResponse<GetActivitiesTopBarDetailsDto[]>, BackendError>(["activities_topbar", dates, userId], async () => new CrmService().GetActivitiesTopBarDeatils({ start_date: dates?.start_date, end_date: dates?.end_date, id: userId }))

    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'leads_view', show_assigned_only: true }))
    const { data, isLoading, refetch: ReftechRemarks, isRefetching } = useQuery<AxiosResponse<{ result: GetActivitiesOrRemindersDto[], page: number, total: number, limit: number }>, BackendError>(["activities", stage, userId, dates?.start_date, dates?.end_date], async () => new CrmService().GetRemarks({ stage: stage, limit: paginationData?.limit, page: paginationData?.page, id: userId, start_date: dates?.start_date, end_date: dates?.end_date }))
    const [dialog, setDialog] = useState<string | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const isFirstRender = useRef(true);

    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const columns = useMemo<MRT_ColumnDef<GetActivitiesOrRemindersDto>[]>(
        //column definitions...
        () => remarks && [
            {
                accessorKey: 'actions',  enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
                header:'Actions',

                Footer: <b></b>,
                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row" spacing={1}>
                            {LoggedInUser?.assigned_permissions.includes('activities_view') && <Tooltip title="view remarks">
                                <IconButton color="primary"

                                    onClick={() => {

                                        setDialog('ViewRemarksDialog')
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

                                            setDialog('CreateOrEditRemarkDialog')
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

                Cell: (cell) => <>{cell.row.original.remark ? cell.row.original.remark : ""}</>
            },
            {
                accessorKey: 'created_by.label',
                header: 'Creator',

                Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
            },
            {
                accessorKey: 'created_at',
                header: 'TimeStamp',

                Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
            },
            {
                accessorKey: 'stage',
                header: 'Stage',

                Cell: (cell) => <>{cell.row.original.stage ? cell.row.original.stage : ""}</>
            },

            {
                accessorKey: 'remind_date',
                header: 'Next Call',

                Cell: (cell) => <>{cell.row.original.remind_date ? cell.row.original.remind_date : ""}</>
            },

            {
                accessorKey: 'name',
                header: 'Name',

                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
                filterSelectOptions: remarks && remarks.map((i) => {
                    return i.name;
                }).filter(onlyUnique)
            },


            {
                accessorKey: 'mobile',
                header: 'Mobile1',

                Cell: (cell) => <>{cell.row.original.mobile ? cell.row.original.mobile : ""}</>
            }, {
                accessorKey: 'alternate_mobile1',
                header: 'Mobile2',

                Cell: (cell) => <>{cell.row.original.alternate_mobile1 ? cell.row.original.alternate_mobile1 : ""}</>
            }, {
                accessorKey: 'alternate_mobile2',
                header: 'Mobile3',

                Cell: (cell) => <>{cell.row.original.alternate_mobile2 ? cell.row.original.alternate_mobile2 : ""}</>
            },

            {
                accessorKey: 'referred_party_name',
                header: 'Refer Party',

                Cell: (cell) => <>{cell.row.original.referred_party_name ? cell.row.original.referred_party_name : ""}</>
            },
            {
                accessorKey: 'referred_party_mobile',
                header: 'Refer Mobile',

                Cell: (cell) => <>{cell.row.original.referred_party_mobile ? cell.row.original.referred_party_mobile : ""}</>
            },
            {
                accessorKey: 'referred_date',
                header: 'Refer Date',

                Cell: (cell) => <>{cell.row.original.referred_date ? cell.row.original.referred_date : ""}</>
            },
            {
                accessorKey: 'city',
                header: 'City',
                filterVariant: 'multi-select',

                Cell: (cell) => <>{cell.row.original.city ? cell.row.original.city : ""}</>,
                filterSelectOptions: remarks && remarks.map((i) => {
                    return i.city;
                }).filter(onlyUnique)
            },
            {
                accessorKey: 'state',
                header: 'State',
                filterVariant: 'multi-select',

                Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
                filterSelectOptions: remarks && remarks.map((i) => {
                    return i.state;
                }).filter(onlyUnique)
            },


            {
                accessorKey: 'customer_name',
                header: 'Customer',

                Cell: (cell) => <>{cell.row.original.customer_name ? cell.row.original.customer_name : ""}</>
            }
            , {
                accessorKey: 'customer_designation',
                header: 'Designitaion',

                Cell: (cell) => <>{cell.row.original.customer_designation ? cell.row.original.customer_designation : ""}</>
            }

            ,
            {
                accessorKey: 'email',
                header: 'Email',

                Cell: (cell) => <>{cell.row.original.email ? cell.row.original.email : ""}</>
            }
            ,
            {
                accessorKey: 'alternate_email',
                header: 'Email2',

                Cell: (cell) => <>{cell.row.original.alternate_email ? cell.row.original.alternate_email : ""}</>
            }
            ,

            {
                accessorKey: 'address',
                header: 'Address',

                Cell: (cell) => <>{cell.row.original.address ? cell.row.original.address : ""}</>
            },
            {
                accessorKey: 'source',
                header: 'Lead Source',

                Cell: (cell) => <>{cell.row.original.lead_source ? cell.row.original.lead_source : ""}</>
            },
            {
                accessorKey: 'type',
                header: 'Lead Type',

                Cell: (cell) => <>{cell.row.original.lead_type ? cell.row.original.lead_type : ""}</>
            },
            {
                accessorKey: 'country',
                header: 'Country',

                Cell: (cell) => <>{cell.row.original.country ? cell.row.original.country : ""}</>
            },
            {
                accessorKey: 'visiting_card',
                header: 'Visiting Card',

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
        }), muiTableHeadCellProps: ({ column }) => ({
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
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ width: '100%' }}>
                <Stack direction={'row'} gap={1} sx={{ maxWidth: '100vw', height: 40, background: 'whitesmoke', p: 1, borderRadius: 1 }} className='scrollable-stack'>
                    {activitiesTopBarData && activitiesTopBarData.data && activitiesTopBarData.data.map((stage, index) => (
                        <Typography variant='h6' key={index} style={{ paddingLeft: '10px', fontSize: 11 }}>{toTitleCase(stage.stage)} - {stage.value}</Typography>
                    ))}
                </Stack>
                <Stack
                    sx={{ width: '100%' }}
                    pt={1}
                    direction="row"
                    alignItems={'center'}
                    justifyContent="space-between">
                    <Typography variant='h6'>Activities</Typography>

                    <Stack justifyContent={'right'} alignItems={'center'} direction={'row'} gap={1}>
                        < TextField
                            size="small"
                            type="date"
                            variant="filled"
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
                            variant="filled"
                            size="small"
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
                        {user?.assigned_users && user?.assigned_users.length > 0 && <Select
                            sx={{ m: 1, width: 300 }}
                            labelId="demo-multiple-name-label"
                            id="demo-multiple-name"
                            variant='filled'
                            value={stage}
                            onChange={(e) => {
                                setStage(e.target.value);
                            }}
                            size='small'
                        >
                            <MenuItem
                                key={'00'}
                                value={stage}
                                onChange={() => setStage('all')}
                            >
                                All
                            </MenuItem>
                            {stages.map((stage, index) => (
                                <MenuItem
                                    key={index}
                                    value={stage.label}
                                >
                                    {toTitleCase(stage.label)}
                                </MenuItem>
                            ))}
                        </Select>}

                        {user?.assigned_users && user?.assigned_users.length > 0 &&
                            < TextField
                                select

                                variant="filled"
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

                                        return (<option key={index} value={user.id}>
                                            {user.label}
                                        </option>)

                                    })
                                }
                            </TextField>}
                        <Tooltip title="Toogle Filter">
                            <Button color="inherit" variant='contained'
                                onClick={() => {
                                    if (table.getState().showColumnFilters)
                                        table.resetColumnFilters(true)
                                    table.setShowColumnFilters(!table.getState().showColumnFilters)
                                }
                                }
                            >
                                {table.getState().showColumnFilters ? <FilterAltOff sx={{ width: 30, height: 30 }} /> : <FilterAlt sx={{ width: 30, height: 30 }} />}
                            </Button>
                        </Tooltip>
                        <Tooltip title="Toogle FullScreen">
                            <Button color="inherit" variant='contained'
                                onClick={() => table.setIsFullScreen(!table.getState().isFullScreen)
                                }
                            >
                                {table.getState().isFullScreen ? <FullscreenExit sx={{ width: 30, height: 30 }} /> : <Fullscreen sx={{ width: 30, height: 30 }} />}
                            </Button>
                        </Tooltip>
                        <Tooltip title="Menu">
                            <Button color="inherit" variant='contained'
                                onClick={(e) => setAnchorEl(e.currentTarget)
                                }
                            >
                                <MenuIcon sx={{ width: 30, height: 30 }} />
                                <Typography pl={1}></Typography>
                            </Button>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Box>
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
       enableDensityToggle: false, initialState: { density: 'compact' },
        enableRowSelection: true,
        enableRowNumbers: true,
        enableColumnPinning: true,
        onSortingChange: setSorting,
        enableTableFooter: true,
        enableRowVirtualization: true,
        onColumnVisibilityChange: setColumnVisibility,
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




        const sorting = localStorage.getItem('mrt_sorting_table_1');


        if (columnVisibility) {
            setColumnVisibility(JSON.parse(columnVisibility));
        }



        if (columnSizing)
            setColumnSizing(JSON.parse(columnSizing))
        if (sorting) {
            setSorting(JSON.parse(sorting));
        }
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

            {remark && <ViewRemarksDialog dialog={dialog} setDialog={setDialog} id={remark.lead_id} />}
            {remark && <CreateOrEditRemarkDialog dialog={dialog} setDialog={setDialog} lead={remark ? {
                _id: remark.lead_id,
                has_card: remark.has_card,
                stage: remark.stage
            } : undefined} />}
            <MaterialReactTable table={table} />


        </>
    )
}

export default CrmActivitiesReportPage