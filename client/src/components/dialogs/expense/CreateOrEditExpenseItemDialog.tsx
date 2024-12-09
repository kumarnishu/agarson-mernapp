import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Cancel } from '@mui/icons-material';

import { GetExpenseItemDto } from '../../../dtos/expense-item.dto';
import CreateorEditExpenseItemForm from '../../forms/expense/CreateorEditExpenseItemForm';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    item?: GetExpenseItemDto
}
function CreateOrEditExpenseItemDialog({ item, dialog, setDialog }: Props) {
    
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditExpenseItemDialog"}

            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                    setDialog(undefined)
                }}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}> {!item ? "New Item" : "Edit Item"}
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <CreateorEditExpenseItemForm setDialog={
                    setDialog
                }item={item} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateOrEditExpenseItemDialog