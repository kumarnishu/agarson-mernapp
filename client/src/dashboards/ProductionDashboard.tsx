import { Grid, Paper, Stack, Typography } from "@mui/material"
import { paths } from "../Routes"
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { BlueAgarsonLogo } from "../components/logo/Agarson";
import sortBy from "sort-by";
import { UserContext } from "../contexts/userContext";

function ProductionDashboard() {
  const [features, setFeatures] = useState<{ feature: string, is_visible: boolean, url: string }[]>([])
  const { user } = useContext(UserContext)

  //process feature and access
  useEffect(() => {
    let tmpfeatures: { feature: string, is_visible: boolean, url: string }[] = []
    tmpfeatures.push({ feature: 'my production ', is_visible: true, url: paths.production })
    tmpfeatures.push({ feature: 'my sole weight', is_visible: true, url: paths.my_shoe_weight })
    tmpfeatures.push({ feature: 'my dye repair', is_visible: true, url: paths.my_dye_repair })
    tmpfeatures.push({ feature: 'my running mould', is_visible: true, url: paths.my_running_mould })
    user?.productions_access_fields.is_editable && tmpfeatures.push({ feature: 'production reports', is_visible: true, url: paths.production_admin })
    user?.productions_access_fields.is_editable && tmpfeatures.push({ feature: 'sole weight reports', is_visible: true, url: paths.shoe_weight })
    user?.productions_access_fields.is_editable && tmpfeatures.push({ feature: 'dye repair reports', is_visible: true, url: paths.dye_repair })
    user?.productions_access_fields.is_editable && tmpfeatures.push({ feature: 'running mould reports', is_visible: true, url: paths.running_mould })
    let sortedData = tmpfeatures.sort(sortBy('feature'))
    setFeatures(sortedData)
  }, [])

  return (
    <>
      <Grid container sx={{ pt: 2 }} >
        {features.map((feat, index) => {
          return (
            <Grid key={index} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
              <Link to={feat.url} style={{ textDecoration: 'none' }}>
                <Paper sx={{ p: 2, bgcolor: 'white', boxShadow: 2, border: 10, borderRadius: 3, borderColor: 'white' }}>
                  <Stack flexDirection={"row"} gap={2} sx={{ alignItems: 'center' }}>
                    <BlueAgarsonLogo width={35} height={35} title='users' />
                    <Typography variant="body1" sx={{ fontSize: 16, textTransform: 'capitalize' }} component="div">
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


export default ProductionDashboard