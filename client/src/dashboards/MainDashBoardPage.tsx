import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import { UserContext } from '../contexts/userContext';
import { FeatureContext } from '../contexts/featureContext';
import { ButtonLogo } from '../components/logo/Agarson';
import React, { useContext, useEffect, useState } from 'react';
import ProfileLogo from '../components/logo/ProfileLogo';
import LogoutButton from '../components/buttons/LogoutButton';
import { toTitleCase } from '../utils/TitleCase';

function MainDashBoardPage() {
  const navigate = useNavigate()
  const { feature, setFeature } = useContext(FeatureContext)
  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext)
  const [features, setFeatures] = useState<{ feature: string, url: string, is_visible?: boolean, icon?: Element }[]>([])

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 150, marginTop: 2 }} role="presentation" onClick={toggleDrawer(false)}>
      <Stack ml={1}> <ProfileLogo /></Stack>
      <List>
        {features.map((feat, index) => (
          <React.Fragment key={index}>
            {feat && feat.is_visible && < Link style={{ textDecoration: 'none', color: 'black' }} to={feat.url} onClick={() => {
              setFeature({ feature: feat.feature.toUpperCase(), url: feat.url })
            }}>
              <Stack direction={'row'} gap={1} p={1} justifyContent={'center'} alignItems={'center'}>
                <ButtonLogo title="" height={15} width={15} />
                <ListItemText sx={{ textAlign: 'left' }} primary={toTitleCase(feat.feature)} />
              </Stack>
              <Divider />
            </Link >}
          </React.Fragment >
        ))}
        <Stack sx={{p:0.2,bottom:0}}><LogoutButton /></Stack>
      </List>
    </Box >
  );



  useEffect(() => {
    let tmpfeatures: { feature: string, is_visible?: boolean, url: string }[] = []
    tmpfeatures.push({ feature: 'Home', is_visible: true, url: "/Home" })
    user?.is_admin && tmpfeatures.push({ feature: 'Users', is_visible: true, url: "/Users" })
    user?.assigned_permissions.includes('feature_menu') && tmpfeatures.push({ feature: 'Features', is_visible: true, url: "/Features" })
    user?.assigned_permissions.includes('report_menu') && tmpfeatures.push({ feature: 'Reports', is_visible: true, url: "/Reports" })
    user?.assigned_permissions.includes('dropdown_menu') && tmpfeatures.push({ feature: 'DropDown', is_visible: true, url: "/DropDown" })

    setFeatures(tmpfeatures)

  }, [user])
  return (
    <>

      <Paper sx={{ bgcolor: 'whitesmoke', width: '100vw'}}>
        {/* parent stack */}
        <Stack direction="row" sx={{
          justifyContent: "space-between", alignItems: "center"
        }}
        >
          <Stack direction="row" gap={2} pl={1} justifyContent={'center'} alignItems={'center'}>

            <ProfileLogo />

          </Stack>

          <Stack
            direction="row"
            justifyContent={"center"}
            alignItems="center"
            gap={2}
          >
            <Link to={feature ? feature.url : "/"} onDoubleClick={() => {
              {
                setFeature({ feature: "Dashboard", url: "/" })
                navigate("/")
              }
            }} replace={true} style={{ textDecoration: 'none' }}>
              <Paper sx={{ ml: 2, p: 0.5, bgcolor: 'white', boxShadow: 1, borderRadius: 1, borderColor: 'white' }}>
                <Stack flexDirection={"row"} gap={2} sx={{ alignItems: 'center' }}>
                  <ButtonLogo title="" height={20} width={20} />
                  <Typography variant="button" sx={{ fontSize: 12 }} component="div">
                    {toTitleCase(feature?.feature || "Dashboard")}
                  </Typography>
                </Stack>
              </Paper>
            </Link>

            <IconButton onClick={toggleDrawer(true)} size='small'>
              < MenuIcon sx={{ width: 35, height: 35, color: 'inherit' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Paper >



      {feature?.feature == "Dashboard" ?

        <>
          <Stack direction={'row'} gap={2} alignItems={'center'}>
            Dashboard
          </Stack> :
        </>
        :
        <Outlet />}

      <Drawer open={open} onClose={toggleDrawer(false)} anchor='right'>
        {DrawerList}
      </Drawer>

    </>

  )
}


export default MainDashBoardPage