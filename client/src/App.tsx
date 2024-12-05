import { useContext } from "react";
import AppRoutes from "./Routes";
import { LoadingContext } from "./contexts/loaderContext";
import { createTheme, LinearProgress, ThemeProvider, useTheme } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';
import AlertBar from "./components/snacks/AlertBar";
import { AlertContext } from "./contexts/alertContext";

function App() {
  const { loading } = useContext(LoadingContext)
  const { alert } = useContext(AlertContext)
  if (!localStorage.getItem('multi_login_token'))
    localStorage.setItem('multi_login_token', uuidv4())

  const globalTheme = useTheme();

  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode,
          primary: globalTheme.palette.primary,
          info: {
            main: globalTheme.palette.error.light,
          }
        },
        typography: {
          button: {
            textTransform: 'none',
            fontSize: '1.2rem',
          },
        },
        components: {
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: '1.1rem',
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              thumb: {
                color: 'error',
              },
            },
          },
        },
      }),
    [globalTheme],
  );
  return (
    <>
      <ThemeProvider theme={tableTheme}>
        {alert && <AlertBar message={alert.message} color={alert.color} variant={alert.variant} />}
        {!loading && < AppRoutes />}
        {loading && <LinearProgress />}
      </ThemeProvider>
    </>
  )
}


export default App