import { IconButton, LinearProgress, Tooltip, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_RowVirtualizer, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { UserContext } from '../../contexts/userContext'
import { HandleNumbers } from '../../utils/IsDecimal'
import PopUp from '../../components/popup/PopUp'
import { Comment, Edit, Visibility } from '@mui/icons-material'
import { GetReferenceReportForSalesmanDto } from '../../dtos/references.dto'
import CreateOrEditReferenceRemarkDialog from '../../components/dialogs/reference/CreateOrEditReferenceRemarkDialog'
import ViewReferenceRemarksDialog from '../../components/dialogs/reference/ViewReferenceRemarksDialog'
import { SalesService } from '../../services/SalesServices'
import EditReferenceStateDialog from '../../components/dialogs/reference/EditReferenceStateDialog'

export default function ReferencesReportPage() {
  const { user: LoggedInUser } = useContext(UserContext)
  const [gst, setGst] = useState<string | undefined>()
  const [state, setState] = useState<string | undefined>()
  const [reports, setReports] = useState<GetReferenceReportForSalesmanDto[]>([])
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<GetReferenceReportForSalesmanDto[]>, BackendError>(["references",], async () => new SalesService().GetAllSalesmanReferences())
  const isFirstRender = useRef(true);
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});
  const [dialog, setDialog] = useState<string | undefined>()
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [party, setParty] = useState<string | undefined>()
  const [stage, setReference] = useState<string | undefined>()

  const columns = useMemo<MRT_ColumnDef<GetReferenceReportForSalesmanDto>[]>(
    //column definitions...
    () => reports && [
      {
        accessorKey: 'actions',
        header: 'Actions',
        Cell: (cell) => <PopUp key={'action'}
          element={
            <Stack direction="row" spacing={1} >
               {LoggedInUser?.assigned_permissions.includes('salesman_references_report_edit') && <Tooltip title="edit state">
                              <IconButton color="primary"
                                onClick={() => {
                                  setDialog('EditReferenceStateDialog')
                                  setGst(cell.row.original.gst)
                                  setState(cell.row.original.state)
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>}
              {LoggedInUser?.assigned_permissions.includes('salesman_references_report_view') && <Tooltip title="view remarks">
                <IconButton color="primary"
                  onClick={() => {
                    setDialog('ViewReferenceRemarksDialog')
                    setParty(cell.row.original.party)
                    setReference(cell.row.original.stage)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>}

              {LoggedInUser?.assigned_permissions.includes('salesman_references_report_edit') &&
                <Tooltip title="Add Remark">
                  <IconButton

                    color="success"
                    onClick={() => {
                      setDialog('CreateOrEditReferenceRemarkDialog')
                      setParty(cell.row.original.party)
                      setReference(cell.row.original.stage)
                    }}
                  >
                    <Comment />
                  </IconButton>
                </Tooltip>}

            </Stack>}
        />
      },
      {
        accessorKey: 'stage',
        header: 'Stage',
        aggregationFn: 'count',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'last_remark',
        header: 'Last Remark',
        aggregationFn: 'count',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'party',
        header: 'Party',
        aggregationFn: 'count',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        aggregationFn: 'count',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },
      {
        accessorKey: 'state',
        header: 'State',
        aggregationFn: 'count',
        AggregatedCell: (cell) => cell.cell.getValue() ? HandleNumbers(cell.cell.getValue()) : '',
      },


    ],
    [reports, data],
    //end
  );

  const table = useMaterialReactTable({
    //@ts-ignore
    columns, columnFilterDisplayMode: 'popover',
    data: reports, //10,000 rows       
    enableColumnResizing: true,
    enableStickyFooter: true,
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
    muiTableHeadCellProps: ({ column }) => ({
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
    muiTableBodyCellProps: () => ({
      sx: {
        border: '1px solid #c2beba;',
      },
    }),
    muiPaginationProps: {
      rowsPerPageOptions: [100, 200, 500, 1000, 2000, 5000, 7000, 10000],
      shape: 'rounded',
      variant: 'outlined',
    },
    initialState: {
      density: 'compact', pagination: { pageIndex: 0, pageSize: 7000 }
    },
    enableGrouping: true,
    enableRowSelection: true,
    manualPagination: false,
    enablePagination: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    //optionally customize the column virtualizer
    onColumnVisibilityChange: setColumnVisibility,
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
      setReports(data.data);
    }
  }, [isSuccess, data]);

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
      {
        isLoading && <LinearProgress />
      }

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
          Salesman References
        </Typography>

      </Stack >
      {party && stage && <CreateOrEditReferenceRemarkDialog dialog={dialog} setDialog={setDialog} stage={stage} party={party} />}
      {party && stage && <ViewReferenceRemarksDialog dialog={dialog} setDialog={setDialog} party={party} stage={stage} />}
      {/* table */}
      {gst && <EditReferenceStateDialog gst={gst} state={state} dialog={dialog} setDialog={setDialog} />}
      <MaterialReactTable table={table} />
    </>

  )

}
