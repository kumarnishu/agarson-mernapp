import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import {  ChoiceContext, CheckListChoiceActions } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { DropDownDto } from '../../../dtos'
import CreateOrEditCategoryForm from '../../forms/checklists/CreateOrEditCategoryForm'

function CreateOrEditChecklistCategoryDialog({ category }: { category?: DropDownDto}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === CheckListChoiceActions.create_or_edit_checklist_category  ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: CheckListChoiceActions.close_checklist })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!category ?"New Category":"Edit Category"}</DialogTitle>
            <DialogContent>
               <CreateOrEditCategoryForm category={category} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditChecklistCategoryDialog