import { Button, CircularProgress, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { ResetPasswordSendMail } from '../../../services/UserServices';
import { UserContext } from '../../../contexts/userContext';
import { BackendError } from '../../..';
import AlertBar from '../../snacks/AlertBar';



function ResetPasswordSendMailForm({ setDialog }: { setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
  const goto = useNavigate()
  const { user } = useContext(UserContext)

  const { mutate, isSuccess, isLoading, isError, error } = useMutation
    <AxiosResponse<string>,
      BackendError,
      { email: string }
    >
    (ResetPasswordSendMail)

  const formik = useFormik({
    initialValues: {
      email: user?.email || ""
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email()
        .required('Required field')
    }),
    onSubmit: (values: {
      email: string
    }) => {
      mutate(values)
    },
  });
  useEffect(() => {
    if (isSuccess) {
      setDialog(undefined)
      goto("/")
    }
  }, [goto, isSuccess])
  return (
    <form onSubmit={formik.handleSubmit}>

      <Stack
        direction="column"
        pt={2}
        gap={2}
      >
        <TextField
          type="email"
          variant="filled"
          fullWidth
          required
          error={
            formik.touched.email && formik.errors.email ? true : false
          }
          id="email"
          label="Your Email"
          helperText={
            formik.touched.email && formik.errors.email ? formik.errors.email : "This will mail you a password reset link in your inbox ! If Not Found , please check your spam folder"
          }
          {...formik.getFieldProps('email')}
        />
        {
          isError ? (
            <AlertBar message={error?.response.data.message} color="error" />
          ) : null
        }
        {
          isSuccess ? (
            <AlertBar message="reset password link sent to your provided email" color="success" />
          ) : null
        }

        <Button variant="contained"
          disabled={Boolean(isLoading)}
          color="primary" type="submit" fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Send"}
        </Button>
      </Stack>
    </form>
  )
}

export default ResetPasswordSendMailForm
