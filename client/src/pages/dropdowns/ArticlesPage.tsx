import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, ProductionChoiceActions } from '../../contexts/dialogContext'
import { Edit, RestartAlt } from '@mui/icons-material'
import { Fade, FormControlLabel, IconButton, Menu, MenuItem, Switch, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { GetArticleDto } from '../../dtos'
import { GetArticles } from '../../services/ProductionServices'
import CreateOrEditArticleDialog from '../../components/dialogs/production/CreateOrEditArticleDialog'
import ToogleArticleDialog from '../../components/dialogs/production/ToogleArticleDialog'
import React from "react"
import { useMutation } from "react-query"
import { styled } from "styled-components"
import { Button, CircularProgress, Snackbar } from "@mui/material"
import { Upload } from "@mui/icons-material"
import { BulkUploadArticles } from "../../services/ProductionServices"


const FileInput = styled.input`
background:none;
color:blue;
`
function UploadArticlesFromExcelButton() {
  const { mutate, isLoading, isSuccess, isError, error } = useMutation
    <AxiosResponse<any[]>, BackendError, FormData>
    (BulkUploadArticles)
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


export default function ArticlePage() {
  const [article, setArticle] = useState<GetArticleDto>()
  const [articles, setArticles] = useState<GetArticleDto[]>([])
  const [hidden, setHidden] = useState(false)
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetArticleDto[]>, BackendError>(["articles", hidden], async () => GetArticles(String(hidden)))

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetArticleDto>[]>(
    //column definitions...
    () => articles && [
      {
        accessorKey: 'actions',
        header: '',
        maxSize: 50,
        enableColumnFilter: false,
        grow:false,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.assigned_permissions.includes('article_edit') && <Tooltip title="Toogle">
                  <IconButton color="primary"

                    onClick={() => {
                      setArticle(cell.row.original)
                      setChoice({ type: ProductionChoiceActions.toogle_article })

                    }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>}

                {LoggedInUser?.assigned_permissions.includes('article_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setArticle(cell.row.original)
                      setChoice({ type: ProductionChoiceActions.create_or_edit_article })
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
        minSize: 120,
        grow:false,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.active ? "active" : "inactive"}</>,
        filterSelectOptions: articles && articles.map((i) => {
          return i.active ? "active" : "inactive";
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'name',
        header: 'Name',
        minSize: 220,
        grow:false,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: articles && articles.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'display_name',
        header: 'Display Name',
        minSize: 220,
        grow:false,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.display_name ? cell.row.original.display_name : ""}</>,
        filterSelectOptions: articles && articles.map((i) => {
          return i.display_name;
        }).filter(onlyUnique)
      }
    ],
    [articles],
    //end
  );

console.log(article)
  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover', 
    data: articles, //10,000 rows       
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
    onSortingChange: setSorting,
    state: { isLoading, sorting }
  });


  useEffect(() => {
    if (isSuccess) {
      setArticles(data.data);
    }
  }, [data, isSuccess]);


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
          Articles
        </Typography>
        <Stack
          spacing={2}
          padding={1}
          direction="row"
          justifyContent="space-between"
          alignItems={'end'}
        >
          {LoggedInUser?.assigned_permissions.includes('article_create') &&
            < UploadArticlesFromExcelButton />}
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
            {LoggedInUser?.assigned_permissions.includes("article_create") && <MenuItem
              onClick={() => {
                setArticle(undefined)
                setAnchorEl(null)
                setChoice({ type: ProductionChoiceActions.create_or_edit_article })
              }}

            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('article_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('article_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
        </Stack>

        <CreateOrEditArticleDialog article={article} />

        {article && <ToogleArticleDialog article={article} />}

      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

