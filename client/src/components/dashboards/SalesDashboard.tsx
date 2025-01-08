import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { AssignmentOutlined } from "@mui/icons-material";

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


export default SalesDashboard