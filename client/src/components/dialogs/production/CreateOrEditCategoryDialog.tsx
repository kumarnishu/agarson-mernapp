import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ProductionChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditMachinecategoryForm from '../../forms/production/CreateOrEditMachinecategoryForm'
import { DropDownDto } from '../../../dtos'

function CreateOrEditMachineCategoryDialog({ machine_category }: { machine_category?: DropDownDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === ProductionChoiceActions.create_or_edit_machine_category ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: ProductionChoiceActions.close_production })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!machine_category ? "New Category" : "Edit Category"}</DialogTitle>
            <DialogContent>
                <CreateOrEditMachinecategoryForm machine_category={machine_category} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditMachineCategoryDialog