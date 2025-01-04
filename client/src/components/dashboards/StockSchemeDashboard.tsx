import { Grid, Paper, Stack, Typography } from "@mui/material"
import { Link, Outlet } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/userContext";
import { AssignmentOutlined } from "@mui/icons-material";


function StockSchemeDashboard() {
  const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
  const { user } = useContext(UserContext)

  //process feature and access
  useEffect(() => {
    let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []
    user?.assigned_permissions.includes('article_stock_scheme_view') && tmpfeatures.push({ feature: 'Article Stocks', is_visible: true, url: "ArticleStockPage" })
    user?.assigned_permissions.includes('consumed_stock_view') && tmpfeatures.push({ feature: 'Stock Consumed', is_visible: true, url: "ArticleConsumedStockpage" })
   


    // tmpfeatures.sort((a, b) => a.feature.localeCompare(b.feature));

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


export default StockSchemeDashboard