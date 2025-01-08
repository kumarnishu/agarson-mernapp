import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { useQuery } from "react-query";
import { BackendError } from "../..";
import { UserContext } from "../../contexts/userContext";
import { DropDownDto } from "../../dtos/dropdown.dto";
import { CheckBox } from "@mui/icons-material";
import { toTitleCase } from "../../utils/TitleCase";
import { ExcelDbButtons } from "../buttons/ExcelDbButtons";
import { AuthorizationService } from "../../services/AuthorizationService";

function ExcelDBDashboard() {
    const [features, setFeatures] = useState<{ feature: string, display_name: string, is_visible: boolean, url: string }[]>([])
    const { user } = useContext(UserContext)
    const { data: categoryData } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_category_dropdown"], async () => new AuthorizationService().GetAllKeyCategoriesForDropdown({ show_assigned_only: true }))


    useEffect(() => {
        let tmpfeatures: { feature: string, is_visible: boolean, display_name: string, url: string }[] = []
        if (user && categoryData && categoryData.data) {
            categoryData.data.map((dt) => {
                tmpfeatures.push({ feature: dt.label, display_name: dt.label && dt.label, is_visible: true, url: `ExcelDbReports/${dt.id}` })
            })
        }
        // tmpfeatures.sort((a, b) => (a.feature || "").localeCompare(b.feature || "")); // Fallback to empty string if undefined

        setFeatures(tmpfeatures)

    }, [user, categoryData])


    return (
        <>
            {user?.assigned_permissions.includes('grp_excel_create') && <Stack sx={{ width: '100%' }} direction={'row'} p={2} justifyContent={'end'}>
                <ExcelDbButtons />
            </Stack>}
            <Grid container  >
                {features.map((feat, index) => {
                    return (
                        <Grid key={index} item xs={12} md={3} lg={3} sx={{ p: 1 }}>
                            <Link title={feat.display_name} to={feat.url} style={{ textDecoration: 'none' }}>
                                <Paper
                                    sx={{
                                        m: 0,
                                        p: 1,
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
                                        <CheckBox />
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


export default ExcelDBDashboard