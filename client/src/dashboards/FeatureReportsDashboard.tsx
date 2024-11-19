import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { ButtonLogo } from "../components/logo/Agarson";

function FeatureReportsDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)

    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []

        user?.assigned_permissions.includes('activities_view') && tmpfeatures.push({ feature: 'Crm activities ', is_visible: true, url: "CrmActivitiesPage" })

        user?.assigned_permissions.includes('assignedrefer_view') && tmpfeatures.push({ feature: 'Assigned refers', is_visible: true, url: "AssignedReferReportPage" })
        user?.assigned_permissions.includes('newrefer_view') && tmpfeatures.push({ feature: 'New customers  ', is_visible: true, url: "NewReferReportPage" })
        user?.assigned_permissions.includes('shoe_weight_report_view') && tmpfeatures.push({ feature: 'Shoe weight difference', is_visible: true, url: "ShowWeightDifferenceReportPage" })
        user?.assigned_permissions.includes('dye_status_report_view') && tmpfeatures.push({ feature: 'Dye status ', is_visible: true, url: "DyeStatusReportPage" })
        user?.assigned_permissions.includes('machine_wise_production_report_view') && tmpfeatures.push({ feature: 'Machine wise production ', is_visible: true, url: "MachineWiseProductionReportPage" })
        user?.assigned_permissions.includes('machine_category_wise_production_report_view') && tmpfeatures.push({ feature: 'Category wise production', is_visible: true, url: "CategoryWiseProductionReportPage" }),
        user?.assigned_permissions.includes('thekedar_wise_production_report_view') && tmpfeatures.push({ feature: 'Thekedar wise production', is_visible: true, url: "ThekedarWiseProductionReportPage" })

        setFeatures(tmpfeatures)

    }, [user])

    return (
        <>
            <Grid container sx={{ pt: 2 }} >
                {features.map((feat, index) => {
                    return (
                        <Grid key={index} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                            <Link to={feat.url} style={{ textDecoration: 'none' }}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        m: 0,
                                        height: 60,
                                        borderRadius: 3,
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
                                        <ButtonLogo title="" height={20} width={20} />
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
        </>
    )
}


export default FeatureReportsDashboard