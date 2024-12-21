import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { AssignmentOutlined } from "@mui/icons-material";


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
        user?.assigned_permissions.includes('expense_store_view') && tmpfeatures.push({ feature: 'Expense Store ', is_visible: false, url: "ExpenseStorePage" })
        user?.assigned_permissions.includes('driver_system_view') && tmpfeatures.push({ feature: 'Driver System ', is_visible: false, url: "DriverAppSystemPage" })
        user?.assigned_permissions.includes('activities_view') && tmpfeatures.push({ feature: 'Crm activities ', is_visible: true, url: "CrmActivitiesPage" })

        user?.assigned_permissions.includes('assignedrefer_view') && tmpfeatures.push({ feature: 'Assigned refers', is_visible: true, url: "AssignedReferReportPage" })
        user?.assigned_permissions.includes('newrefer_view') && tmpfeatures.push({ feature: 'New customers  ', is_visible: true, url: "NewReferReportPage" })
        user?.assigned_permissions.includes('shoe_weight_report_view') && tmpfeatures.push({ feature: 'Shoe weight difference', is_visible: true, url: "ShowWeightDifferenceReportPage" })
        user?.assigned_permissions.includes('dye_status_report_view') && tmpfeatures.push({ feature: 'Dye status ', is_visible: true, url: "DyeStatusReportPage" })
        user?.assigned_permissions.includes('machine_wise_production_report_view') && tmpfeatures.push({ feature: 'Machine wise production ', is_visible: true, url: "MachineWiseProductionReportPage" })
        user?.assigned_permissions.includes('machine_category_wise_production_report_view') && tmpfeatures.push({ feature: 'Category wise production', is_visible: true, url: "CategoryWiseProductionReportPage" }),
          user?.assigned_permissions.includes('thekedar_wise_production_report_view') && tmpfeatures.push({ feature: 'Thekedar wise production', is_visible: true, url: "ThekedarWiseProductionReportPage" })
        user?.assigned_permissions.includes('expense-transaction_report_view') && tmpfeatures.push({ feature: 'Expense Transactions Report', is_visible: true, url: "ExpenseTransactionReports" })
        tmpfeatures.sort((a, b) => a.feature.localeCompare(b.feature));
        setFeatures(tmpfeatures)
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


export default FeatureDashboard