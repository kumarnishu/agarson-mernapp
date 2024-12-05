import { Dialog, DialogContent, DialogTitle,  IconButton } from '@mui/material'
import { useContext } from 'react';
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import UpdatePasswordForm from '../../forms/user/UpdatePasswordForm';
import { Cancel } from '@mui/icons-material';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function UpdatePasswordDialog() {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <>
            <Dialog open={choice === UserChoiceActions.update_password ? true : false}
                onClose={() => setChoice({ type: UserChoiceActions.close_user })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">Update Password</DialogTitle>
                <DialogContent>
                    <UpdatePasswordForm />
                </DialogContent>
              
            </Dialog >
        </>
    )
}

export default UpdatePasswordDialog
