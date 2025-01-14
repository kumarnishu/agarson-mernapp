import { Dialog, DialogContent, DialogTitle, Button, Typography, Avatar, Box, IconButton } from '@mui/material'
import { Stack } from '@mui/system'
import { useContext, useState } from 'react'
import { UserContext } from '../../../contexts/userContext'
import UpdateProfileForm from '../../forms/user/UpdateProfileForm'
import { Cancel } from '@mui/icons-material'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function UpdateProfileDialog({ dialog, setDialog }: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const { user } = useContext(UserContext)
    return (
        <Dialog open={dialog === "UpdateProfileDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
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
                        <UpdateProfileForm setDialog={setDialog}user={user} />
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
                                    {user?.role=="admin" ? "admin" : "user"}</Typography>
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