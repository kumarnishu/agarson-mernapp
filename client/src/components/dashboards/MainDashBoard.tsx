import {  Grid,  Paper, Stack, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/userContext';
import { AssignmentOutlined } from "@mui/icons-material";

function MainDashBoard() {
  const { user } = useContext(UserContext)
  const [features, setFeatures] = useState<{ feature: string, url: string }[]>([])

  useEffect(() => {
    let tmpfeatures: { feature: string, is_visible?: boolean, url: string }[] = []
    user?.is_admin && tmpfeatures.push({ feature: 'Users', is_visible: true, url: "/Users" })
    user?.assigned_permissions.includes('sales_menu') && tmpfeatures.push({ feature: 'Sales', is_visible: true, url: "/Sales" })
    user?.assigned_permissions.includes('authorization_menu') && tmpfeatures.push({ feature: 'Authorization', is_visible: true, url: "/Authorization" })
    user?.assigned_permissions.includes('feature_menu') && tmpfeatures.push({ feature: 'Features', is_visible: true, url: "/Features" })
    user?.assigned_permissions.includes('dropdown_menu') && tmpfeatures.push({ feature: 'Dropdowns', is_visible: true, url: "/DropDown" })
    user?.assigned_permissions.includes('excel_db_menu') && tmpfeatures.push({ feature: 'Excel Reports', is_visible: true, url: "/ExcelDB" })


    setFeatures(tmpfeatures)

  }, [user])
  return (
    <>
      <Grid container  >
        {features.map((feat, index) => {
          return (
            <Grid key={index} item xs={12} md={4} lg={4} sx={{ p: 1 }}>
              <Link to={feat.url} style={{ textDecoration: 'none' }}>
                <Paper
                 sx={{
                  p: 2,
                  m: 0,
                  minHeight: 60,
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)', // Blurry effect
                  backgroundColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent blue
                  transition: '0.3s',
                  '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: 'rgba(70, 130, 180, 0.7)', // Darken on hover
                  },
              }}
                >
                  <Stack
                    flexDirection="row"
                    gap={2}
                    sx={{ alignItems: 'center' }}
                  >
                    <AssignmentOutlined />
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: 'medium', fontSize: 14
                      }}
                    >
                      {feat.feature}
                    </Typography>
                  </Stack>
                </Paper>
              </Link>
            </Grid>
          )
        })}
      </Grid>
      <Outlet />
    </>

  )
}


export default MainDashBoard