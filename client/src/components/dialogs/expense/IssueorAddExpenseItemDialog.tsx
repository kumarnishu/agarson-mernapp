import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import IssueOrAddExpenseItemForm from '../../forms/expense/IssueOrAddExpenseItemForm'
import { GetExpenseItemDto } from '../../../dtos/expense-item.dto'



type props = {
    val: string,
    item: GetExpenseItemDto
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function IssueorAddExpenseItemDialog({ val, dialog, item, setDialog }: props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'IssueorAddExpenseItemDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{val == 'issue' ? "Issue" : "Add"}</DialogTitle>
            <DialogContent>
                <IssueOrAddExpenseItemForm item={item} val={val} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default IssueorAddExpenseItemDialog