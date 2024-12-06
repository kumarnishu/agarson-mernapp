import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import UpdatePasswordForm from '../../forms/user/UpdatePasswordForm';
import { Cancel } from '@mui/icons-material';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function UpdatePasswordDialog({ dialog, setDialog }: Props) {
     return (
        <>
            <Dialog open={dialog === "UpdatePasswordDialog"}
                onClose={() => setDialog(undefined)}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">Update Password</DialogTitle>
                <DialogContent>
                    <UpdatePasswordForm setDialog={setDialog}/>
                </DialogContent>

            </Dialog >
        </>
    )
}

export default UpdatePasswordDialog
