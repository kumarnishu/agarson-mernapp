import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, ProductionChoiceActions } from '../../contexts/dialogContext'
import { Edit, RestartAlt } from '@mui/icons-material'
import { Fade, FormControlLabel, IconButton, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { GetDyes } from '../../services/ProductionServices'
import ToogleDyeDialog from '../../components/dialogs/production/ToogleDyeDialog'
import CreateOrEditDyeDialog from '../../components/dialogs/production/CreateOrEditDyeDialog'

import { AxiosResponse } from "axios"
import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import { BackendError } from "../.."
import { Button, CircularProgress, Snackbar } from "@mui/material"
import { Upload } from "@mui/icons-material"
import { BulkUploadDyes } from "../../services/ProductionServices"
import { GetDyeDto } from '../../dtos/dye.dto'

const FileInput = styled.input`
background:none;
color:blue;
`
function UploadDyesFromExcelButton() {
  const { mutate, isLoading, isSuccess, isError, error } = useMutation
    <AxiosResponse<any[]>, BackendError, FormData>
    (BulkUploadDyes)
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

export default function DyePage() {
  const [dye, setDye] = useState<GetDyeDto>()
  const [dyes, setDyes] = useState<GetDyeDto[]>([])
  const [hidden, setHidden] = useState(false)
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetDyeDto[]>, BackendError>(["dyes", hidden], async () => GetDyes(String(hidden)))


  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<GetDyeDto>[]>(
    //column definitions...
    () => dyes && [
      {
        accessorKey: 'actions',
        header: '',
        
        enableColumnFilter: false,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.assigned_permissions.includes('dye_edit') && <Tooltip title="Toogle">
                  <IconButton color="primary"

                    onClick={() => {
                      setDye(cell.row.original)
                      setChoice({ type: ProductionChoiceActions.toogle_dye })

                    }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('dye_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setDye(cell.row.original)
                      setChoice({ type: ProductionChoiceActions.create_or_edit_dye })
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
        accessorKey: 'active',
        header: 'Status',
      
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.active ? "active" : "inactive"}</>,
        filterSelectOptions: dyes && dyes.map((i) => {
          return i.active ? "active" : "inactive";
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'dye_number',
        header: 'Dye',
      
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.dye_number.toString() || "" ? cell.row.original.dye_number.toString() || "" : ""}</>,
        filterSelectOptions: dyes && dyes.map((i) => {
          return i.dye_number.toString() || "";
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'size',
        header: 'Size',
       
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.size ? cell.row.original.size : ""}</>,
        filterSelectOptions: dyes && dyes.map((i) => {
          return i.size;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'stdshoe_weight',
        header: 'St. Weight',
        
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.stdshoe_weight ? cell.row.original.stdshoe_weight : ""}</>,
        filterSelectOptions: dyes && dyes.map((i) => {
          return String(i.stdshoe_weight);
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'articles',
        header: 'Articles',
      
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.articles.toString() ? cell.row.original.articles.map((a) => { return a.label }).toString() : ""}</>,
        filterSelectOptions: dyes && dyes.map((i) => {
          return i.articles.toString();
        }).filter(onlyUnique)
      }
    ],
    [dyes],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: dyes, //10,000 rows       
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '62vh' }
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
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //optional
   
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });


  useEffect(() => {
    if (isSuccess) {
      setDyes(data.data);
    }
  }, [data, isSuccess]);
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
          Dyes
        </Typography>
        <Stack
          spacing={2}
          padding={1}
          direction="row"
          justifyContent="space-between"
          alignItems={'end'}
        >
          {LoggedInUser?.assigned_permissions.includes('dye_create') &&
            < UploadDyesFromExcelButton />}
          <FormControlLabel control={<Switch
            defaultChecked={Boolean(hidden)}
            onChange={() => setHidden(!hidden)}
          />} label="Show Inactive" />
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
            {LoggedInUser?.assigned_permissions.includes("dye_create") && <MenuItem
              onClick={() => {
                setDye(undefined)
                setAnchorEl(null)
                setChoice({ type: ProductionChoiceActions.create_or_edit_dye })
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_export') && < MenuItem onClick={() => {

              let data: { _id: string, dye: number, size: string, st_weight: number, articles: string }[] = []
              data = table.getRowModel().rows.map((row) => {
                return {
                  _id: row.original._id,
                  dye: row.original.dye_number,
                  size: row.original.size,
                  st_weight: row.original.stdshoe_weight,
                  articles: row.original.articles ? row.original.articles.map((a) => { return a.label }).toString() : ""
                }
              })
              ExportToExcel(data, "Exported Data")
            }
            }

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('dye_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => {
              let data: { _id: string, dye: number, size: string, st_weight: number, articles: string }[] = []
              data = table.getRowModel().rows.map((row) => {
                return {
                  _id: row.original._id,
                  dye: row.original.dye_number,
                  size: row.original.size,
                  st_weight: row.original.stdshoe_weight,
                  articles: row.original.articles ? row.original.articles.map((a) => { return a.label }).toString() : ""
                }
              })

              ExportToExcel(data, "Exported Data")
            }
            }

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>

        <CreateOrEditDyeDialog dye={dye} />
        {
          dye ?
            <>
              <ToogleDyeDialog dye={dye} />
            </>
            : null
        }
      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

