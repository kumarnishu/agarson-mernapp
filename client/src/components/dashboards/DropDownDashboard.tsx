import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { AssignmentOutlined } from "@mui/icons-material";


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
    user?.assigned_permissions.includes('expense_item_view') && tmpfeatures.push({ feature: 'expense item ', is_visible: true, url: "PaymentCategoriesPage" })
    user?.assigned_permissions.includes('expense_location_view') && tmpfeatures.push({ feature: 'expense location ', is_visible: true, url: "PaymentCategoriesPage" })
    user?.assigned_permissions.includes('item_unit_view') && tmpfeatures.push({ feature: 'Item unit ', is_visible: true, url: "ItemUnitPage" })


    setFeatures(tmpfeatures)

  }, [user])

  return (
    <>
      <Grid container >
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


export default DropDownDashboard