import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditExpenseCategoryForm from '../../forms/dropdown/CreateOrEditExpenseCategoryForm'
import { DropDownDto } from '../../../dtos/dropdown.dto'


type props = {
    category?: DropDownDto,
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function CreateOrEditExpenseCategoryDialog({ category,dialog,setDialog }: props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog ==='CreateOrEditExpenseCategoryDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!category ? "New Category" : "Edit Category"}</DialogTitle>
            <DialogContent>
                <CreateOrEditExpenseCategoryForm category={category} dialog={dialog} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditExpenseCategoryDialog