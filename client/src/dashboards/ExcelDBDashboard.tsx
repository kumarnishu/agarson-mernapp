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
    const [features, setFeatures] = useState<{ feature: string, display_name: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)
    const { data: categoryData } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_category_dropdown"], async () => GetAllKeyCategoriesForDropdown({ show_assigned_only: true }))


    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, display_name: string, url: string }[] = []

        if (user && categoryData && categoryData.data) {
            console.log(categoryData?.data)
            categoryData.data.map((dt) => {
                tmpfeatures.push({ feature: dt.value, display_name: dt.label && dt.label, is_visible: true, url: `ExcelDbReports/${dt.id}/${dt.value}` })
            })
        }
        user?.assigned_permissions.includes('salesman_leaves_report_view') && tmpfeatures.push({ feature: 'salesmen leaves report ', display_name: "", is_visible: false, url: "SalesmanLeavesReportPage" })
        setFeatures(tmpfeatures)

    }, [user, categoryData])


    return (
        <>

            {user?.assigned_permissions.includes('grp_excel_create') && <Stack sx={{ width: '100%' }} direction={'row'} p={2} justifyContent={'end'}>
                <ExcelDbButtons />
            </Stack>}
            <Grid container sx={{ pt: 2 }} >
                {features.map((feat, index) => {
                    return (
                        <Grid key={index} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                            <Link to={feat.url} style={{ textDecoration: 'none' }}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        m: 0,
                                        height: 100,
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
                                    <br />
                                    {feat.display_name && <Typography title={toTitleCase(feat.display_name)} sx={{ pl: 4,fontSize:11 }}>{`${toTitleCase(feat.display_name)} `}</Typography>}
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