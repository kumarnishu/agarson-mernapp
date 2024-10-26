import { Stack } from '@mui/system'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef,  MRT_SortingState,  useMaterialReactTable } from 'material-react-table'
import { Delete, Edit } from '@mui/icons-material'
import { Fade, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { GetErpEmployeeDto } from '../../dtos/erp reports/erp.reports.dto'
import { UserContext } from '../../contexts/userContext'
import { ChoiceContext, UserChoiceActions } from '../../contexts/dialogContext'
import { onlyUnique } from '../../utils/UniqueArray'
import { Menu as MenuIcon } from '@mui/icons-material';
import PopUp from '../../components/popup/PopUp'
import CreateOrEditErpEmployeeDialog from '../../components/dialogs/erp/CreateOrEditErpEmployeeDialog'
import AssignErpEmployeesDialog from '../../components/dialogs/erp/AssignErpEmployeesDialog'
import DeleteErpEmployeeDialog from '../../components/dialogs/erp/DeleteErpEmployeeDialog'
import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import ExportToExcel from "../../utils/ExportToExcel"
import { GetErpEmployees } from '../../services/ErpServices'


export default function ErpEmployeesPage() {
  const [employee, setEmployee] = useState<GetErpEmployeeDto>()
  const [employees, setEmployees] = useState<GetErpEmployeeDto[]>([])
  const [flag, setFlag] = useState(1);
  const { user: LoggedInUser } = useContext(UserContext)
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetErpEmployeeDto[]>, BackendError>(["erp_employees"], async () => GetErpEmployees())

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const columns = useMemo<MRT_ColumnDef<GetErpEmployeeDto>[]>(
    //column definitions...
    () => employees && [
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

                {LoggedInUser?.is_admin && LoggedInUser.assigned_permissions.includes('erp_employee_delete') &&
                  <Tooltip title="delete">
                    <IconButton color="error"

                      onClick={() => {
                        setChoice({ type: UserChoiceActions.delete_erp_employee })
                        setEmployee(cell.row.original)

                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                }
                {LoggedInUser?.assigned_permissions.includes('erp_employee_edit') && <Tooltip title="edit">
                  <IconButton

                    onClick={() => {
                      setEmployee(cell.row.original)
                      setChoice({ type: UserChoiceActions.create_or_edit_erpemployee })
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
        accessorKey: 'name',
        header: 'Employee',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.name ? cell.row.original.name : ""}</>,
        filterSelectOptions: employees && employees.map((i) => {
          return i.name;
        }).filter(onlyUnique)
      },
      {
        accessorKey: 'display_name',
        header: 'Display Name',
        size: 350,
        filterVariant: 'multi-select',
        Cell: (cell) => <>{cell.row.original.display_name ? cell.row.original.display_name : ""}</>,
        filterSelectOptions: employees && employees.map((i) => {
          return i.display_name;
        }).filter(onlyUnique)
      },
      
      {
        accessorKey: 'assigned_users',
        header: 'Assigned Users',
        size: 650,
        filterVariant: 'text',
        Cell: (cell) => <>{cell.row.original.assigned_employees ? cell.row.original.assigned_employees : ""}</>,
      }
    ],
    [employees, data],
    //end
  );


  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: employees, //10,000 rows     
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
        fontSize: '14px'
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
        fontSize: '13px'
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
      setEmployees(data.data);
    }
  }, [isSuccess,data]);


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
          Erp Employees : {employees && employees.length}
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
            {LoggedInUser?.assigned_permissions.includes('erp_employee_create') && <MenuItem

              onClick={() => {
                setChoice({ type: UserChoiceActions.create_or_edit_erpemployee })
                setEmployee(undefined)
                setAnchorEl(null)
              }}
            > Add New</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('erp_employee_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some employees")
                }
                else {
                  setChoice({ type: UserChoiceActions.bulk_assign_erp_employees })
                  setEmployee(undefined)
                  setFlag(1)
                }
                setAnchorEl(null)
              }}
            > Assign Employees</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('erp_employee_edit') && <MenuItem

              onClick={() => {
                if (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) {
                  alert("select some employees")
                }
                else {
                  setChoice({ type: UserChoiceActions.bulk_assign_erp_employees })
                  setEmployee(undefined)
                  setFlag(0)
                }
                setAnchorEl(null)
              }}
            > Remove Employees</MenuItem>}

            {LoggedInUser?.assigned_permissions.includes('erp_employee_export') && < MenuItem onClick={() => ExportToExcel(table.getRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export All</MenuItem>}
            {LoggedInUser?.assigned_permissions.includes('erp_employee_export') && < MenuItem disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()} onClick={() => ExportToExcel(table.getSelectedRowModel().rows.map((row) => { return row.original }), "Exported Data")}

            >Export Selected</MenuItem>}

          </Menu >
          <CreateOrEditErpEmployeeDialog />
          {<AssignErpEmployeesDialog flag={flag} employees={table.getSelectedRowModel().rows.map((item) => { return item.original })} />}
          <>
            {
              employee ?
                <>

                  <DeleteErpEmployeeDialog employee={employee} />
                  <CreateOrEditErpEmployeeDialog employee={employee} />
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

