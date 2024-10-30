import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_SortingState, useMaterialReactTable } from 'material-react-table'
import { onlyUnique } from '../../utils/UniqueArray'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, ProductionChoiceActions } from '../../contexts/dialogContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import { DropDownDto } from '../../dtos'
import { GetMachineCategories } from '../../services/ProductionServices'
import DeleteProductionItemDialog from '../../components/dialogs/production/DeleteProductionItemDialog'
import CreateOrEditMachineCategoryDialog from '../../components/dialogs/production/CreateOrEditCategoryDialog'



export default function MachineCategoryPage() {
    const [category, setCategory] = useState<DropDownDto>()
    const [categories, setCategories] = useState<DropDownDto[]>([])

    const { user: LoggedInUser } = useContext(UserContext)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["machine_categories"], async () => GetMachineCategories())

    const [sorting, setSorting] = useState<MRT_SortingState>([]);

    const { setChoice } = useContext(ChoiceContext)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const columns = useMemo<MRT_ColumnDef<DropDownDto>[]>(
        //column definitions...
        () => categories && [
            {
                accessorKey: 'actions',
                header: '',
                maxSize: 50,
                size: 120,
                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row">
                            <>

                                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('machine_category_delete') &&
                                    <Tooltip title="delete">
                                        <IconButton color="error"

                                            onClick={() => {
                                                setChoice({ type: ProductionChoiceActions.delete_production_item })
                                                setCategory(cell.row.original)

                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                }
                                {LoggedInUser?.assigned_permissions.includes('machine_category_edit') && <Tooltip title="edit">
                                    <IconButton

                                        onClick={() => {
                                            setCategory(cell.row.original)
                                            setChoice({ type: ProductionChoiceActions.create_or_edit_machine_category })
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
                header: 'Category',
                size: 350,
                filterVariant: 'multi-select',
                Cell: (cell) => <>{cell.row.original.value ? cell.row.original.value : ""}</>,
                filterSelectOptions: categories && categories.map((i) => {
                    return i.value;
                }).filter(onlyUnique)
            }
        ],
        [categories],
        //end
    );


    const table = useMaterialReactTable({
        columns, columnFilterDisplayMode: 'popover', 
        data: categories, //10,000 rows       
        enableColumnResizing: true,
        enableColumnVirtualization: true, enableStickyFooter: true,
        muiTableFooterRowProps: () => ({
            sx: {
                backgroundColor: 'whitesmoke',
                color: 'white',
            }
        }),
        muiTableContainerProps: (table) => ({
            sx: { height: table.table.getState().isFullScreen ? '62vh' : '68vh' }
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
            setCategories(data.data);
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
                    Machine Categories
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
                        {LoggedInUser?.assigned_permissions.includes("machine_category_create") && <MenuItem
                            onClick={() => {
                                setCategory(undefined)
                                setAnchorEl(null)
                                setChoice({ type: ProductionChoiceActions.create_or_edit_machine_category })
                            }}

                        > Add New</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('machine_category_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export All</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('machine_category_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export Selected</MenuItem>}

                    </Menu >
                    <CreateOrEditMachineCategoryDialog machine_category={category} />
                    <>
                        {
                            category ?
                                <>
                                    <DeleteProductionItemDialog category={category} />
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

