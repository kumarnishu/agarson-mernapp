import { Alert, Snackbar } from '@mui/material'
import { useContext } from 'react'
import { AlertContext } from '../../contexts/alertContext'


type Props = {
    message: string,
    color: "error" | "warning" | "success" | "info",
    variant?: "filled" | "outlined"
}
function AlertBar({ message, color, variant }: Props) {
    const { alert, setAlert } = useContext(AlertContext)
    return (
        <Snackbar
            open={alert ? true : false}
            color={color}
            autoHideDuration={6000}
            onClose={() => setAlert(undefined)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            message={message}
        >
            <Alert variant={variant || "filled"} onClose={() => setAlert(undefined)} severity={color} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>

    )
}

export default AlertBar