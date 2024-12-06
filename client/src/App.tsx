import { useContext } from "react";
import AppRoutes from "./Routes";
import { LoadingContext } from "./contexts/loaderContext";
import { LinearProgress } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import AlertBar from "./components/snacks/AlertBar";
import { AlertContext } from "./contexts/alertContext";

function App() {
  const { loading } = useContext(LoadingContext)
  const { alert } = useContext(AlertContext)
  if (!localStorage.getItem('multi_login_token'))
    localStorage.setItem('multi_login_token', uuidv4())



  return (
    <>
      {alert && <AlertBar message={alert.message} color={alert.color} variant={alert.variant} />}
      {!loading && < AppRoutes />}
      {loading && <LinearProgress />}
    </>
  )
}


export default App