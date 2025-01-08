import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { AssignmentOutlined } from "@mui/icons-material";

function ProductionDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)

    //process feature and access
    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []
 
        user?.assigned_permissions.includes('production_view') && tmpfeatures.push({ feature: 'production ', is_visible: false, url: "ProductionPage" })
        user?.assigned_permissions.includes('spare_dye_view') && tmpfeatures.push({ feature: 'Spare Dyes ', is_visible: false, url: "SpareDyesPage" })
        user?.assigned_permissions.includes('sole_thickness_view') && tmpfeatures.push({ feature: 'Sole Thickness ', is_visible: false, url: "SoleThicknessPage" })
        user?.assigned_permissions.includes('shoe_weight_view') && tmpfeatures.push({ feature: 'shoe weights ', is_visible: false, url: "ShoeWeightPage" })
        user?.assigned_permissions.includes('shoe_weight_report_view') && tmpfeatures.push({ feature: 'Shoe weight difference', is_visible: true, url: "ShowWeightDifferenceReportPage" })
        user?.assigned_permissions.includes('dye_status_report_view') && tmpfeatures.push({ feature: 'Dye status ', is_visible: true, url: "DyeStatusReportPage" })
        user?.assigned_permissions.includes('machine_wise_production_report_view') && tmpfeatures.push({ feature: 'Machine wise production ', is_visible: true, url: "MachineWiseProductionReportPage" })
        user?.assigned_permissions.includes('machine_category_wise_production_report_view') && tmpfeatures.push({ feature: 'Category wise production', is_visible: true, url: "CategoryWiseProductionReportPage" }),
          user?.assigned_permissions.includes('thekedar_wise_production_report_view') && tmpfeatures.push({ feature: 'Thekedar wise production', is_visible: true, url: "ThekedarWiseProductionReportPage" })
      

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


export default ProductionDashboard