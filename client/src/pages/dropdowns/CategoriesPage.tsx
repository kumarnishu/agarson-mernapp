import { Search } from '@mui/icons-material'
import { Fade, IconButton, InputAdornment, LinearProgress, Menu, MenuItem, TextField, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { AxiosResponse } from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { BackendError } from '../..'
import FuzzySearch from "fuzzy-search";
import ExportToExcel from '../../utils/ExportToExcel'
import { CheckListChoiceActions, ChoiceContext, } from '../../contexts/dialogContext'
import { Menu as MenuIcon } from '@mui/icons-material';
import AlertBar from '../../components/snacks/AlertBar'
import TableSkeleton from '../../components/skeleton/TableSkeleton'
import { UserContext } from '../../contexts/userContext'
import { DropDownDto } from '../../dtos'
import CheckCategoryTable from '../../components/tables/checklists/CheckCategoryTable'
import { GetAllCheckCategories } from '../../services/CheckListServices'
import CreateOrEditChecklistCategoryDialog from '../../components/dialogs/checklists/CreateOrEditChecklistCategoryDialog'

type ITemplate = {
  _id: string,
  category: string
}
let template: ITemplate[] = [
  {
    _id: "qeqq6g54",
    category: "internet"
  }
]

export default function ChecklistCategoriesPage() {
  const { data, isSuccess, isLoading } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("check_categories", GetAllCheckCategories)
  const [category, setCategory] = useState<DropDownDto>()
  const [categories, setCategories] = useState<DropDownDto[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const MemoData = React.useMemo(() => categories, [categories])
  const [preFilteredData, setPreFilteredData] = useState<DropDownDto[]>([])
  const [selectedCategories, setSelectedCategories] = useState<DropDownDto[]>([])
  const [filter, setFilter] = useState<string | undefined>()
  const [selectedData, setSelectedData] = useState<ITemplate[]>(template)
  const [sent, setSent] = useState(false)
  const { setChoice } = useContext(ChoiceContext)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { user: LoggedInUser } = useContext(UserContext)

  function handleExcel() {
    setAnchorEl(null)
    try {
      ExportToExcel(selectedData, "checklist_categories_data")
      setSent(true)
      setSelectAll(false)
      setSelectedData([])
      setSelectedCategories([])
    }
    catch (err) {
      console.log(err)
      setSent(false)
    }
  }

  // refine data
  useEffect(() => {
    let data: ITemplate[] = []
    selectedCategories.map((category) => {
      return data.push({
        _id: category.id,
        category: category.value,
      })
    })
    if (data.length > 0)
      setSelectedData(data)
  }, [selectedCategories])

  useEffect(() => {
    if (isSuccess) {
      setCategories(data.data)
      setPreFilteredData(data.data)
    }
  }, [isSuccess, categories, data])


  useEffect(() => {
    if (filter) {
      if (categories) {
        const searcher = new FuzzySearch(categories, ["label", "value"], {
          caseSensitive: false,
        });
        const result = searcher.search(filter);
        setCategories(result)
      }
    }
    if (!filter)
      setCategories(preFilteredData)

  }, [filter, categories])
  return (
    <>
      {
        isLoading && <LinearProgress />
      }
      {/*heading, search bar and table menu */}
      <Stack
        spacing={2}
        padding={1}
        direction="row"
        justifyContent="space-between"

      >

        <Typography
          variant={'h6'}
          component={'h1'}
          sx={{ pl: 1 }}
        >
          Categories
        </Typography>

        <TextField
          sx={{ width: '50vw' }}
          size="small"
          onChange={(e) => {
            setFilter(e.currentTarget.value)
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ cursor: 'pointer' }} />
              </InputAdornment>
            ),
          }}
          placeholder={`Search Categories `}
          style={{
            fontSize: '1.1rem',
            border: '0',
          }}
        />
        <Stack
          direction="row"
        >
          {/* search bar */}
          < Stack direction="row" spacing={2}>
            {/* {LoggedInUser?.crm_access_fields.is_editable && <UploadCRMCategoriesFromExcelButton disabled={!LoggedInUser?.crm_access_fields.is_editable} />} */}
          </Stack >
          <>

            {sent && <AlertBar message="File Exported Successfuly" color="success" />}


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
              {LoggedInUser?.assigned_permissions.includes('checklist_category_create') && <MenuItem
                onClick={() => {
                  setChoice({ type: CheckListChoiceActions.create_or_edit_checklist_category })
                  setCategory(undefined)
                  setAnchorEl(null)
                }}

              > Add New</MenuItem>}

              {LoggedInUser?.assigned_permissions.includes('checklist_category_export') && < MenuItem onClick={handleExcel}

              >Export To Excel</MenuItem>}

            </Menu >
            <CreateOrEditChecklistCategoryDialog />
          </>
        </Stack >
      </Stack >
      {/*  table */}
      {isLoading && <TableSkeleton />}
      {!isLoading && MemoData &&
        <CheckCategoryTable
          category={category}
          selectAll={selectAll}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          setSelectAll={setSelectAll}
          categories={MemoData}
          setCategory={setCategory}
        />}

    </>

  )

}

