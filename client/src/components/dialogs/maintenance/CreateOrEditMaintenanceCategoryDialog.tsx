import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, MaintenanceChoiceActions } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { DropDownDto } from '../../../dtos/common/dropdown.dto'
import CreateOrEditMaintenanceCategoryForm from '../../forms/maintenance/CreateOrEditMaintenanceCategoryForm'

function CreateOrEditMaintenanceCategoryDialog({ category }: { category?: DropDownDto}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === MaintenanceChoiceActions.create_or_edit_maintenance_category  ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: MaintenanceChoiceActions.close_maintenance })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!category ?"New Category":"Edit Category"}</DialogTitle>
            <DialogContent>
               <CreateOrEditMaintenanceCategoryForm category={category} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditMaintenanceCategoryDialog