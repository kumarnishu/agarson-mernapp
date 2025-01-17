import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import PopUp from '../../components/popup/PopUp'
import ExportToExcel from '../../utils/ExportToExcel'
import { Menu as MenuIcon } from '@mui/icons-material';
import DeleteProductionItemDialog from '../../components/dialogs/dropdown/DeleteProductionItemDialog'
import CreateOrEditMachineCategoryDialog from '../../components/dialogs/dropdown/CreateOrEditCategoryDialog'
import { DropdownService } from '../../services/DropDownServices'
import { DropDownDto } from '../../dtos/DropDownDto'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'



export default function MachineCategoryPage() {
    const [category, setCategory] = useState<DropDownDto>()
    const [categories, setCategories] = useState<DropDownDto[]>([])

    const { user: LoggedInUser } = useContext(UserContext)
    const { data, isLoading, isSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["machine_categories"], async () => new DropdownService().GetMachineCategories())


    const isFirstRender = useRef(true);
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
    const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
    const [dialog, setDialog] = useState<string | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const columns = useMemo<MRT_ColumnDef<DropDownDto>[]>(
        //column definitions...
        () => categories && [
            {
                accessorKey: 'actions', enableColumnActions: false,
                enableColumnFilter: false,
                enableSorting: false,
                enableGrouping: false,
                header: 'Actions',

                Cell: ({ cell }) => <PopUp
                    element={
                        <Stack direction="row">
                            <>

                                {LoggedInUser?.role == "admin" && LoggedInUser.assigned_permissions.includes('machine_category_delete') &&
                                    <Tooltip title="delete">
                                        <IconButton color="error"

                                            onClick={() => {
                                                setDialog('DeletePaymentsCategoryDialog')
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
                                            setDialog('CreateOrEditMachineCategoryDialog')
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
                filterFn: CustomFilterFunction,
                Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={categories.map((item) => { return item.label || "" })} />,
                Cell: (cell) => <>{cell.row.original.label ? cell.row.original.label : ""}</>,

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
            sx: { height: table.table.getState().isFullScreen ? '70vh' : '65vh' }
        }), muiTableHeadCellProps: ({ column }) => ({
            sx: {
                '& div:nth-of-type(1) span': {
                    display: (column.getIsFiltered() || column.getIsSorted() || column.getIsGrouped()) ? 'inline' : 'none', // Initially hidden
                },
                '& div:nth-of-type(2)': {
                    display: (column.getIsFiltered() || column.getIsGrouped()) ? 'inline-block' : 'none'
                },
                '&:hover div:nth-of-type(1) span': {
                    display: 'inline', // Visible on hover
                },
                '&:hover div:nth-of-type(2)': {
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
        enableDensityToggle: false, initialState: {
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
        onColumnVisibilityChange: setColumnVisibility,
        onColumnSizingChange: setColumnSizing, state: {
            isLoading: isLoading,
            columnVisibility,

            sorting,
            columnSizing: columnSizing
        }
    });


    useEffect(() => {
        if (isSuccess) {
            setCategories(data.data);
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
            'mrt_columnVisibility_MachineCategoryPage',
        );
        const columnSizing = localStorage.getItem(
            'mrt_columnSizing_MachineCategoryPage',
        );




        const sorting = localStorage.getItem('mrt_sorting_MachineCategoryPage');


        if (columnVisibility) {
            setColumnVisibility(JSON.parse(columnVisibility));
        }



        if (columnSizing)
            setColumnSizing(JSON.parse(columnSizing))
        if (sorting) {
            setSorting(JSON.parse(sorting));
        }
        isFirstRender.current = false;
    }, []);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem(
            'mrt_columnVisibility_MachineCategoryPage',
            JSON.stringify(columnVisibility),
        );
    }, [columnVisibility]);


    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_sorting_MachineCategoryPage', JSON.stringify(sorting));
    }, [sorting]);

    useEffect(() => {
        if (isFirstRender.current) return;
        localStorage.setItem('mrt_columnSizing_MachineCategoryPage', JSON.stringify(columnSizing));
    }, [columnSizing]);
    console.log(table.getState().columnFilters)

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
                                setDialog('CreateOrEditMachineCategoryDialog')
                            }}

                        > Add New</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('machine_category_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export All</MenuItem>}
                        {LoggedInUser?.assigned_permissions.includes('machine_category_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

                        >Export Selected</MenuItem>}

                    </Menu >
                    <CreateOrEditMachineCategoryDialog dialog={dialog} setDialog={setDialog} machine_category={category} />
                    <>
                        {
                            category ?
                                <>
                                    <DeleteProductionItemDialog dialog={dialog} setDialog={setDialog} category={category} />
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

