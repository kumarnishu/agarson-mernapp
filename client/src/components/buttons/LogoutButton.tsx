import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../contexts/userContext'
import { Button } from '@mui/material'
import { AlertContext } from '../../contexts/alertContext'
import { UserService } from '../../services/UserServices'

function LogoutButton() {
    const { mutate } = useMutation(new UserService().Logout)
    const goto = useNavigate()
    const { setAlert } = useContext(AlertContext)
    const { setUser } = useContext(UserContext)
    return (
        <Button size="small" fullWidth color="error" variant="contained"
            onClick={
                () => {
                    mutate()
                    setUser(undefined)
                    goto("/Login")
                    setAlert({ message: 'Logged Out', color: 'success' })
                }
            }
        >
            Logout
        </Button>
    )
}

export default LogoutButton
