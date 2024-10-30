import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import { UserContext } from '../contexts/userContext';
import { FeatureContext } from '../contexts/featureContext';
import AgarsonLogo, { ButtonLogo } from '../components/logo/Agarson';
import React, { useContext, useEffect, useState } from 'react';
import { LineChart, PieChart } from '@mui/x-charts';
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
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <Stack direction={'row'} justifyContent={'center'} mr={4}>
        <Link to="/" replace={true} onClick={() => {
          {
            setFeature({ feature: "Dashboard", url: "/" })
            navigate("/")
          }
        }}>
          <AgarsonLogo width={120} height={120} title='Go To Dashboard' />
        </Link>
      </Stack>
      <List>
        {features.map((feat, index) => (
          <React.Fragment key={index}>
            {feat && feat.is_visible && < Link style={{ textDecoration: 'none', color: 'black' }} to={feat.url} onClick={() => {
              setFeature({ feature: feat.feature.toUpperCase(), url: feat.url })
            }}>
              <Divider />
              <ListItem key={index} >
                <ListItemButton >
                  <ButtonLogo title="" height={25} width={25} />
                  <ListItemText sx={{ pl: 1 }} primary={feat.feature.toUpperCase()} />
                </ListItemButton>
              </ListItem>
            </Link >}
          </React.Fragment >

        ))}
        <ListItem sx={{ px: 1, pt: 4 }} key={'sojs'} disablePadding>

          <LogoutButton />
        </ListItem>
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

      <Box sx={{ bgcolor: '#059ff7', width: '100%' }}>
        {/* parent stack */}
        <Stack direction="row" sx={{
          justifyContent: "space-between", alignItems: "center"
        }}
        >
          {/* child stack1 */}
          <Stack direction="row" gap={2} pl={2} justifyContent={'center'} alignItems={'center'}>

            <ProfileLogo />

          </Stack>
          {/* child stack2 */}

          {/* child stack3 */}
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
              <Paper sx={{ ml: 2, p: 1, bgcolor: 'white', boxShadow: 1, borderRadius: 1, borderColor: 'white' }}>
                <Stack flexDirection={"row"} gap={2} sx={{ alignItems: 'center' }}>
                  <ButtonLogo title="" height={20} width={20} />
                  <Typography variant="button" sx={{ fontSize: 12 }} component="div">
                    {toTitleCase(feature?.feature || "Dashboard")}
                  </Typography>
                </Stack>
              </Paper>
            </Link>

            <IconButton onClick={toggleDrawer(true)} size='large'>
              < MenuIcon sx={{ width: 35, height: 35, color: 'white' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box >



      {feature?.feature == "Dashboard" ?

        <>
          <Stack direction={'row'} gap={2} alignItems={'center'}>
            <LineChart
              xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
              series={[
                {
                  data: [2, 5.5, 2, 8.5, 1.5, 5],
                },
              ]}
              width={500}
              height={300}
            />
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: 10, label: 'series A' },
                    { id: 1, value: 15, label: 'series B' },
                    { id: 2, value: 20, label: 'series C' },
                  ],
                },
              ]}
              width={400}
              height={200}
            />
            <LineChart
              xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
              series={[
                {
                  data: [2, 5.5, 2, 8.5, 1.5, 5],
                  area: true,
                },
              ]}
              width={500}
              height={300}
            />
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