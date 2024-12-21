import { LinearProgress } from '@mui/material'
import { AxiosResponse } from 'axios'
import { useEffect, useMemo } from 'react'
import { useMutation } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { UserService } from '../services/UserServices'
import { BackendError } from '..'


export default function EmailVerifyPage() {
  const goto = useNavigate()
  const { token } = useParams()
  const { mutate, isSuccess, isLoading } = useMutation
    <AxiosResponse<string>, BackendError, string>
    (new UserService().VerifyEmail)
  const tokenmemo = useMemo(() => token, [token])
  useEffect(() => {
    if (tokenmemo)
      mutate(tokenmemo)
  }, [mutate, tokenmemo])

  useEffect(() => {
    setTimeout(() => {
      goto("/")
    }, 1500)
  }, [goto, isSuccess])

  return (
    <>

      {isLoading ? <LinearProgress /> : null
      }
    </>
  )
}
