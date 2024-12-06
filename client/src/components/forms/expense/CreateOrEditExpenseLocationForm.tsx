import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import {  useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import * as yup from 'yup';
import { CreateOrEditExpenseLocation } from '../../../services/ExpenseServices';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';


type props = {
    location?: DropDownDto,
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function CreateOrEditExpenseLocationForm({ location, setDialog }: props) {
    const { setAlert } = useContext(AlertContext)
     const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditExpenseLocation, {
          
            onSuccess: () => {
                queryClient.refetchQueries('exp_locations')
                setAlert({ message: location ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        location: string
    }>({
        initialValues: {
            location: location ? location.label : ""
        },
        validationSchema: yup.object({
            location: yup.string().required()
        }),
        onSubmit: (values: {
            location: string,
        }) => {
            mutate({
                id: location?.id,
                body: {
                    key: values.location
                }
            })
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)

        }
    }, [isSuccess])
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack
                gap={2}
                pt={2}
            >
                <TextField
                    required
                    error={
                        formik.touched.location && formik.errors.location ? true : false
                    }
                    autoFocus
                    id="location"
                    label="Location"
                    fullWidth
                    helperText={
                        formik.touched.location && formik.errors.location ? formik.errors.location : ""
                    }
                    {...formik.getFieldProps('location')}
                />



                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !location ? "Add Location" : "Update Location"}
                </Button>
            </Stack>

           
        </form>
    )
}

export default CreateOrEditExpenseLocationForm
