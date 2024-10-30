import { useContext, useEffect, useMemo, useState } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { GetReminderRemarks } from '../../services/LeadsServices'
import { BackendError } from '../..'
import { Box, DialogTitle, LinearProgress, Stack } from '@mui/material'

import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import { Comment, Visibility } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { GetActivitiesOrRemindersDto } from '../../dtos'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { onlyUnique } from '../../utils/UniqueArray'
import { DownloadFile } from '../../utils/DownloadFile'
import ViewRemarksDialog from '../../components/dialogs/crm/ViewRemarksDialog'
import CreateOrEditRemarkDialog from '../../components/dialogs/crm/CreateOrEditRemarkDialog'

function CrmReminderPage() {
  const [remarks, setRemarks] = useState<GetActivitiesOrRemindersDto[]>([])
  const [remark, setRemark] = useState<GetActivitiesOrRemindersDto>()
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<GetActivitiesOrRemindersDto[]>, BackendError>(["reminders"], async () => GetReminderRemarks())
  const { user: LoggedInUser } = useContext(UserContext)
  
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const { setChoice } = useContext(ChoiceContext)

  const columns = useMemo<MRT_ColumnDef<GetActivitiesOrRemindersDto>[]>(
    //column definitions...
    () => remarks && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        Footer: <b></b>,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>
              {LoggedInUser?.assigned_permissions.includes('reminders_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {

                    setChoice({ type: LeadChoiceActions.view_remarks })
                    setRemark(cell.row.original)


                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('reminders_create') &&
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
        accessorKey: 'stage',
        header: 'Stage',
        size: 80,
        Cell: (cell) => <>{cell.row.original.stage ? cell.row.original.stage : ""}</>
      },

      {
        accessorKey: 'remind_date',
        header: 'Next Call',
        size: 180,
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
        accessorKey: 'created_at',
        header: 'TimeStamp',
        size: 200,
        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '58vh' }
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
  useEffect(() => {
    if (isSuccess)
      setRemarks(data?.data)
  }, [remarks, isSuccess, data])

  return (
    <Box>
      {
        isLoading && <LinearProgress />
      }
      <DialogTitle sx={{ textAlign: 'center' }}>My Reminders - {remarks && remarks.length}</DialogTitle>
      {remark && <ViewRemarksDialog id={remark.lead_id} />}
      {remark && <CreateOrEditRemarkDialog lead={remark ? {
        _id: remark.lead_id,
        has_card: remark.has_card,
        stage: remark.stage
      } : undefined} />}
      <MaterialReactTable table={table} />
    </Box >
  )
}

export default CrmReminderPage