import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnSizingState, MRT_SortingState, MRT_VisibilityState, useMaterialReactTable } from 'material-react-table'
import { Typography } from '@mui/material'
import { BackendError } from '../..'
import { CustomColumFilter } from '../../components/filter/CustomColumFIlter'
import { CustomFilterFunction } from '../../components/filter/CustomFilterFunction'
import ViewPartyDetailDialog from '../../components/dialogs/party/ViewPartyDetailDialog'
import { PartyPageService } from '../../services/PartyPageService'
import { PartyContext } from '../../contexts/partyContext'


export default function PartyPage() {
  const { setParty } = useContext(PartyContext)
  const [parties, setParties] = useState<{ party: string }[]>([])
  const { data, isLoading, isSuccess } = useQuery<AxiosResponse<{ party: string }[]>, BackendError>(["parties"], async () => new PartyPageService().GetPartyList())


  const [dialog, setDialog] = useState<string | undefined>()

  const isFirstRender = useRef(true);

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>({});

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>({})
  const columns = useMemo<MRT_ColumnDef<{ party: string }>[]>(
    //column definitions...
    () => parties && [

      {
        accessorKey: 'party',
        header: 'Party Name',
        grow: false,
        Cell: (cell) => <Typography sx={{cursor: 'pointer'}} onClick={() => {
          setParty(cell.row.original.party)
          setDialog('ViewPartyDetailDialog')
        }}>{cell.row.original.party ? cell.row.original.party : ""}</Typography>,
        filterFn: CustomFilterFunction,
        Filter: (props) => <CustomColumFilter id={props.column.id} table={props.table} options={parties.map((item) => { return item.party || "" })} />,
      },
    ],
    [parties],
    //end
  );



  const table = useMaterialReactTable({
    columns, columnFilterDisplayMode: 'popover',
    data: parties, //10,000 rows       
    enableColumnResizing: true,
    enableColumnVirtualization: true, enableStickyFooter: true,
    muiTableFooterRowProps: () => ({
      sx: {
        backgroundColor: 'whitesmoke',
        color: 'white',
      }
    }),
    muiTableContainerProps: (table) => ({
      sx: { height: table.table.getState().isFullScreen ? 'auto' : '70vh' }
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
    enableGrouping: false,
    enableRowSelection: false,
    enablePagination: true,
    enableRowNumbers: true,
    enableColumnPinning: true,
    enableTableFooter: true,
    enableRowVirtualization: true,
    onColumnVisibilityChange: setColumnVisibility,  //
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
    if (isSuccess) {
      setParties(data.data);
    }
  }, [data, isSuccess]);



  //load state from local storage
  useEffect(() => {
    const columnVisibility = localStorage.getItem(
      'mrt_columnVisibility_ChecklistCategoriesPage',
    );
    const columnSizing = localStorage.getItem(
      'mrt_columnSizing_ChecklistCategoriesPage',
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
      'mrt_columnVisibility_ChecklistCategoriesPage',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);




  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_sorting_ChecklistCategoriesPage', JSON.stringify(sorting));
  }, [sorting]);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem('mrt_columnSizing_ChecklistCategoriesPage', JSON.stringify(columnSizing));
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
          Party List
        </Typography>



        <>
          <ViewPartyDetailDialog dialog={dialog} setDialog={setDialog}  />
        </>


      </Stack >

      {/* table */}
      <MaterialReactTable table={table} />
    </>

  )

}

