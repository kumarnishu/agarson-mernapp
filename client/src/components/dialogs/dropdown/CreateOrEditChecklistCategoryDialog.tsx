import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditCategoryForm from '../../forms/dropdown/CreateOrEditCategoryForm'
import { DropDownDto } from '../../../dtos/response/DropDownDto'
type Props = {
    dialog: string | undefined,
    category?: DropDownDto
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function CreateOrEditChecklistCategoryDialog({ category, dialog, setDialog }: Props) {
   
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditChecklistCategoryDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!category ? "New Category" : "Edit Category"}</DialogTitle>
            <DialogContent>
                <CreateOrEditCategoryForm setDialog={
                    setDialog
                } category={category} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditChecklistCategoryDialog