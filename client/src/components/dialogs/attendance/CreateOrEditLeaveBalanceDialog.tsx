import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import { GetLeaveBalanceDto } from '../../../dtos/leave.dto';
import CreateOrEditLeaveForm from '../../forms/leaves/CreateOrEditLeaveForm';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    balance?: GetLeaveBalanceDto

}
function CreateOrEditLeaveBalanceDialog({ balance, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditLeaveBalanceDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {balance ? "Update Leave balance" : "Create Leave balance"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditLeaveForm setDialog={
                    setDialog
                } balance={balance} />
            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditLeaveBalanceDialog
