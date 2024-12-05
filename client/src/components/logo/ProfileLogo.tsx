import { Avatar, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import NewUserDialog from '../dialogs/users/NewUserDialog';
import EmailVerifySendMailDialog from '../dialogs/users/EmailVerifySendMailDialog';
import UpdateProfileDialog from '../dialogs/users/UpdateProfileDialog';
import UpdatePasswordDialog from '../dialogs/users/UpdatePasswordDialog';
import { UserContext } from '../../contexts/userContext';
import ProfileDialog from '../dialogs/users/ProfileDialog';
import LogoutButton from '../buttons/LogoutButton';
import { toTitleCase } from '../../utils/TitleCase';



export function ProfileMenu({ anchorEl, setAnchorEl }: { anchorEl: Element | null, setAnchorEl: React.Dispatch<React.SetStateAction<Element | null>> }) {
    const { user } = useContext(UserContext)
    const [dialog, setDialog] = useState<string | undefined>()
    const goto = useNavigate()

    return (
        <>
            <NewUserDialog dialog={dialog} setDialog={setDialog} />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        setAnchorEl(null)
                        goto("/")
                    }
                    }
                >Dashboard</MenuItem>

                <MenuItem
                    onClick={() => {
                        setDialog(undefined)
                        setAnchorEl(null)
                    }}
                >View Profile</MenuItem>
                <MenuItem
                    onClick={() => {
                        setDialog(undefined)
                        setAnchorEl(null)
                    }}

                >Update Profile</MenuItem >

                <MenuItem onClick={() => {
                    setDialog(undefined)
                    setAnchorEl(null)

                }}>
                    Update Password
                </MenuItem >

                {
                    !user?.email_verified ?

                        <MenuItem onClick={() => {
                            setDialog(undefined) 
                            setAnchorEl(null)

                        }}>
                            Verify Email
                        </MenuItem >
                        : null
                }
                <MenuItem>
                    <LogoutButton />
                </MenuItem>
            </Menu >
            <EmailVerifySendMailDialog dialog={dialog} setDialog={setDialog} />
            <UpdateProfileDialog dialog={dialog} setDialog={setDialog} />
            <UpdatePasswordDialog dialog={dialog} setDialog={setDialog} />
            {user && <ProfileDialog dialog={dialog} setDialog={setDialog} profile={user} />}
        </>
    )
}


function ProfileLogo() {
    const { user } = useContext(UserContext)
    return (
        <Stack direction={'row'} justifyContent={'left'} alignItems={'center'}>
            <Avatar
                sx={{ width: 20, height: 20 }}
                alt="img1" src={user?.dp} />
            <Typography variant='h5' sx={{ color: 'white', pl: 1 }}> {toTitleCase(user?.username || "")}</Typography>

        </Stack>
    )
}



export default ProfileLogo