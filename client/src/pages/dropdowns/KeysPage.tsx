import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { KeyChoiceActions, ChoiceContext } from '../../contexts/dialogContext'
import { Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import { GetKeyDto } from '../../dtos'
import { GetAllKeys } from '../../services/KeyServices'
import CreateOrEditKeyDialog from '../../components/dialogs/keys/CreateOrEditKeyDialog'


export default function KeysPage() {
    const [key, setkey] = useState<GetKeyDto>()
    const [keys, setkeys] = useState<GetKeyDto[]>([])
    const { user: LoggedInUser } = useContext(UserContext)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetKeyDto[]>, BackendError>(["keys"], async () => GetAllKeys())

    const [sorting, setSorting] = useState<MRT_SortingState>([]);

    const { setChoice } = useContext(ChoiceContext)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const columns = useMemo<MRT_ColumnDef<GetKeyDto>[]>(
        //column definitions...
        () => keys && [
            {
                accessorKey: 'actions',
                header: '',
                maxSize: 50,
                size: 120,
                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row">
                            <>
                                {LoggedInUser?.assigned_permissions.includes('key_edit') && <Tooltip title="edit">
                                    <IconButton

                                        onClick={() => {
                                            setkey(cell.row.original)
                                            setChoice({ type: KeyChoiceActions.create_or_edit_key })
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
                accessorKey: 'key',
                header: 'Category',
                size: 350,
                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.key ? cell.row.original.key : ""}</>,
                filterSelectOptions: keys && keys.map((i) => {
                    return i.key;
                }).filter(onlyUnique)
            },

            {
                accessorKey: 'category.value',
                header: 'Category',
                size: 350,
                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.value : ""}</>
              
            },

        ],
        [keys],
        //end
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover',
        data: keys, //10,000 rows       
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
            setkeys(data.data);
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
                    Keys
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
                        {LoggedInUser?.assigned_permissions.includes("key_create") && <MenuItem
                            onClick={() => {
                                setkey(undefined)
                                setAnchorEl(null)
                                setChoice({ type: KeyChoiceActions.create_or_edit_key })
                            }}

                        > Add New</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('key_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export All</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('key_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export Selected</MenuItem>}

                    </Menu >
                    <CreateOrEditKeyDialog keyitm={key} />
                </>


            </Stack >

            {/* table */}
            <MaterialReactTable table={table} />
        </>

    )

}

