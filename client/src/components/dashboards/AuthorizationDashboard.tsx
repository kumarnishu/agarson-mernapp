import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { AssignmentOutlined } from "@mui/icons-material";


function AuthorizationDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)

    //process feature and access
    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []
        user?.assigned_permissions.includes('states_view') && tmpfeatures.push({ feature: 'states', is_visible: true, url: "CrmStatesPage" })
        user?.assigned_permissions.includes('city_view') && tmpfeatures.push({ feature: 'cities', is_visible: true, url: "CitiesPage" })
        user?.assigned_permissions.includes('key_view') && tmpfeatures.push({ feature: 'Keys ', is_visible: true, url: "KeysPage" })
        user?.assigned_permissions.includes('key_category_view') && tmpfeatures.push({ feature: 'Key Categories ', is_visible: true, url: "KeysCategoriesPage" })
        user?.assigned_permissions.includes('user_assignment_view') && tmpfeatures.push({ feature: 'User Assignement ', is_visible: true, url: "UserAssignementPage" })


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
                        minHeight: 80,
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
                            fontWeight: 'bold', fontSize: 14,letterSpacing:1.2
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


export default AuthorizationDashboard