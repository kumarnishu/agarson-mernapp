import { Box, Checkbox, IconButton, Stack, Tooltip } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { CheckListChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import PopUp from '../../popup/PopUp'
import { Delete, Edit } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { STable, STableBody, STableCell, STableHead, STableHeadCell, STableRow } from '../../styled/STyledTable'
import { DropDownDto } from '../../../dtos'
import CreateOrEditChecklistCategoryDialog from '../../dialogs/checklists/CreateOrEditChecklistCategoryDialog'
import DeleteCheckListCategoryDialog from '../../dialogs/checklists/DeleteCheckListCategoryDialog'


type Props = {
    category: DropDownDto | undefined,
    setCategory: React.Dispatch<React.SetStateAction<DropDownDto | undefined>>,
    selectAll: boolean,
    setSelectAll: React.Dispatch<React.SetStateAction<boolean>>,
    categories: DropDownDto[],
    selectedCategories: DropDownDto[]
    setSelectedCategories: React.Dispatch<React.SetStateAction<DropDownDto[]>>,
}
function CheckCategoryTable({ category, selectAll, categories, setSelectAll, setCategory, selectedCategories, setSelectedCategories }: Props) {
    const [data, setData] = useState<DropDownDto[]>(categories)
    const { setChoice } = useContext(ChoiceContext)
    const { user } = useContext(UserContext)
    useEffect(() => {
        if (data)
            setData(categories)
    }, [categories, data])
    return (
        <>
            <Box sx={{
                overflow: "auto",
                height: '80vh'
            }}>
                <STable
                >
                    <STableHead
                    >
                        <STableRow>
                            <STableHeadCell style={{ width: '50px' }}
                            >


                                <Checkbox sx={{ width: 16, height: 16 }}
                                    indeterminate={selectAll ? true : false}
                                    checked={Boolean(selectAll)}
                                    size="small" onChange={(e) => {
                                        if (e.currentTarget.checked) {
                                            setSelectedCategories(categories)
                                            setSelectAll(true)
                                        }
                                        if (!e.currentTarget.checked) {
                                            setSelectedCategories([])
                                            setSelectAll(false)
                                        }
                                    }} />

                            </STableHeadCell>

                            <STableHeadCell style={{ width: '50px' }}
                            >

                                Actions

                            </STableHeadCell>
                            <STableHeadCell style={{ width: '200px' }}
                            >

                                Category

                            </STableHeadCell>





                        </STableRow>
                    </STableHead>
                    <STableBody >
                        {
                            categories && categories.map((category, index) => {
                                return (
                                    <STableRow
                                        style={{ backgroundColor: selectedCategories.length > 0 && selectedCategories.find((t) => t.id === category.id) ? "lightgrey" : "white" }}
                                        key={index}
                                    >
                                        {selectAll ?
                                            <STableCell style={{ width: '50px' }}>


                                                <Checkbox sx={{ width: 16, height: 16 }} size="small"
                                                    checked={Boolean(selectAll)}
                                                />


                                            </STableCell>
                                            :
                                            null
                                        }
                                        {!selectAll ?
                                            <STableCell style={{ width: '50px' }}>

                                                <Checkbox sx={{ width: 16, height: 16 }}
                                                    size="small"
                                                    checked={selectedCategories.length > 0 && selectedCategories.find((t) => t.id === category.id) ? true : false}
                                                    onChange={(e) => {
                                                        setCategory(category)
                                                        if (e.target.checked) {
                                                            setSelectedCategories([...selectedCategories, category])
                                                        }
                                                        if (!e.target.checked) {
                                                            setSelectedCategories((categories) => categories.filter((item) => {
                                                                return item.id !== category.id
                                                            }))
                                                        }
                                                    }}
                                                />

                                            </STableCell>
                                            :
                                            null
                                        }
                                        {/* actions */}

                                        <STableCell style={{ width: '50' }}>
                                            <PopUp
                                                element={
                                                    <Stack direction="row">
                                                        <>
                                                            {user?.is_admin && user.assigned_permissions.includes('checklist_category_delete') &&
                                                                <Tooltip title="delete">
                                                                    <IconButton color="error"

                                                                        onClick={() => {
                                                                            setChoice({ type: CheckListChoiceActions.delete_checklist_category })
                                                                            setCategory(category)

                                                                        }}
                                                                    >
                                                                        <Delete />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            }

                                                            {user?.assigned_permissions.includes('checklist_category_edit') && <Tooltip title="edit">
                                                                <IconButton

                                                                    onClick={() => {
                                                                        setCategory(category)
                                                                        setChoice({ type: CheckListChoiceActions.create_or_edit_checklist_category })
                                                                    }}

                                                                >
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>}

                                                        </>

                                                    </Stack>}
                                            />

                                        </STableCell>
                                        <STableCell style={{ width: '200px' }}>
                                            {category.value}
                                        </STableCell>


                                    </STableRow>
                                )
                            })}
                    </STableBody>
                </STable>
                <CreateOrEditChecklistCategoryDialog category={category} />
                {category &&<DeleteCheckListCategoryDialog category={category} />}
            </Box>
        </>
    )
}

export default CheckCategoryTable