import { Avatar, Paper, Stack, Typography } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/userContext';
import { toTitleCase } from '../../utils/TitleCase';
import { CheckBox } from "@mui/icons-material";
import { ProfileMenu } from '../logo/ProfileLogo';


function AttendanceNavbar() {
    const { user } = useContext(UserContext)
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);
    const navigate = useNavigate()
    return (
        <>

            <Paper sx={{ bgcolor: 'grey', width: '100vw' }}>
                {/* parent stack */}
                <Stack direction="row" sx={{
                    px: 1,
                    justifyContent: "space-between", alignItems: "center"
                }}
                >
                    <Stack direction={'row'} justifyContent={'left'} alignItems={'center'} sx={{ cursor: 'pointer' }} onClick={(e) => {
                        if (e.currentTarget)
                            setAnchorEl(e.currentTarget)
                    }}>
                        <Avatar
                            sx={{ width: 20, height: 20 }}
                            alt="img1" src={user?.dp} />
                        <Typography variant='h5' sx={{ color: 'white', pl: 1 }}> {toTitleCase(user?.username || "")}</Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        justifyContent={"center"}
                        alignItems="center"
                        gap={2}
                    >
                        <Link to={"/Attendance"} title="Double-click to access the main dashboard, or single-click to return." onDoubleClick={() => navigate("/")} replace={true} style={{ textDecoration: 'none' }}>
                            <Paper sx={{ ml: 2, p: 0.5, bgcolor: 'white', boxShadow: 1, borderRadius: 1, borderColor: 'white' }}>
                                <Stack flexDirection={"row"} gap={2} sx={{ alignItems: 'center' }}>
                                    <CheckBox />
                                    <Typography variant="button" sx={{ fontSize: 12 }} component="div">
                                        Attendance
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Link>

                        < MenuIcon onClick={(e) => {
                            if (e.currentTarget)
                                setAnchorEl(e.currentTarget)
                        }} sx={{ width: 35, height: 35, color: 'white', cursor: 'pointer' }} />
                    </Stack>
                </Stack>
            </Paper >
            <Outlet />
            <ProfileMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
        </>

    )
}


export default AttendanceNavbar