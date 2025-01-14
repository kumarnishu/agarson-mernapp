import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import UpdateUserPasswordForm from '../../forms/user/UpdateUserPasswordForm';
import { Cancel } from '@mui/icons-material';
import { GetUserDto } from '../../../dtos/UserDto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    user: GetUserDto
}
function UpdateUsePasswordDialog({ user, dialog, setDialog }: Props) {
    return (
        <>
            <Dialog open={dialog === 'UpdateUsePasswordDialog'}
                onClose={() => setDialog(undefined)}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">Update Password</DialogTitle>
                <DialogContent>
                    <UpdateUserPasswordForm setDialog={setDialog}user={user} />
                </DialogContent>
            </Dialog >
        </>
    )
}

export default UpdateUsePasswordDialog
