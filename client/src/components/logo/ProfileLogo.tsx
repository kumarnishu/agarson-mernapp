import { Avatar,  Menu, MenuItem, Stack, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChoiceContext, UserChoiceActions } from '../../contexts/dialogContext';
import NewUserDialog from '../dialogs/users/NewUserDialog';
import EmailVerifySendMailDialog from '../dialogs/users/EmailVerifySendMailDialog';
import UpdateProfileDialog from '../dialogs/users/UpdateProfileDialog';
import UpdatePasswordDialog from '../dialogs/users/UpdatePasswordDialog';
import { UserContext } from '../../contexts/userContext';
import ProfileDialog from '../dialogs/users/ProfileDialog';
import LogoutButton from '../buttons/LogoutButton';
import { toTitleCase } from '../../utils/TitleCase';


function ProfileMenu() {
    const { user } = useContext(UserContext)
    const { setChoice } = useContext(ChoiceContext)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const goto = useNavigate()

    return (
        <>
            <NewUserDialog />
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
                        setChoice({ type: UserChoiceActions.view_profile })
                        setAnchorEl(null)
                    }
                    }

                >View Profile</MenuItem>
                <MenuItem
                    onClick={() => {
                        setChoice({ type: UserChoiceActions.update_profile })
                        setAnchorEl(null)
                    }
                    }

                >Update Profile</MenuItem>

                <MenuItem onClick={() => {
                    setChoice({ type: UserChoiceActions.update_password })
                    setAnchorEl(null)
                }}>
                    Update Password
                </MenuItem>

                {
                    !user?.email_verified ?

                        <MenuItem onClick={() => {
                            setChoice({ type: UserChoiceActions.verify_email })
                            setAnchorEl(null)
                        }}>
                            Verify Email
                        </MenuItem>
                        : null
                }
                <MenuItem>
                    <LogoutButton />
                </MenuItem>
            </Menu>
            <EmailVerifySendMailDialog />
            <UpdateProfileDialog />
            <UpdatePasswordDialog />
            {user && <ProfileDialog profile={user} />}
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
            <Typography variant='h5' sx={{ color: 'white',pl:1 }}> {toTitleCase(user?.username || "")}</Typography>
            <ProfileMenu />
        </Stack>
    )
}

export default ProfileLogo