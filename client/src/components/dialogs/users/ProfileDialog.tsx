import { Dialog, DialogContent, DialogTitle,  DialogActions, Typography, Avatar, Box, IconButton } from '@mui/material'
import { Stack } from '@mui/system'
import { useContext } from 'react'
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { GetUserDto } from '../../../dtos/user.dto'

function ProfileDialog({ profile }: { profile: GetUserDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog open={choice === UserChoiceActions.view_profile ? true : false}
            onClose={() => setChoice({ type: UserChoiceActions.close_user })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
                <Cancel fontSize='large' />
            </IconButton>
            
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                User Profile
            </DialogTitle>
            <DialogContent>
                <Box>
                    <Stack p={2} justifyContent="center" alignItems="center">
                        <Avatar src={profile.dp} sx={{ height: "150px", width: "150px" }} alt="profile pic" />
                    </Stack>
                    <Stack direction="column" justifyContent="center" alignItems="center">
                        <Typography variant="h4" component="h2">
                            {profile?.username}</Typography>
                        <Typography variant="body1" component="p">
                            {profile?.is_admin ? "admin" : "user"}</Typography>
                        <Typography variant="body2" component="p">
                            {profile?.mobile}</Typography>
                        <Typography variant="caption" component="p">
                            {profile?.email}</Typography>
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions>
                
            </DialogActions>
        </Dialog>
    )
}

export default ProfileDialog