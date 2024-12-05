import { Dialog, DialogContent, DialogTitle,  IconButton } from '@mui/material'
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import ResetPasswordForm from '../../forms/user/ResetPasswordForm';
import { Cancel } from '@mui/icons-material';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function ResetPasswordDialog() {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { token } = useParams()
    return (
        <>
            <Dialog
                open={choice === UserChoiceActions.reset_password || token ? true : false}
                onClose={() => setChoice({ type: UserChoiceActions.close_user })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
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
