import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditMachinecategoryForm from '../../forms/dropdown/CreateOrEditMachinecategoryForm'
import { DropDownDto } from '../../../dtos/dropdown.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    machine_category?: DropDownDto
}
function CreateOrEditMachineCategoryDialog({ machine_category, dialog, setDialog }: Props) {
   
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === "CreateOrEditMachineCategoryDialog"}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!machine_category ? "New Category" : "Edit Category"}</DialogTitle>
            <DialogContent>
                <CreateOrEditMachinecategoryForm setDialog={
                    setDialog
                }machine_category={machine_category} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditMachineCategoryDialog