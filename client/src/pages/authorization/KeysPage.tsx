import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { KeyChoiceActions, ChoiceContext } from '../../contexts/dialogContext'
import { Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import { Menu as MenuIcon } from '@mui/icons-material';
import { BackendError } from '../..'
import ExportToExcel from '../../utils/ExportToExcel'
import { DropDownDto, GetKeyDto } from '../../dtos'
import { GetAllKeyCategoriesForDropdown, GetAllKeys } from '../../services/KeyServices'
import CreateOrEditKeyDialog from '../../components/dialogs/keys/CreateOrEditKeyDialog'
import AssignKeysDialog from '../../components/dialogs/keys/AssignKeysDialog'
import { toTitleCase } from '../../utils/TitleCase'
import { KeyExcelButton } from '../../components/buttons/KeyExcelButton'


export default function KeysPage() {
    const [key, setkey] = useState<GetKeyDto>()
    const [keys, setkeys] = useState<GetKeyDto[]>([])
    const [category, setKeyCategory] = useState<string>('all')
    const { user: LoggedInUser } = useContext(UserContext)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetKeyDto[]>, BackendError>(["keys", category], async () => GetAllKeys({ category: category }))
    const [flag, setFlag] = useState(1);
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [categories, setKeyCategorys] = useState<DropDownDto[]>([])
    const { setChoice } = useContext(ChoiceContext)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const { data: categoriesdata } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_categories"], async () => GetAllKeyCategoriesForDropdown({ show_assigned_only: false }))


    const columns = useMemo<MRT_ColumnDef<GetKeyDto>[]>(
        //column definitions...
        () => keys && [
            {
                accessorKey: 'actions',
                header: '',
                maxSize: 50,
                grow: false,
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
                accessorKey: 'serial_no',
                header: 'NO',
                minSize: 150,
                grow: false,
                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.serial_no ? cell.row.original.serial_no : ""}</>,
                filterSelectOptions: keys && keys.map((i) => {
                    return i.serial_no.toString();
                }).filter(onlyUnique)
            },
            {
                accessorKey: 'key',
                header: 'Key',
                minSize: 150,
                grow: false,
                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.key ? cell.row.original.key : ""}</>,
                filterSelectOptions: keys && keys.map((i) => {
                    return i.key;
                }).filter(onlyUnique)
            },
            {
                accessorKey: 'type',
                header: 'Type',
                minSize: 150,
                grow: false,
                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.type ? cell.row.original.type : ""}</>,
                filterSelectOptions: keys && keys.map((i) => {
                    return i.type;
                }).filter(onlyUnique)
            },
            {
                accessorKey: 'category.value',
                header: 'Category',
                minSize: 150,
                grow: false,
                Cell: (cell) => <>{cell.row.original.category ? cell.row.original.category.value : ""}</>

            },
            {
                accessorKey: 'assigned_users',
                header: 'Assigned Users',
                minSize: 350,
                grow: false,
                Cell: (cell) => <>{cell.row.original.assigned_users ? cell.row.original.assigned_users : ""}</>

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

    useEffect(() => {
        if (isSuccess && categoriesdata) {
            setKeyCategorys(categoriesdata.data);
        }
    }, [categoriesdata, isSuccess]);

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



                <Stack direction={'row'} gap={1} alignItems={'center'}>
                    < TextField
                        select
                        SelectProps={{
                            native: true
                        }}
                        id="state"
                        size="small"
                        label="Select Category"
                        sx={{ width: '200px' }}
                        value={category}
                        onChange={(e) => {
                            setKeyCategory(e.target.value);
                        }
                        }
                    >
                        <option key={0} value={'all'}>
                            Select Category
                        </option>
                        {
                            categories && categories.map(cat => {
                                return (<option key={cat.id} value={cat.id}>
                                    {cat && toTitleCase(cat.value||"")}
                                </option>)
                            })
                        }
                    </TextField>
                    {LoggedInUser?.assigned_permissions.includes('key_create') && <KeyExcelButton />}
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

                        {LoggedInUser?.assigned_permissions.includes('key_edit') && <MenuItem

                            onClick={() => {
                                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                                    alert("select some keys")
                                }
                                else {
                                    setChoice({ type: KeyChoiceActions.assign_keys })
                                    setkey(undefined)
                                    setFlag(1)
                                }
                                setAnchorEl(null)
                            }}
                        > Assign Users</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('key_edit') && <MenuItem

                            onClick={() => {
                                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                                    alert("select some keys")
                                }
                                else {
                                    setChoice({ type: KeyChoiceActions.assign_keys })
                                    setkey(undefined)
                                    setFlag(0)
                                }
                                setAnchorEl(null)
                            }}
                        > Remove Users</MenuItem>}

                        {LoggedInUser?.assigned_permissions.includes('key_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export All</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('key_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export Selected</MenuItem>}

                    </Menu >
                    <CreateOrEditKeyDialog keyitm={key} />
                </Stack>

                {<AssignKeysDialog flag={flag} keys={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
            </Stack >

            {/* table */}
            <MaterialReactTable table={table} />
        </>

    )

}

