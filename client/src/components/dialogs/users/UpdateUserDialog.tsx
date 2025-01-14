import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import UpdateUserForm from '../../forms/user/UpdateUserForm'
import { Cancel } from '@mui/icons-material'
import { GetUserDto } from '../../../dtos/response/UserDto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    user: GetUserDto
}
function UpdateUserDialog({ user, dialog, setDialog }: Props) {
    return (
        <Dialog open={dialog === "UpdateUserDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <DialogTitle textAlign="center" sx={{ minWidth: '350px' }}>Update User Form</DialogTitle>
            <DialogContent>
                {user ?
                    <UpdateUserForm setDialog={setDialog}user={user} />
                    : null
                }
            </DialogContent>
        </Dialog >
    )
}

export default UpdateUserDialog