import { Avatar, IconButton, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserMenuActions, MenuContext } from '../../contexts/menuContext';
import { ChoiceContext, UserChoiceActions } from '../../contexts/dialogContext';
import NewUserDialog from '../dialogs/users/NewUserDialog';
import EmailVerifySendMailDialog from '../dialogs/users/EmailVerifySendMailDialog';
import UpdateProfileDialog from '../dialogs/users/UpdateProfileDialog';
import UpdatePasswordDialog from '../dialogs/users/UpdatePasswordDialog';
import { UserContext } from '../../contexts/userContext';
import ProfileDialog from '../dialogs/users/ProfileDialog';
import { FeatureContext } from '../../contexts/featureContext';
import LogoutButton from '../buttons/LogoutButton';
import { toTitleCase } from '../../utils/TitleCase';


function ProfileMenu() {
    const { setFeature } = useContext(FeatureContext)
    const { menu, setMenu } = useContext(MenuContext)
    const { user } = useContext(UserContext)
    const { setChoice } = useContext(ChoiceContext)
    const goto = useNavigate()

    return (
        <>
            {/* new user dialog */}
            <NewUserDialog />
            <Menu
                anchorEl={menu?.anchorEl}
                open={Boolean(menu?.type === UserMenuActions.profile_menu)}
                onClose={() => setMenu({ type: UserMenuActions.close_user_menu, anchorEl: null })}
            >
                <MenuItem
                    onClick={() => {
                        setMenu({ type: UserMenuActions.close_user_menu, anchorEl: null })
                        setFeature({ feature: "Dashboard", url: "/" })
                        goto("/")
                    }
                    }
                >Dashboard</MenuItem>

                <MenuItem
                    onClick={() => {
                        setChoice({ type: UserChoiceActions.view_profile })
                        setMenu({ type: UserMenuActions.close_user_menu, anchorEl: null })
                    }
                    }

                >View Profile</MenuItem>
                <MenuItem
                    onClick={() => {
                        setChoice({ type: UserChoiceActions.update_profile })
                        setMenu({ type: UserMenuActions.close_user_menu, anchorEl: null })
                    }
                    }

                >Update Profile</MenuItem>

                <MenuItem onClick={() => {
                    setChoice({ type: UserChoiceActions.update_password })
                    setMenu({ type: UserMenuActions.close_user_menu, anchorEl: null })
                }}>
                    Update Password
                </MenuItem>

                {
                    !user?.email_verified ?

                        <MenuItem onClick={() => {
                            setChoice({ type: UserChoiceActions.verify_email })
                            setMenu({ type: UserMenuActions.close_user_menu, anchorEl: null })
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
    const { setMenu } = useContext(MenuContext)
    return (
       <Stack direction={'row'} justifyContent={'left'} alignItems={'center'}>
            <IconButton
                sx={{ border: 2, p: 0, mr: 1, borderColor: 'white' }}
                onClick={(e) => setMenu({ type: UserMenuActions.profile_menu, anchorEl: e.currentTarget })
                }
            >
                <Avatar
                    sx={{ width: 20, height: 20 }}
                    alt="img1" src={user?.dp} />
            </IconButton>
            <Typography variant='h5'> {toTitleCase(user?.username || "")}</Typography>
            <ProfileMenu />
       </Stack>
    )
}

export default ProfileLogo