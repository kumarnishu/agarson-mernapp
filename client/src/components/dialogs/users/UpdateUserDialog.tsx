import { Dialog, DialogContent, DialogTitle,  IconButton } from '@mui/material'
import { useContext } from 'react'
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import UpdateUserForm from '../../forms/user/UpdateUserForm'
import { Cancel } from '@mui/icons-material'
import { GetUserDto } from '../../../dtos/user.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function UpdateUserDialog({ user }: { user: GetUserDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog open={choice === UserChoiceActions.update_user ? true : false}
            onClose={() => setChoice({ type: UserChoiceActions.close_user })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
                <Cancel fontSize='large' />
            </IconButton>
        
            <DialogTitle textAlign="center" sx={{ minWidth: '350px' }}>Update User Form</DialogTitle>
            <DialogContent>
                {user ?
                    <UpdateUserForm user={user} />
                    : null
                }
            </DialogContent>
        </Dialog >
    )
}

export default UpdateUserDialog