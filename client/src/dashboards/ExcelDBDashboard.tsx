import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { ButtonLogo } from "../components/logo/Agarson";
import { toTitleCase } from "../utils/TitleCase";
import { BackendError } from "..";
import { DropDownDto } from "../dtos";
import { AxiosResponse } from "axios";
import { useQuery } from "react-query";
import { GetAllKeyCategoriesForDropdown } from "../services/KeyServices";
import { ExcelDbButtons } from "../components/buttons/ExcelDbButtons";

function ExcelDBDashboard() {
    const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)
    const { data: categoryData } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_categories"], async () => GetAllKeyCategoriesForDropdown({ show_assigned_only: true }))


    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []

        if (categoryData && categoryData.data) {
            categoryData.data.map((dt) => {
                tmpfeatures.push({ feature: dt.value, is_visible: true, url: `ExcelDbReports/${dt.id}/${dt.value}` })
            })
        }
        user?.assigned_permissions.includes('salesman_leaves_report_view') && tmpfeatures.push({ feature: 'salesmen leaves report ', is_visible: false, url: "SalesmanLeavesReportPage" })
        setFeatures(tmpfeatures)

    }, [user, categoryData])


    return (
        <>

           
            <Grid container sx={{ pt: 2 }} >
                <Grid key={0} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
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
                        {user?.assigned_permissions.includes("excel_db_create") && <ExcelDbButtons />}
                    </Paper>
                </Grid>
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
                                            {feat.feature && toTitleCase(feat.feature)}
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


export default ExcelDBDashboard