import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { Assignment } from "@mui/icons-material";

function SalesDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)

    //process feature and access
    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []

        user?.assigned_permissions.includes('salesman_attendance_view') && tmpfeatures.push({ feature: 'Salesman Daily Visit New/old/Time - Chanchal', is_visible: true, url: "SalesmanAttendance" })
        user?.assigned_permissions.includes('salesman_attendance_auto_view') && tmpfeatures.push({ feature: 'Salesman Daily Visit New/old/Time - Auto', is_visible: true, url: "SalesmanAttendanceAuto" })
        user?.assigned_permissions.includes('salesman_kpi_view') && tmpfeatures.push({ feature: 'Salesman KPI Report', is_visible: true, url: "SalesmanKPI" })
        user?.assigned_permissions.includes('salesman_visit_view') && tmpfeatures.push({ feature: 'Salesman Last 3 days VisitSummary', is_visible: true, url: "SalesmanVisit" })
        setFeatures(tmpfeatures)
        user?.assigned_permissions.includes('salesman_leaves_report_view') && tmpfeatures.push({ feature: 'salesmen leaves report ', is_visible: false, url: "SalesmanLeavesReportPage" })
        user?.assigned_permissions.includes('references_report_view') && tmpfeatures.push({ feature: 'References Report ', is_visible: false, url: "ReferencesReportPage" })
        user?.assigned_permissions.includes('salesman_references_report_view') && tmpfeatures.push({ feature: 'Salesman References Report ', is_visible: false, url: "ReferenceReportPageSalesman" })
        user?.assigned_permissions.includes('salesman_references_report_view') && tmpfeatures.push({ feature: 'Sales ', is_visible: false, url: "ReferenceReportPageSalesman" })

        user?.assigned_permissions.includes('salesman_references_report_view') && tmpfeatures.push({ feature: 'Collection ', is_visible: false, url: "ReferenceReportPageSalesman" })

        user?.assigned_permissions.includes('salesman_references_report_view') && tmpfeatures.push({ feature: 'Ageing 25,30,55,60,70,90,120+ ', is_visible: false, url: "ReferenceReportPageSalesman" })


        // tmpfeatures.sort((a, b) => a.feature.localeCompare(b.feature));
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


export default SalesDashboard