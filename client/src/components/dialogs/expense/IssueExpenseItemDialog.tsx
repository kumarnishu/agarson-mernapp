import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import { GetExpenseItemDto } from '../../../dtos/expense-item.dto'
import IssueExpenseItemForm from '../../forms/expense/IssueExpenseItemForm'
import { toTitleCase } from '../../../utils/TitleCase'



type props = {
    item: GetExpenseItemDto
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function IssueExpenseItemDialog({  dialog, item, setDialog }: props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'IssueExpenseItemDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Issue - {toTitleCase(item.item)}</DialogTitle>
            <DialogContent>
                <IssueExpenseItemForm item={item}  setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default IssueExpenseItemDialog