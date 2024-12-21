import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import CreateOrEditStageDialog from '../../components/dialogs/crm/CreateOrEditStageDialog'
import DeleteCrmItemDialog from '../../components/dialogs/crm/DeleteCrmItemDialog'
import { UserContext } from '../../contexts/userContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { DropDownDto } from '../../dtos/dropdown.dto'
import FindUknownCrmStagesDialog from '../../components/dialogs/crm/FindUknownCrmStagesDialog'



export default function CrmStagesPage() {
  const [stage, setStage] = useState<DropDownDto>()
  const [stages, setStages] = useState<DropDownDto[]>([])

  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["stages"], async () => GetAllStages())


  const [dialog, setDialog] = useState<string | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<DropDownDto>[]>(
    //column definitions...
    () => stages && [
      {
        accessorKey: 'actions',
        header: '',

        Footer: <b></b>,
        Cell: ({ cell }) => <PopUp
          element={
            <Stack direction="row">
              <>

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('leadstage_delete') &&
                  <Tooltip title="delete">
                    <IconButton color="error"

                      onClick={() => {
                        setDialog('DeleteCrmItemDialog')
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
                      setDialog('CreateOrEditStageDialog')
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

        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.label ? cell.row.original.label : ""}</>,
        filterSelectOptions: stages && stages.map((i) => {
          return i.label;
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
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '65vh' }
    }), muiTableHeadCellProps: ({ column }) => ({
      sx: {
        '& div:nth-child(1) span': {
          display: (column.getIsFiltered() || column.getIsSorted()|| column.getIsGrouped())?'inline':'none', // Initially hidden
        },
        '& div:nth-child(2)': {
          display: (column.getIsFiltered() || column.getIsGrouped())?'inline-block':'none'
        },
        '&:hover div:nth-child(1) span': {
          display: 'inline', // Visible on hover
        },
        '&:hover div:nth-child(2)': {
          display: 'block', // Visible on hover
        }
      },
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
    onColumnVisibilityChange: setColumnVisibility, rowVirtualizerInstanceRef, //
    columnVirtualizerOptions: { overscan: 2 },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing, state: {
      isLoading: isLoading,
      columnVisibility,

      sorting,
      columnSizing: columnSizing
    }
  });
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
                setDialog('CreateOrEditStageDialog')
                setStage(undefined)
                setAnchorEl(null)
              }}

            > Add New</MenuItem>}

            {LoggedInUser?.assigned_permissions.includes('leadstage_create') && <MenuItem
              onClick={() => {
                setDialog('FindUknownCrmStagesDialog')
                setStage(undefined)
                setAnchorEl(null)
              }}

            >Find Unknown Stages</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('leadstage_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('leadstage_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <FindUknownCrmStagesDialog dialog={dialog} setDialog={setDialog} />
          <CreateOrEditStageDialog dialog={dialog} setDialog={setDialog} stage={stage} />
          <>
            {
              stage ?
                <>

                  <DeleteCrmItemDialog dialog={dialog} setDialog={setDialog} stage={stage ? { id: stage.id, label: stage.label } : undefined} />
                  <CreateOrEditStageDialog dialog={dialog} setDialog={setDialog} stage={stage} />
                  <DeleteCrmItemDialog dialog={dialog} setDialog={setDialog} stage={stage} />
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

