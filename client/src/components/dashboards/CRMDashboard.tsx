import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { Assignment } from "@mui/icons-material";

function CRMDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)

    //process feature and access
    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []

        user?.assigned_permissions.includes('leads_view') && tmpfeatures.push({ feature: 'leads ', is_visible: false, url: "LeadsPage" })
        user?.assigned_permissions.includes('refer_view') && tmpfeatures.push({ feature: 'customers', is_visible: false, url: "RefersPage" })
        user?.assigned_permissions.includes('reminders_view') && tmpfeatures.push({ feature: 'crm reminders', is_visible: false, url: "RemindersPage" })
        user?.assigned_permissions.includes('assignedrefer_view') && tmpfeatures.push({ feature: 'Assigned refers', is_visible: true, url: "AssignedReferReportPage" })
        user?.assigned_permissions.includes('newrefer_view') && tmpfeatures.push({ feature: 'New customers  ', is_visible: true, url: "NewReferReportPage" })
        user?.assigned_permissions.includes('activities_view') && tmpfeatures.push({ feature: 'Crm activities ', is_visible: true, url: "CrmActivitiesPage" })

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
                                                                       height: 80,
                                                                       position: 'relative',
                                                                       overflow: 'hidden',
                                                                       backdropFilter: 'blur(12px)',
                                                                       borderRadius: 3,
                                                                       background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(240, 248, 255, 0.8))', // Gradient background
                                                                       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Soft shadow
                                                                       transition: 'all 0.3s ease-in-out',
                                                                       '&:hover': {
                                                                           transform: 'translateY(-4px)',
                                                                           boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)', // Deeper shadow on hover
                                                                           background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.8), rgba(100, 149, 237, 0.8))', // Slightly darker gradient
                                                                       },
                                                                   }}
                                                               >
                                                                   <Stack
                                                                       flexDirection="row"
                                                                       gap={2}
                                                                       alignItems="center"
                                                                       sx={{
                                                                           height: '100%',
                                                                       }}
                                                                   >
                                                                       <Assignment />
                                                                       <Typography
                                                                           variant="h6"
                                                                           component="h1"
                                                                           sx={{
                                                                               fontWeight: 'bold',
                                                                               fontSize: 14,
                                                                               letterSpacing: 1.2,
                                                                               color: 'rgba(50, 50, 50, 0.9)', // Slightly darker text
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


export default CRMDashboard