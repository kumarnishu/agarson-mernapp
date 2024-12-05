import { Dialog, DialogContent, DialogTitle, Button, Typography, Avatar,  Box, IconButton } from '@mui/material'
import { Stack } from '@mui/system'
import { useContext, useState } from 'react'
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { UserContext } from '../../../contexts/userContext'
import UpdateProfileForm from '../../forms/user/UpdateProfileForm'
import { Cancel } from '@mui/icons-material'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function UpdateProfileDialog() {
    const [isEditing, setIsEditing] = useState(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const { user } = useContext(UserContext)
    return (
        <Dialog  open={choice === UserChoiceActions.update_profile ? true : false}
            onClose={() => setChoice({ type: UserChoiceActions.close_user })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
                <Cancel fontSize='large' />
            </IconButton>
        
            {isEditing ?
                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Edit profile
                </DialogTitle>
                : null}
            <DialogContent>
                {
                    (isEditing && user) ?
                        <UpdateProfileForm user={user} />
                        :
                        null
                }
                {
                    !isEditing && user ?
                        <Box>
                            <Stack p={2} justifyContent="center" alignItems="center">
                                <Avatar src={user?.dp} sx={{ height: "150px", width: "150px" }} alt="profile pic" />
                            </Stack>
                            <Stack direction="column" justifyContent="center" alignItems="center">
                                <Typography variant="h6" component="h2">
                                    {user?.username}</Typography>
                                <Typography variant="caption" component="p">
                                    {user?.is_admin?"admin":"user"}</Typography>
                            </Stack>
                        </Box>
                        : null
                }

            </DialogContent>
            <Stack gap={2} p={2}>
                {
                    !isEditing ?
                        <Button
                            variant="outlined"
                            color="info"
                            fullWidth
                            onClick={() => {
                                setIsEditing(true)
                                setChoice({ type: UserChoiceActions.update_profile })
                            }}
                        >
                            Edit Profile
                        </Button >
                        :
                        null
                }
            </Stack>
        </Dialog>
    )
}

export default UpdateProfileDialog