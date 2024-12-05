import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { useParams } from 'react-router-dom';
import ResetPasswordForm from '../../forms/user/ResetPasswordForm';
import { Cancel } from '@mui/icons-material';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function ResetPasswordDialog({ dialog, setDialog }: Props) {
    const { token } = useParams()
    return (
        <>
            <Dialog
                open={dialog === 'ResetPasswordDialog'}
                onClose={() => setDialog(undefined)}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">Reset Password</DialogTitle>
                <DialogContent>
                    <ResetPasswordForm token={token || ""} />
                </DialogContent>

            </Dialog >
        </>
    )
}

export default ResetPasswordDialog
