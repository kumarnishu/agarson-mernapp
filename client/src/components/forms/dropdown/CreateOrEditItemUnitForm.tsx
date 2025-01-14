import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import {  useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import * as yup from 'yup';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';
import { DropDownDto } from '../../../dtos/response/DropDownDto';


type props = {
    unit?: DropDownDto,
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}


function CreateOrEditItemUnitForm({ unit, setDialog }: props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (new DropdownService().CreateOrEditItemUnit, {
          
            onSuccess: () => {
                queryClient.refetchQueries('units')
                setAlert({ message: unit ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        unit: string
    }>({
        initialValues: {
            unit: unit ? unit.label : ""
        },
        validationSchema: yup.object({
            unit: yup.string().required()
        }),
        onSubmit: (values: {
            unit: string,
        }) => {
            mutate({
                id: unit?.id,
                body: {
                    key: values.unit
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
                        formik.touched.unit && formik.errors.unit ? true : false
                    }
                    autoFocus
                    id="unit"
                    label="Unit"
                    fullWidth
                    helperText={
                        formik.touched.unit && formik.errors.unit ? formik.errors.unit : ""
                    }
                    {...formik.getFieldProps('unit')}
                />



                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !unit ? "Add Unit" : "Update Unit"}
                </Button>
            </Stack>

           

        </form>
    )
}

export default CreateOrEditItemUnitForm
