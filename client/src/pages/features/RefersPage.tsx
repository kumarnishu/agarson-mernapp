import { Delete, Edit, FilterAlt, FilterAltOff, Fullscreen, FullscreenExit, Search, Upload, Visibility } from '@mui/icons-material'
import { Button, Fade, IconButton, InputAdornment, LinearProgress, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { UserContext } from '../../contexts/userContext'
import DBPagination from '../../components/pagination/DBpagination';
import { BackendError } from '../..'
import { Menu as MenuIcon } from '@mui/icons-material';
import { ChoiceContext, LeadChoiceActions } from '../../contexts/dialogContext'
import CreateOrEditReferDialog from '../../components/dialogs/crm/CreateOrEditReferDialog'
import { GetReferDto } from '../../dtos'
import { MaterialReactTable, MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import PopUp from '../../components/popup/PopUp'
import { onlyUnique } from '../../utils/UniqueArray'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import AllReferralPageDialog from '../../components/dialogs/crm/AllReferralPageDialog'
import ViewReferRemarksDialog from '../../components/dialogs/crm/ViewReferRemarksDialog'
import { FuzzySearchRefers, GetPaginatedRefers } from '../../services/LeadsServices'
import CreateOrEditBillDialog from '../../components/dialogs/crm/CreateOrEditBillDialog'
import ViewRefersBillHistoryDialog from '../../components/dialogs/crm/ViewRefersBillHistoryDialog'
import MergeTwoRefersDialog from '../../components/dialogs/crm/MergeTwoRefersDialog'
import ExportToExcel from '../../utils/ExportToExcel'

import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import { BulkReferUpdateFromExcel } from "../../services/LeadsServices"
import {  Snackbar } from "@mui/material"
import { CreateOrEditReferFromExcelDto } from "../../dtos"

const FileInput = styled.input`
background:none;
color:blue;
`
function UploadRefersExcelButton() {
  const [leads, setLeads] = React.useState<CreateOrEditReferFromExcelDto[]>()
  const { data, mutate, isLoading, isSuccess, isError, error } = useMutation
    <AxiosResponse<CreateOrEditReferFromExcelDto[]>, BackendError, FormData>
    (BulkReferUpdateFromExcel)
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
    if (data) {
      setLeads(data.data)
    }
  }, [data, leads])

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
          <p style={{ color: 'blue', paddingTop: '10px' }}>processing...</p>
          :
          <>
            <Button
              size="small"
              color="inherit"
              variant="contained"
              component="label"
            >
              <Tooltip title="upload excel template">
                <Upload />
              </Tooltip>
              <FileInput
                id="upload_input"
                hidden
                type="file"
                name="file"
                onChange={
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


export default function RefersPage() {
  const [paginationData, setPaginationData] = useState({ limit: 20, page: 1, total: 1 });
  const [filter, setFilter] = useState<string | undefined>()
  const { user: LoggedInUser } = useContext(UserContext)
  const [refer, setRefer] = useState<GetReferDto>()
  const [refers, setRefers] = useState<GetReferDto[]>([])

  const [preFilteredData, setPreFilteredData] = useState<GetReferDto[]>([])
  const [preFilteredPaginationData, setPreFilteredPaginationData] = useState({ limit: 20, page: 1, total: 1 });
  const [filterCount, setFilterCount] = useState(0)
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const { data, isLoading, refetch, isRefetching } = useQuery<AxiosResponse<{
    result: GetReferDto[], page: number, total: number, limit: number
  }>, BackendError>(["refers"], async () => GetPaginatedRefers({ limit: paginationData?.limit, page: paginationData?.page }))


  const { data: fuzzyrefers, isLoading: isFuzzyLoading, refetch: refetchFuzzy, isFetching: isFuzzyRefetching } = useQuery<AxiosResponse<{
    result: GetReferDto[], page: number, total: number, limit: number
  }>, BackendError>(["fuzzyrefers", filter], async () => FuzzySearchRefers({ searchString: filter, limit: paginationData?.limit, page: paginationData?.page }), {
    enabled: false
  })

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);


  useEffect(() => {
    if (!filter) {
      setRefers(preFilteredData)
      setPaginationData(preFilteredPaginationData)
    }
  }, [filter])

  useEffect(() => {
    if (filter) {
      refetchFuzzy()
    }
  }, [paginationData])

  useEffect(() => {
    if (data && !filter) {
      setRefers(data.data.result)
      setPreFilteredData(data.data.result)
      setPreFilteredPaginationData({
        ...paginationData,
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total
      })
      setPaginationData({
        ...paginationData,
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total
      })
    }
  }, [data])

  useEffect(() => {
    if (fuzzyrefers && filter) {
      setRefers(fuzzyrefers.data.result)
      let count = filterCount
      if (count === 0)
        setPaginationData({
          ...paginationData,
          page: fuzzyrefers.data.page,
          limit: fuzzyrefers.data.limit,
          total: fuzzyrefers.data.total
        })
      count = filterCount + 1
      setFilterCount(count)
    }
  }, [fuzzyrefers])

  const columns = useMemo<MRT_ColumnDef<GetReferDto>[]>(
    //column definitions...
    () => refers && [
      {
        accessorKey: 'actions',
        header: '',
        enableColumnFilter: false,
        maxSize: 50,
        Footer: <b></b>,
        size: 120,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row" spacing={1}>

              {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('refer_delete') &&
                <Tooltip title="delete">
                  <IconButton color="error"

                    onClick={() => {
                      setChoice({ type: LeadChoiceActions.delete_crm_item })
                      setRefer(cell.row.original)

                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('create_refer_bills') && <Tooltip title="upload bill">
                <IconButton color="error"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.create_or_edit_bill })
                    setRefer(cell.row.original)

                  }}
                >
                  <Upload />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('view_refer_bills') && <Tooltip title="view bills">
                <IconButton color="primary"

                  onClick={() => {

                    setChoice({ type: LeadChoiceActions.view_bills })
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('refer_edit') && <Tooltip title="edit">
                <IconButton color="secondary"

                  onClick={() => {

                    setChoice({ type: LeadChoiceActions.create_or_edit_refer })
                    setRefer(cell.row.original)
                  }}

                >
                  <Edit />
                </IconButton>
              </Tooltip>}


              {LoggedInUser?.assigned_permissions.includes('refer_view') && <Tooltip title="view all refer refers">
                <IconButton color="inherit"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.view_referrals })
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('refer_view') && <Tooltip title="view remarks">
                <IconButton color="primary"

                  onClick={() => {
                    setChoice({ type: LeadChoiceActions.view_refer_remarks })
                    setRefer(cell.row.original)
                  }}
                >
                  <Visibility />
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
        filterSelectOptions: refers && refers.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'city',
        header: 'City',
        filterVariant: 'multi-select',
        size: 120,
        Cell: (cell) => <>{cell.row.original.city ? cell.row.original.city : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.city;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'state',
        header: 'State',
        filterVariant: 'multi-select',
        size: 120,
        Cell: (cell) => <>{cell.row.original.state ? cell.row.original.state : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.state;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'mobile',
        header: 'Mobile1',
        size: 120,
        Cell: (cell) => <>{cell.row.original.mobile ? cell.row.original.mobile : ""}</>
      }, {
        accessorKey: 'mobile2',
        header: 'Mobile2',
        size: 120,
        Cell: (cell) => <>{cell.row.original.mobile2 ? cell.row.original.mobile2 : ""}</>
      }, {
        accessorKey: 'mobile3',
        header: 'Mobile3',
        size: 120,
        Cell: (cell) => <>{cell.row.original.mobile3 ? cell.row.original.mobile3 : ""}</>
      },
      
      {
        accessorKey: 'last_remark',
        header: 'Remark',
        size: 350,
        Cell: (cell) => <>{cell.row.original.last_remark ? cell.row.original.last_remark : ""}</>,
      },
      
      {
        accessorKey: 'refers',
        header: 'Refers',
        size: 100,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.refers ? cell.row.original.refers.toString() : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.refers.toString();
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'customer_name',
        header: 'Customer Name',
        size: 180,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.customer_name ? cell.row.original.customer_name : ""}</>,
        filterSelectOptions: refers && refers.map((i) => {
          return i.customer_name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'gst',
        header: 'GST',
        size: 120,
        Cell: (cell) => <>{cell.row.original.gst ? cell.row.original.gst : ""}</>
      },

      {
        accessorKey: 'address',
        header: 'Address',
        size: 120,
        Cell: (cell) => <>{cell.row.original.address ? cell.row.original.address : ""}</>
      },

      {
        accessorKey: 'created_at',
        header: 'Created on',
        size: 120,
        Cell: (cell) => <>{cell.row.original.created_at ? cell.row.original.created_at : ""}</>
      },

      {
        accessorKey: 'created_by.label',
        header: 'Creator',
        size: 120,
        Cell: (cell) => <>{cell.row.original.created_by.label ? cell.row.original.created_by.label : ""}</>
      }
    ],
    [refers],
    //end
  );


  const table = useMaterialReactTable({
    columns,
    data: refers, columnFilterDisplayMode: 'popover', 
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
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
        direction="row"
        alignItems={'center'}
        justifyContent="space-between">

        <Typography variant="h6">Customers</Typography>
        <TextField
          sx={{ width: '40vw',p:0 }}
          size="small"
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
        <Stack justifyContent={'right'} direction={'row'} gap={1}>
          {LoggedInUser?.assigned_permissions.includes('leads_create') && <UploadRefersExcelButton />}
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
    positionToolbarAlertBanner: 'none',
    rowVirtualizerInstanceRef,
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.paper, //change default background color
    }),
    renderBottomToolbarCustomActions: () => (
      <DBPagination paginationData={paginationData} refetch={() => { filter ? refetchFuzzy() : refetch() }} setPaginationData={setPaginationData} />

    ),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '74vh' }
    }),
    muiTableBodyCellProps: () => ({
      sx: {
        border: '1px solid lightgrey;',
      },
    }),
    initialState: { density: 'compact' },
    enableRowSelection: true,
    enableRowNumbers: true,
    enableColumnPinning: true,
    onSortingChange: setSorting,
    enableTopToolbar: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    state: { sorting, isLoading: isLoading },
    enableBottomToolbar: true,
    enableGlobalFilter: false,
    manualPagination: true,
    enablePagination: false,
    enableToolbarInternalActions: false
  });
  useEffect(() => {
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);
  return (
    <>
      {
        isFuzzyLoading || isFuzzyRefetching && <LinearProgress color='secondary' />
      }
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
        {LoggedInUser?.assigned_permissions.includes('refer_create') && <MenuItem
          onClick={() => {
            setChoice({ type: LeadChoiceActions.create_or_edit_refer })
            setRefer(undefined);
            setAnchorEl(null)
          }}

        > Add New</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('refers_merge') && <MenuItem
          onClick={() => {
            if (table.getSelectedRowModel().rows.length == 2) {
              setChoice({ type: LeadChoiceActions.merge_refers })
              setRefer(undefined);
              setAnchorEl(null)
            } else {
              alert("please select two refers only");
              setRefer(undefined);
              setAnchorEl(null)
              return;
            }
          }
          }
        > Merge Refers</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('refer_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

        >Export All</MenuItem>}
        {LoggedInUser?.assigned_permissions.includes('refer_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

        >Export Selected</MenuItem>}
      </Menu>

      <CreateOrEditReferDialog refer={refer} />
      {table.getSelectedRowModel().rows.length == 2 && <MergeTwoRefersDialog refers={table.getSelectedRowModel().rows.map((l) => { return l.original })} removeSelectedRefers={() => { table.resetRowSelection() }} />}
      <>

        {
          refer ?
            <>

              <DeleteCrmItemDialog refer={refer ? { id: refer._id, label: refer.name, value: refer.name } : undefined} />
              <AllReferralPageDialog refer={refer} />
              <ViewReferRemarksDialog id={refer._id} />
              <CreateOrEditBillDialog refer={refer} bill={undefined} />
              <ViewRefersBillHistoryDialog id={refer._id} />
            </>
            : null
        }
      </>
      <MaterialReactTable table={table} />
    </>

  )

}

