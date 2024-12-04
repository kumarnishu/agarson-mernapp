import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { ButtonLogo } from "../components/logo/Agarson";
import { toTitleCase } from "../utils/TitleCase";

function FeatureDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)

    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []

        

        user?.assigned_permissions.includes('leads_view') && tmpfeatures.push({ feature: 'leads ', is_visible: false, url: "LeadsPage" })
        user?.assigned_permissions.includes('refer_view') && tmpfeatures.push({ feature: 'customers', is_visible: false, url: "RefersPage" })
        user?.assigned_permissions.includes('reminders_view') && tmpfeatures.push({ feature: 'crm reminders', is_visible: false, url: "RemindersPage" })
       

        user?.assigned_permissions.includes('checklist_view') && tmpfeatures.push({ feature: 'CheckLists ', is_visible: false, url: "CheckListPage" })
        user?.assigned_permissions.includes('checklist_admin_view') && tmpfeatures.push({ feature: 'CheckLists Admin ', is_visible: false, url: "CheckListAdminPage" })


      
        user?.assigned_permissions.includes('payments_view') && tmpfeatures.push({ feature: 'Payments ', is_visible: false, url: "PaymentsPage" })
        
       

        user?.assigned_permissions.includes('production_view') && tmpfeatures.push({ feature: 'production ', is_visible: false, url: "ProductionPage" })
        user?.assigned_permissions.includes('spare_dye_view') && tmpfeatures.push({ feature: 'Spare Dyes ', is_visible: false, url: "SpareDyesPage" })
        user?.assigned_permissions.includes('sole_thickness_view') && tmpfeatures.push({ feature: 'Sole Thickness ', is_visible: false, url: "SoleThicknessPage" })
        user?.assigned_permissions.includes('shoe_weight_view') && tmpfeatures.push({ feature: 'shoe weights ', is_visible: false, url: "ShoeWeightPage" })
        tmpfeatures.push({ feature: 'Expense Store ', is_visible: false, url: "ShoeWeightPage" })

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
                                        borderRadius: 4,
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
                                                fontWeight: 'medium',
                                                fontSize:14
                                            }}
                                        >
                                            {toTitleCase(feat.feature)}
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


export default FeatureDashboard