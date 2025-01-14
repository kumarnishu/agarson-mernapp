import { Dialog, DialogContent, DialogTitle, DialogActions, Typography, Avatar, Box, IconButton } from '@mui/material'
import { Stack } from '@mui/system'
import { Cancel } from '@mui/icons-material'
import { GetUserDto } from '../../../dtos/UserDto'


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    profile: GetUserDto
}
function ProfileDialog({ profile, dialog, setDialog }: Props) {
  
     return (
        <Dialog open={dialog === 'ProfileDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
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
                            {profile?.role=="admin" ? "admin" : "user"}</Typography>
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