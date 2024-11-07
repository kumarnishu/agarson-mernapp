import { Fade, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import moment from 'moment'
import { GetLeadDto } from '../../dtos'
import PopUp from '../../components/popup/PopUp'
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import { BuildOutlined, Comment, Delete, Edit, Share, Upload, Visibility } from '@mui/icons-material'
import { UserContext } from '../../contexts/userContext'
import CreateOrEditRemarkDialog from '../../components/dialogs/crm/CreateOrEditRemarkDialog'
import ViewRemarksDialog from '../../components/dialogs/crm/ViewRemarksDialog'
import { DownloadFile } from '../../utils/DownloadFile'
import { GetAssignedRefers } from '../../services/LeadsServices'
import BackHandIcon from '@mui/icons-material/BackHand';
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import ReferLeadDialog from '../../components/dialogs/crm/ReferLeadDialog'
import RemoveLeadReferralDialog from '../../components/dialogs/crm/RemoveLeadReferralDialog'
import ConvertLeadToReferDialog from '../../components/dialogs/crm/ConvertLeadToReferDialog'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import CreateOrEditBillDialog from '../../components/dialogs/crm/CreateOrEditBillDialog'
import ViewLeadsBillHistoryDialog from '../../components/dialogs/crm/ViewLeadsBillHistoryDialog'
import CreateOrEditLeadDialog from '../../components/dialogs/crm/CreateOrEditLeadDialog'

export default function AssignedReferReportPage() {
  const [leads, setLeads] = useState<GetLeadDto[]>([])
  const [lead, setLead] = useState<GetLeadDto>()
  const [dates, setDates] = useState<{ start_date?: string, end_date?: string }>({
    start_date: moment(new Date(new Date().setDate(1)).setFullYear(2023)).format("YYYY-MM-DD")
    , end_date: moment(new Date().setDate(30)).format("YYYY-MM-DD")
  })
  const { setChoice } = useContext(ChoiceContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetLeadDto[]>, BackendError>(["assign_refer_reports", dates.start_date, dates.end_date], async () => GetAssignedRefers({ start_date: dates.start_date, end_date: dates.end_date }))
  const { user: LoggedInUser } = useContext(UserContext)
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetLeadDto>[]>(
    //column definitions...
    () => leads && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>

              {cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="Remove Refrerral">
                  <IconButton color="error"

                    onClick={() => {

                      setChoice({ type: LeadChoiceActions.remove_referral })
                      setLead(cell.row.original)

                    }}
                  >
                    <BackHandIcon />
                  </IconButton>
                </Tooltip>}
              {!cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="refer">
                  <IconButton color="primary"

                    onClick={() => {

                      setChoice({ type: LeadChoiceActions.refer_lead })
                      setLead(cell.row.original)

                    }}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>}

              {!cell.row.original.referred_party_name && LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="convert to refer">
                  <IconButton color="primary"

                    onClick={() => {

                      setChoice({ type: LeadChoiceActions.convert_lead_to_refer })
                      setLead(cell.row.original)

                    }}
                  >
                    <BuildOutlined />
                  </IconButton>
                </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('assignedrefer_delete') && <Tooltip title="delete">
                <IconButton color="error"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.delete_crm_item })
                    setLead(cell.row.original)

                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('create_lead_bills') && <Tooltip title="upload bill">
                <IconButton color="error"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.create_or_edit_bill })
                    setLead(cell.row.original)

                  }}
                >
                  <Upload />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('view_lead_bills') && <Tooltip title="view bills">
                <IconButton color="primary"

                  onClick={() => {

                    setChoice({ type: LeadChoiceActions.view_bills })
                    setLead(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="edit">
                  <IconButton color="secondary"

                    onClick={() => {

                      setChoice({ type: LeadChoiceActions.create_or_edit_lead })
                      setLead(cell.row.original)
                    }}

                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('assignedrefer_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {

                    setChoice({ type: LeadChoiceActions.view_remarks })
                    setLead(cell.row.original)


                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('assignedrefer_edit') &&
                <Tooltip title="Add Remark">
                  <IconButton

                    color="success"
                    onClick={() => {

                      setChoice({ type: LeadChoiceActions.create_or_edt_remark })
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
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: leads && leads.map((i) => {
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
        accessorKey: 'uploaded_bills',
        header: 'Uploaded Bills',
        size: 120,
        Cell: (cell) => <>{cell.row.original.uploaded_bills ? cell.row.original.uploaded_bills : ""}</>
      },
      
      {
        accessorKey: 'last_remark',
        header: 'Remark',
        size: 320,
        Cell: (cell) => <>{cell.row.original.last_remark ? cell.row.original.last_remark : ""}</>
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
        filterSelectOptions: leads && leads.map((i) => {
          return i.city;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'state',
        header: 'State',
        filterVariant: 'multi-select',
        size: 120,
        Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
        filterSelectOptions: leads && leads.map((i) => {
          return i.state;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'stage',
        header: 'Stage',
        size: 120,
        Cell: (cell) => <>{cell.row.original.stage ? cell.row.original.stage : ""}</>
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
        accessorKey: 'created_at',
        header: 'Created on',
        size: 120,
        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated on',
        size: 120,
        Cell: (cell) => <>{cell.row.original.updated_at ? cell.row.original.updated_at : ""}</>
      },
      {
        accessorKey: 'created_by.label',
        header: 'Creator',
        size: 120,
        Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
      },
      {
        accessorKey: 'updated_by.label',
        header: 'Updated By',
        size: 120,
        Cell: (cell) => <>{cell.row.original.updated_by.label ? cell.row.original.updated_by.label : ""}</>
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
    [leads],
    //end
  );



  useEffect(() => {
    if (isSuccess) {
      setLeads(data.data);
    }
  }, [isSuccess]);


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
    onSortingChange: setSorting,
    state: { isLoading, sorting }
  });

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
          Assigned Refers : {leads && leads.length}
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
            {LoggedInUser?.assigned_permissions.includes('assignedrefer_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('assignedrefer_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >

        </>


      </Stack >

      {
        lead ?
          <>
            <CreateOrEditRemarkDialog lead={lead ? {
              _id: lead._id,
              has_card: lead.has_card,
              stage: lead.stage
            } : undefined} />
            <DeleteCrmItemDialog lead={lead ? { id: lead._id, value: lead.name, label: lead.name } : undefined} />
            <ViewRemarksDialog id={lead._id} />
            <ReferLeadDialog lead={lead} />
            <RemoveLeadReferralDialog lead={lead} />
            <CreateOrEditLeadDialog lead={lead} />
            <ConvertLeadToReferDialog lead={lead} />
            <CreateOrEditBillDialog lead={lead} bill={undefined} />
            <ViewLeadsBillHistoryDialog id={lead._id} />
          </>
          : null
      }
      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

