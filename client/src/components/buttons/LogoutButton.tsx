import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../contexts/userContext'
import { Button } from '@mui/material'
import { Logout } from '../../services/UserServices'

function LogoutButton() {
    const { mutate } = useMutation(Logout)
    const goto = useNavigate()
    const { setUser } = useContext(UserContext)
    return (
        <Button size="small"  fullWidth color="error" variant="contained"
            onClick={
                () => {
                    mutate()
                    setUser(undefined)
                    goto("/Login")
                }
            }
        >
            Logout
        </Button>
    )
}

export default LogoutButton
