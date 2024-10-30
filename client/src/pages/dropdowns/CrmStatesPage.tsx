import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import CreateOrEditStateDialog from '../../components/dialogs/crm/CreateOrEditStateDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { GetAllStates } from '../../services/LeadsServices'
import FindUknownCrmStatesDialog from '../../components/dialogs/crm/FindUknownCrmStatesDialog'
import { GetCrmStateDto } from '../../dtos'
import AssignCrmStatesDialog from '../../components/dialogs/crm/AssignCrmStatesDialog'
import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import { Button, CircularProgress, Snackbar } from "@mui/material"
import { Upload } from "@mui/icons-material"
import { BulkCrmStateUpdateFromExcel } from "../../services/LeadsServices"
import ExportToExcel from "../../utils/ExportToExcel"

const FileInput = styled.input`
background:none;
color:blue;
`
function UploadCRMStatesFromExcelButton() {
  const { data, mutate, isLoading, isSuccess, isError, error } = useMutation
    <AxiosResponse<any[]>, BackendError, FormData>
    (BulkCrmStateUpdateFromExcel)
  const [file, setFile] = React.useState<File | null>(null)


  function handleFile() {
    if (file) {
      let formdata = new FormData()
      formdata.append('file', file)
      mutate(formdata)
    }
  }
  React.useEffect(() => {
    if (file) {
      handleFile()
    }
  }, [file])

  React.useEffect(() => {
    if (isSuccess) {
      if (data.data.length > 0)
        ExportToExcel(data.data, "upload_output")
    }
  }, [isSuccess])

  return (
    <>

      <Snackbar
        open={isSuccess}
        autoHideDuration={6000}
        onClose={() => setFile(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Uploaded Successfuly wait for some minutes"
      />

      <Snackbar
        open={isError}
        autoHideDuration={6000}
        onClose={() => setFile(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={error?.response.data.message}
      />
      {
        isLoading ?
          <CircularProgress />
          :
          <>
            <Button
              component="label"

            >
              <Upload />
              <FileInput
                id="upload_input"
                hidden
                type="file" required name="file" onChange={
                  (e: any) => {
                    if (e.currentTarget.files) {
                      setFile(e.currentTarget.files[0])
                    }
                  }}>
              </FileInput >
            </Button>
          </>
      }
    </>
  )
}


export default function CrmStatesPage() {
  const [state, setState] = useState<GetCrmStateDto>()
  const [states, setStates] = useState<GetCrmStateDto[]>([])
  const [flag, setFlag] = useState(1);
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>(["crm_states"], async () => GetAllStates())

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetCrmStateDto>[]>(
    //column definitions...
    () => states && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        Footer: <b></b>,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('states_delete') &&
                  <Tooltip title="delete">
                    <IconButton color="error"

                      onClick={() => {
                        setChoice({ type: LeadChoiceActions.delete_crm_item })
                        setState(cell.row.original)

                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                }
                {LoggedInUser?.assigned_permissions.includes('states_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setState(cell.row.original)
                      setChoice({ type: LeadChoiceActions.create_or_edit_state })
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
        accessorKey: 'state',
        header: 'State',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
        filterSelectOptions: states && states.map((i) => {
          return i.state;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'assigned_users',
        header: 'Assigned Users',
        size: 650,
        filterVariant: 'text',
        Cell: (cell) => <>{cell.row.original.assigned_users && cell.row.original.assigned_users.length > 0 ? cell.row.original.assigned_users : ""}</>,
      }
    ],
    [states, data],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: states, //10,000 rows     
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
      setStates(data.data);
    }
  }, [isSuccess, data]);


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
          States : {states && states.length}
        </Typography>

        <>

          {LoggedInUser?.assigned_permissions.includes('states_create') && <UploadCRMStatesFromExcelButton />}

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
            {LoggedInUser?.assigned_permissions.includes('states_create') && <MenuItem

              onClick={() => {
                setChoice({ type: LeadChoiceActions.create_or_edit_state })
                setState(undefined)
                setAnchorEl(null)
              }}
            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some states")
                }
                else {
                  setChoice({ type: LeadChoiceActions.bulk_assign_crm_states })
                  setState(undefined)
                  setFlag(1)
                }
                setAnchorEl(null)
              }}
            > Assign States</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some states")
                }
                else {
                  setChoice({ type: LeadChoiceActions.bulk_assign_crm_states })
                  setState(undefined)
                  setFlag(0)
                }
                setAnchorEl(null)
              }}
            > Remove States</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_create') && <MenuItem
              sx={{ color: 'red' }}

              onClick={() => {
                setChoice({ type: LeadChoiceActions.find_unknown_states })
                setState(undefined)
                setAnchorEl(null)
              }}
            > Find Unknown States</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('states_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditStateDialog />
          {LoggedInUser?.is_admin && <FindUknownCrmStatesDialog />}
          {<AssignCrmStatesDialog flag={flag} states={table.getSelectedRowModel().rows.map((item) => { return  item.original})} />}
          <>
            {
              state ?
                <>

                  <DeleteCrmItemDialog state={state} />
                  <CreateOrEditStateDialog state={state} />
                  <DeleteCrmItemDialog state={state} />
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

