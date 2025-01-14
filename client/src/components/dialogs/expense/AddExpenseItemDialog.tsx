import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import { toTitleCase } from '../../../utils/TitleCase'
import AddExpenseItemForm from '../../forms/expense/AddExpenseItemForm'
import { GetExpenseItemDto } from '../../../dtos/response/ExpenseDto'



type props = {
    item: GetExpenseItemDto
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function AddExpenseItemDialog({  dialog, item, setDialog }: props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'AddExpenseItemDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Add - {toTitleCase(item.item)}</DialogTitle>
            <DialogContent>
                <AddExpenseItemForm item={item} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default AddExpenseItemDialog