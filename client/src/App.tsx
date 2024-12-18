import { useContext } from "react";
import AppRoutes from "./Routes";
import { LoadingContext } from "./contexts/loaderContext";
import { Button, LinearProgress } from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import AlertBar from "./components/snacks/AlertBar";
import { AlertContext } from "./contexts/alertContext";
import { UserContext } from "./contexts/userContext";
import { useMutation } from "react-query";
import { AxiosResponse } from "axios";
import { GetUserDto } from "./dtos/user.dto";
import { BackendError } from ".";
import { BackTomyAccount } from "./services/UserServices";
import { GetLoginByThisUserDto } from "./dtos/auth.dto";

function App() {
  const { loading } = useContext(LoadingContext)
  const { alert, setAlert } = useContext(AlertContext)
  const { user } = useContext(UserContext)

  const { mutate } = useMutation
    <AxiosResponse<{ user: GetUserDto, token: string }>,
      BackendError,
      { body: GetLoginByThisUserDto }
    >(BackTomyAccount, {
      onSuccess: () => {
        window.location.reload()
      },
      onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
    })

  if (!localStorage.getItem('multi_login_token'))
    localStorage.setItem('multi_login_token', uuidv4())

  return (
    <>
      {user && user?.impersonated_user && user?.impersonated_user.is_admin && <Button disabled={true} onClick={() => mutate({ body: { user_id: user?._id || "", impersnate_id: user?.impersonated_user._id || "" } })}>{`Back To ${user.impersonated_user.username}`}</Button >}
      {alert && <AlertBar message={alert.message} color={alert.color} variant={alert.variant} />
      }
      {!loading && < AppRoutes />}
      {loading && <LinearProgress />}
    </>
  )
}


export default App