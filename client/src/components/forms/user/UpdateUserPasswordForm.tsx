import { Visibility, VisibilityOff } from '@mui/icons-material';
import {  Button, CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import * as Yup from 'yup';
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { UpdateUserPassword } from '../../../services/UserServices';
import { BackendError } from '../../..';
import AlertBar from '../../snacks/AlertBar';
import { GetUserDto } from '../../../dtos/user.dto';


function UpdateUserPasswordForm({ user }: { user: GetUserDto }) {
    const { mutate, isSuccess, isLoading, isError, error } = useMutation
        <AxiosResponse<string>,
            BackendError,
            { id: string, body: { newPassword: string, confirmPassword: string } }
        >(UpdateUserPassword)

    const { setChoice } = useContext(ChoiceContext)
    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: ""
        },
        validationSchema: Yup.object({
            newPassword: Yup.string()
                .min(4, 'Must be 4 characters or more')
                .max(30, 'Must be 30 characters or less')
                .required('Required field'),
            confirmPassword: Yup.string()
                .min(4, 'Must be 4 characters or more')
                .max(30, 'Must be 30 characters or less')
                .required('Required field')
        }),
        onSubmit: (values: {
            newPassword: string,
            confirmPassword: string
        }) => {
            mutate({
                id: user._id,
                body: values
            })
        },
    });

    // passworrd handling
    const [visiblity, setVisiblity] = useState(false);
    const handlePasswordVisibility = () => {
        setVisiblity(!visiblity);
    };
    const handleMouseDown = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault()
    };
    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: UserChoiceActions.close_user })
        }
    }, [setChoice, isSuccess,])

    return (
        <form onSubmit={formik.handleSubmit}>

            <Stack
                direction="column"
                pt={2}
                gap={2}
            >
                <TextField
                    required
                    error={
                        formik.touched.newPassword && formik.errors.newPassword ? true : false
                    }
                    id="newPassword"
                    
                    label="New Password"
                    fullWidth
                    helperText={
                        formik.touched.newPassword && formik.errors.newPassword ? formik.errors.newPassword : ""
                    }
                    type={visiblity ? "text" : "password"}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handlePasswordVisibility}
                                    onMouseDown={(e) => handleMouseDown(e)}
                                >
                                    {visiblity ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    {...formik.getFieldProps('newPassword')}
                />
                <TextField
                    required
                    error={
                        formik.touched.confirmPassword && formik.errors.confirmPassword ? true : false
                    }
                    id="confirmPassword"
                    
                    label="Confirm Password"
                    fullWidth
                    helperText={
                        formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : ""
                    }
                    type={visiblity ? "text" : "password"}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handlePasswordVisibility}
                                    onMouseDown={(e) => handleMouseDown(e)}
                                >
                                    {visiblity ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    {...formik.getFieldProps('confirmPassword')}
                />
              
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="updated password" color="success" />
                    ) : null
                }
                <Button variant="contained"
                    disabled={Boolean(isLoading)}
                    color="primary" type="submit" fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Update"}</Button>
            </Stack>
        </form>
    )
}

export default UpdateUserPasswordForm
