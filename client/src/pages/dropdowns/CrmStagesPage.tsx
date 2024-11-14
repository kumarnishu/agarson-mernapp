import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import CreateOrEditStageDialog from '../../components/dialogs/crm/CreateOrEditStageDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem,  Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { DropDownDto } from '../../dtos'
import { GetAllStages } from '../../services/LeadsServices'
import FindUknownCrmStagesDialog from '../../components/dialogs/crm/FindUknownCrmStagesDialog'



export default function CrmStagesPage() {
  const [stage, setStage] = useState<DropDownDto>()
  const [stages, setStages] = useState<DropDownDto[]>([])

  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["stages"], async () => GetAllStages())

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<DropDownDto>[]>(
    //column definitions...
    () => stages && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        Footer: <b></b>,
        grow:false,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('leadstage_delete') &&
                  <Tooltip title="delete">
                    <IconButton color="error"

                      onClick={() => {
                        setChoice({ type: LeadChoiceActions.delete_crm_item })
                        setStage(cell.row.original)

                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                }
                {LoggedInUser?.assigned_permissions.includes('leadstage_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setStage(cell.row.original)
                      setChoice({ type: LeadChoiceActions.create_or_edit_stage })
                    }}

                  >
                    <Edit />
                  </IconButton>
                </Tooltip>}

              </>

            </Stack>}
        />
      },

      {
        accessorKey: 'label',
        header: 'Stage',
        minSize: 350,
        grow:false,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.value ? cell.row.original.value : ""}</>,
        filterSelectOptions: stages && stages.map((i) => {
          return i.value;
        }).filter(onlyUnique)
      }
    ],
    [stages],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover', 
    data: stages, //10,000 rows       
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


  useEffect(() => {
    if (isSuccess) {
      setStages(data.data);
    }
  }, [isSuccess]);


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
          Stages : {stages && stages.length}
        </Typography>

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
            {LoggedInUser?.assigned_permissions.includes('leadstage_create') && <MenuItem
              onClick={() => {
                setChoice({ type: LeadChoiceActions.create_or_edit_stage })
                setStage(undefined)
                setAnchorEl(null)
              }}

            > Add New</MenuItem>}

            {LoggedInUser?.assigned_permissions.includes('leadstage_create') && <MenuItem
              onClick={() => {
                setChoice({ type: LeadChoiceActions.find_unknown_stages })
                setStage(undefined)
                setAnchorEl(null)
              }}

            >Find Unknown Stages</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('leadstage_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('leadstage_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <FindUknownCrmStagesDialog />
          <CreateOrEditStageDialog stage={stage} />
          <>
            {
              stage ?
                <>

                  <DeleteCrmItemDialog stage={stage ? { id: stage.id, label: stage.label, value: stage.value } : undefined} />
                  <CreateOrEditStageDialog stage={stage} />
                  <DeleteCrmItemDialog stage={stage} />
                </>
                : null
            }
          </>
        </>


      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

