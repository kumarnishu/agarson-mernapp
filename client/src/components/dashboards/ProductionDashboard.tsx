import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { Assignment } from "@mui/icons-material";

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


export default ProductionDashboard