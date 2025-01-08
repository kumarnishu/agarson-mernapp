import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { Assignment } from "@mui/icons-material";


function DropDownDashboard() {
  const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
  const { user } = useContext(UserContext)

  //process feature and access
  useEffect(() => {
    let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []
    user?.assigned_permissions.includes('leadtype_view') && tmpfeatures.push({ feature: 'Lead types', is_visible: true, url: "LeadTypesPage" })
    user?.assigned_permissions.includes('lead_source_view') && tmpfeatures.push({ feature: 'Lead source', is_visible: true, url: "LeadSourcesPage" })
    user?.assigned_permissions.includes('leadstage_view') && tmpfeatures.push({ feature: 'Lead stage', is_visible: true, url: "StagesPage" })
    user?.assigned_permissions.includes('dye_location_view') && tmpfeatures.push({ feature: 'Dye location  ', is_visible: true, url: "DyeLocationsPage" })
    user?.assigned_permissions.includes('article_view') && tmpfeatures.push({ feature: 'Articles', is_visible: true, url: "ArticlePage" })
    user?.assigned_permissions.includes('machine_view') && tmpfeatures.push({ feature: 'Machines ', is_visible: true, url: "MachinePage" })
    user?.assigned_permissions.includes('machine_category_view') && tmpfeatures.push({ feature: 'Machine categories ', is_visible: true, url: "MachineCategoriesPage" })
    user?.assigned_permissions.includes('dye_view') && tmpfeatures.push({ feature: 'Dyes ', is_visible: true, url: "DyePage" })
    user?.assigned_permissions.includes('checklist_category_view') && tmpfeatures.push({ feature: 'Checklist category ', is_visible: true, url: "ChecklistCategoriesPage" })
    user?.assigned_permissions.includes('payment_category_view') && tmpfeatures.push({ feature: 'Payment category ', is_visible: true, url: "PaymentCategoriesPage" })
    user?.assigned_permissions.includes('expense_category_view') && tmpfeatures.push({ feature: 'expense category ', is_visible: true, url: "ExpenseCategoriesPage" })
 
    user?.assigned_permissions.includes('expense_location_view') && tmpfeatures.push({ feature: 'expense location ', is_visible: true, url: "ExpenseLocationPage" })
    user?.assigned_permissions.includes('item_unit_view') && tmpfeatures.push({ feature: 'Item unit ', is_visible: true, url: "ItemUnitPage" })
    user?.assigned_permissions.includes('expense_item_view') && tmpfeatures.push({ feature: 'Expense Item ', is_visible: true, url: "ExpenseItemsPage" })
    // tmpfeatures.sort((a, b) => a.feature.localeCompare(b.feature));
    setFeatures(tmpfeatures)

  }, [user])

  return (
    <>
      <Grid container >
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


export default DropDownDashboard