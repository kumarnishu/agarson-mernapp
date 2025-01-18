import { BuildOutlined, Comment, Delete, Edit, FilterAlt, FilterAltOff, Search, Share, Visibility } from '@mui/icons-material'
import { Fade, IconButton, InputAdornment, LinearProgress, Menu, MenuItem, Select, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext'
import { toTitleCase } from '../../utils/TitleCase'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState,  MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import CreateOrEditLeadDialog from '../../components/dialogs/crm/CreateOrEditLeadDialog'
import MergeTwoLeadsDialog from '../../components/dialogs/crm/MergeTwoLeadsDialog'
import BulkDeleteUselessLeadsDialog from '../../components/dialogs/crm/BulkDeleteUselessLeadsDialog'
import { Menu as MenuIcon } from '@mui/icons-material';
import PopUp from '../../components/popup/PopUp'
import BackHandIcon from '@mui/icons-material/BackHand';
import CreateOrEditRemarkDialog from '../../components/dialogs/crm/CreateOrEditRemarkDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import ViewRemarksDialog from '../../components/dialogs/crm/ViewRemarksDialog'
import RemoveLeadReferralDialog from '../../components/dialogs/crm/RemoveLeadReferralDialog'
import ConvertLeadToReferDialog from '../../components/dialogs/crm/ConvertLeadToReferDialog'
import ReferLeadDialog from '../../components/dialogs/crm/ReferLeadDialog'
import { DownloadFile } from '../../utils/DownloadFile'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { Button, Tooltip } from "@mui/material"
import ExportToExcel from "../../utils/ExportToExcel"


import { DropdownService } from '../../services/DropDownServices'
import { LeadExcelButtons } from '../../components/buttons/LeadExcelButtons'
import { CrmService } from '../../services/CrmService'
import { GetLeadDto } from '../../dtos/CrmDto'
import { DropDownDto } from '../../dtos/DropDownDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'



export default function LeadsPage() {
  const [filter, setFilter] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [lead, setLead] = useState<GetLeadDto>()
  const [leads, setLeads] = useState<GetLeadDto[]>([])
  const [preFilteredData, setPreFilteredData] = useState<GetLeadDto[]>([])
  const [stage, setStage] = useState<string>("open");
  const [stages, setStages] = useState<DropDownDto[]>([])
  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
   const { data, isLoading, isRefetching, refetch } = useQuery<AxiosResponse<GetLeadDto[]>, BackendError>(["leads", stage], async () => new CrmService().GetLeads({ stage: stage }))

  const { data: stagedata, isSuccess: stageSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("crm_stages", new DropdownService().GetAllStages)

  const { data: fuzzyleads, isLoading: isFuzzyLoading, refetch: refetchFuzzy, isRefetching: isFuzzyRefetching } = useQuery<AxiosResponse<GetLeadDto[]>, BackendError>(["fuzzyleads"], async () => new CrmService().FuzzySearchLeads({ searchString: filter, stage: stage }), {
    enabled: false
  })

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})

  useEffect(() => {
    if (stageSuccess && stagedata.data) {
      let tmp: DropDownDto[] = stagedata.data;

      if (!LoggedInUser?.assigned_permissions.includes('show_leads_useless')) {
        tmp = tmp.filter((stage) => { return stage.label !== 'useless' })
      }
      if (!LoggedInUser?.assigned_permissions.includes('show_refer_leads')) {
        tmp = tmp.filter((stage) => { return stage.label !== 'refer' })
      }
      setStages(tmp)
    }
  }, [stageSuccess])

  useEffect(() => {
    if (!filter) {
      setLeads(preFilteredData)
    }
  }, [filter])


  useEffect(() => {
    if (data && !filter) {
      setLeads(data.data)
      setPreFilteredData(data.data)
    }
  }, [data])

  useEffect(() => {
    if (filter)
      refetchFuzzy()
    if (!filter)
      refetch()
  }, [stage])

  useEffect(() => {
    if (fuzzyleads && filter) {
      setLeads(fuzzyleads.data)
    }
  }, [fuzzyleads])

  const columns = useMemo<MRT_ColumnDef<GetLeadDto>[]>(
    () => leads && [
      {
        accessorKey: 'actions', enableColumnActions: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableGrouping: false,
        header: 'Actions',

        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>

              {cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('leads_edit') &&
                <Tooltip title="Remove Refrerral">
                  <IconButton color="error"

                    onClick={() => {
                      setDialog('RemoveLeadReferralDialog')
                      setLead(cell.row.original)

                    }}
                  >
                    <BackHandIcon />
                  </IconButton>
                </Tooltip>}
              {!cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('leads_edit') &&
                <Tooltip title="refer">
                  <IconButton color="primary"

                    onClick={() => {
                      setDialog('ReferLeadDialog')
                      setLead(cell.row.original)

                    }}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>}

              {!cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('leads_edit') &&
                <Tooltip title="convert to customer">
                  <IconButton color="primary"

                    onClick={() => {
                      setDialog('ConvertLeadToReferDialog')
                      setLead(cell.row.original)

                    }}
                  >
                    <BuildOutlined />
                  </IconButton>
                </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('leads_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {
                    setDialog('DeleteCrmItemDialog')
                    setLead(cell.row.original)

                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}








              {LoggedInUser?.assigned_permissions.includes('leads_edit') &&
                <Tooltip title="edit">
                  <IconButton color="secondary"

                    onClick={() => {
                      setDialog('CreateOrEditLeadDialog')
                      setLead(cell.row.original)
                    }}

                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('leads_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {

                    setDialog('ViewRemarksDialog')
                    setLead(cell.row.original)


                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('leads_edit') &&
                <Tooltip title="Add Remark">
                  <IconButton

                    color="success"
                    onClick={() => {
                      setDialog('CreateOrEditRemarkDialog')
                      setLead(cell.row.original)
                    }}
                  >
                    <Comment />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },

      {
        accessorKey: 'name',
        header: 'Name',

        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.name|| "" })} />,
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
     
      },
      {
        accessorKey: 'city',
        header: 'City',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.city || "" })} />,

        Cell: (cell) => <>{cell.row.original.city ? cell.row.original.city : ""}</>,
       
      },
      {
        accessorKey: 'state',
        header: 'State',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.state || "" })} />,

        Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
       
      },
      {
        accessorKey: 'stage',
        header: 'Stage',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.stage || "" })} />,
        Cell: (cell) => <>{cell.row.original.stage ? cell.row.original.stage : ""}</>
      },
      {
        accessorKey: 'mobile',
        header: 'Mobile1',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.mobile || "" })} />,
        Cell: (cell) => <>{cell.row.original.mobile ? cell.row.original.mobile : ""}</>
      }, {
        accessorKey: 'alternate_mobile1',
        header: 'Mobile2',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.alternate_mobile1 || "" })} />,
        Cell: (cell) => <>{cell.row.original.alternate_mobile1 ? cell.row.original.alternate_mobile1 : ""}</>
      }, {
        accessorKey: 'alternate_mobile2',
        header: 'Mobile3',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.city || "" })} />,
        Cell: (cell) => <>{cell.row.original.alternate_mobile2 ? cell.row.original.alternate_mobile2 : ""}</>
      },
      {
        accessorKey: 'last_remark',
        header: 'Last Remark',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.last_remark || "" })} />,
        Cell: (cell) => <>{cell.row.original.last_remark ? cell.row.original.last_remark : ""}</>
      },
      {
        accessorKey: 'customer_name',
        header: 'Customer',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.customer_name || "" })} />,
        Cell: (cell) => <>{cell.row.original.customer_name ? cell.row.original.customer_name : ""}</>
      }
      , {
        accessorKey: 'customer_designation',
        header: 'Designitaion',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.customer_designation || "" })} />,
        Cell: (cell) => <>{cell.row.original.customer_designation ? cell.row.original.customer_designation : ""}</>
      },
      {
        accessorKey: 'referred_party_name',
        header: 'Refer Party',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.referred_party_name || "" })} />,
        Cell: (cell) => <>{cell.row.original.referred_party_name ? cell.row.original.referred_party_name : ""}</>
      },
      {
        accessorKey: 'referred_party_mobile',
        header: 'Refer Mobile',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.referred_party_mobile || "" })} />,
        Cell: (cell) => <>{cell.row.original.referred_party_mobile ? cell.row.original.referred_party_mobile : ""}</>
      },
      {
        accessorKey: 'referred_date',
        header: 'Refer Date',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.referred_date || "" })} />,
        Cell: (cell) => <>{cell.row.original.referred_date ? cell.row.original.referred_date : ""}</>
      }
      ,
      {
        accessorKey: 'email',
        header: 'Email',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.email || "" })} />,
        Cell: (cell) => <>{cell.row.original.email ? cell.row.original.email : ""}</>
      }
      ,
      {
        accessorKey: 'alternate_email',
        header: 'Email2',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.alternate_email || "" })} />,
        Cell: (cell) => <>{cell.row.original.alternate_email ? cell.row.original.alternate_email : ""}</>
      }
      ,

      {
        accessorKey: 'address',
        header: 'Address',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.address || "" })} />,
        Cell: (cell) => <>{cell.row.original.address ? cell.row.original.address : ""}</>
      },
      {
        accessorKey: 'source',
        header: 'Lead Source',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.lead_source || "" })} />,
        Cell: (cell) => <>{cell.row.original.lead_source ? cell.row.original.lead_source : ""}</>
      },
      {
        accessorKey: 'type',
        header: 'Lead Type',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.lead_type || "" })} />,
        Cell: (cell) => <>{cell.row.original.lead_type ? cell.row.original.lead_type : ""}</>
      },
      {
        accessorKey: 'country',
        header: 'Country',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.country || "" })} />,
        Cell: (cell) => <>{cell.row.original.country ? cell.row.original.country : ""}</>
      },
      {
        accessorKey: 'created_at',
        header: 'Created on',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.created_at || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated on',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.updated_at || "" })} />,
        Cell: (cell) => <>{cell.row.original.updated_at ? cell.row.original.updated_at : ""}</>
      },
      {
        accessorKey: 'created_by.label',
        accessorFn: (row) => { return row.created_by.label },
        header: 'Creator',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.created_by.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
      },
      {
        accessorKey: 'updated_by.label',
        header: 'Updated By',
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={leads.map((item) => { return item.updated_by.label || "" })} />,
        Cell: (cell) => <>{cell.row.original.updated_by.label ? cell.row.original.updated_by.label : ""}</>
      },
      {
        accessorKey: 'visiting_card',
        header: 'Visiting Card',
        enableColumnFilter: false,
        Cell: (cell) => <span onDoubleClick={() => {
          if (cell.row.original.visiting_card && cell.row.original.visiting_card) {
            DownloadFile(cell.row.original.visiting_card, 'visiting card')
          }
        }}>
          {cell.row.original.visiting_card && cell.row.original.visiting_card ? < img height="20" width="55" src={cell.row.original.visiting_card && cell.row.original.visiting_card} alt="visiting card" /> : "na"}</span>
      },
    ],
    [leads],
  );

  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: leads, //10,000 rows       
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),

    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '70vh' }
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
    onColumnVisibilityChange: setColumnVisibility,  //optional

    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });


  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_LeadsPage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_LeadsPage',
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
      'mrt_columnVisibility_LeadsPage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_LeadsPage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_LeadsPage', JSON.stringify(columnSizing));
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
        direction="row"
        alignItems={'center'}
        justifyContent="space-between">

        <Typography variant="h6">Leads</Typography>
        <TextField
          sx={{ width: '40vw' }}
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

        <Select
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
            value={'all'}
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
        </Select>
        <Stack justifyContent={'right'} direction={'row'} gap={1}>
          {LoggedInUser?._id === LoggedInUser?.created_by.id && LoggedInUser?.assigned_permissions.includes('leads_delete') &&
            <Button variant='contained' color='error'

              onClick={() => {
                let data: any[] = [];
                data = table.getSelectedRowModel().rows.filter((lead) => { return lead.original.stage === 'useless' })
                if (data.length == 0)
                  alert("select some useless leads")
                else
                  setDialog('BulkDeleteUselessLeadsDialog')
              }}
            >
              <Delete />
            </Button>}
          {LoggedInUser?.role == "admin" && LoggedInUser?.assigned_permissions.includes('leads_export') && <Tooltip title="Export">
            <LeadExcelButtons />
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
          {LoggedInUser?.assigned_permissions.includes('leads_create') && <MenuItem
            onClick={() => {
              setDialog('CreateOrEditLeadDialog')
              setLead(undefined);
              setAnchorEl(null)
            }}


          > Add New</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('leads_merge') && <MenuItem
            onClick={() => {
              if (table.getSelectedRowModel().rows.length == 2) {
                setDialog('MergeTwoLeadsDialog')
                setLead(undefined);
                setAnchorEl(null)
              } else {
                alert("please select two leads only");
                setLead(undefined);
                setAnchorEl(null)
                return;
              }
            }
            }
          > Merge Leads</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('leads_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export All</MenuItem>}
          {LoggedInUser?.assigned_permissions.includes('leads_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

          >Export Selected</MenuItem>}

        </Menu >
        <CreateOrEditLeadDialog dialog={dialog} setDialog={setDialog} lead={lead} />
        {table.getSelectedRowModel().rows.length == 2 && <MergeTwoLeadsDialog dialog={dialog} setDialog={setDialog} leads={table.getSelectedRowModel().rows.map((l) => { return l.original })} removeSelectedLeads={() => { table.resetRowSelection() }} />}
        {table.getSelectedRowModel().rows && table.getSelectedRowModel().rows.length > 0 && <BulkDeleteUselessLeadsDialog dialog={dialog} setDialog={setDialog} selectedLeads={table.getSelectedRowModel().rows.map((l) => { return l.original })} removeSelectedLeads={() => { table.resetRowSelection() }} />}
      </>
      {
        lead ?
          <>
            <CreateOrEditRemarkDialog dialog={dialog} setDialog={setDialog} lead={lead ? {
              _id: lead._id,
              has_card: lead.has_card,
              stage: lead.stage
            } : undefined} />
            <DeleteCrmItemDialog dialog={dialog} setDialog={setDialog} lead={lead ? { id: lead._id, label: lead.name } : undefined} />
            <ViewRemarksDialog dialog={dialog} setDialog={setDialog} id={lead._id} />
            <ReferLeadDialog dialog={dialog} setDialog={setDialog} lead={lead} />
            <RemoveLeadReferralDialog dialog={dialog} setDialog={setDialog} lead={lead} />
            <ConvertLeadToReferDialog dialog={dialog} setDialog={setDialog} lead={lead} />

          </>
          : null
      }
      <MaterialReactTable table={table} />

    </>

  )

}