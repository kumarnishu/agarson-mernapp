import { Grid, Paper, Stack, Typography } from '@mui/material';
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
    user?.assigned_permissions.includes('attendnace_menu') && tmpfeatures.push({ feature: 'Attendance', is_visible: true, url: "/Attendance" })
    user?.assigned_permissions.includes('authorization_menu') && tmpfeatures.push({ feature: 'Authorization', is_visible: true, url: "/Authorization" })
    user?.assigned_permissions.includes('checklist_menu') && tmpfeatures.push({ feature: 'Checklists', is_visible: true, url: "/Checklists" })
    user?.assigned_permissions.includes('production_menu') && tmpfeatures.push({ feature: 'Production', is_visible: true, url: "/Production" })
    user?.assigned_permissions.includes('crm_menu') && tmpfeatures.push({ feature: 'CRM', is_visible: true, url: "/CRM" })
    user?.assigned_permissions.includes('expense_menu') && tmpfeatures.push({ feature: 'Expense', is_visible: true, url: "/Expense" })
    user?.assigned_permissions.includes('payment_menu') && tmpfeatures.push({ feature: 'Payments', is_visible: true, url: "/Payments" })
    user?.assigned_permissions.includes('driver_app_menu') && tmpfeatures.push({ feature: 'Driver App', is_visible: true, url: "/DriverApp" })
    user?.assigned_permissions.includes('dropdown_menu') && tmpfeatures.push({ feature: 'Dropdowns', is_visible: true, url: "/DropDown" })
    user?.assigned_permissions.includes('excel_db_menu') && tmpfeatures.push({ feature: 'Excel Reports', is_visible: true, url: "/ExcelDB" })
    user?.assigned_permissions.includes('stock_scheme_menu') && tmpfeatures.push({ feature: 'Article Stock Scheme', is_visible: true, url: "/ArticleStockScheme" })
    // tmpfeatures.sort((a, b) => a.feature.localeCompare(b.feature));

    setFeatures(tmpfeatures)

  }, [user])
  return (
    <>
      <Grid container  >
        {features.map((feat, index) => {
          return (
            <Grid key={index} item xs={12} md={3} lg={3} sx={{ p: 1 }}>
              <Link to={feat.url} style={{ textDecoration: 'none' }}>
                <Paper
                  sx={{
                    p: 2,
                    m: 0,
                    height:80,
                    position: 'relative',
                    overflow: 'hidden',
                     backdropFilter: 'blur(10px)',
                        borderRadius:2, // Blurry effect
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
                                            component="h1"
                                            sx={{
                                                fontWeight: 'bold', fontSize: 14, letterSpacing: 1.2
                                            }}
                                        >
                                            {feat.feature.toUpperCase()}
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