import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import * as yup from 'yup';
import { AlertContext } from '../../../contexts/alertContext';
import { AuthorizationService } from '../../../services/AuthorizationService';
import { GetKeyCategoryDto } from '../../../dtos/response/AuthorizationDto';

function CreateOrEditKeyCategoryForm({ category, setDialog }: { category?: GetKeyCategoryDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string,
                display_name: string,
                skip_bottom_rows: number
            },
            id?: string
        }>
        (new AuthorizationService().CreateOrEditKeyCategory, {

            onSuccess: () => {
                queryClient.refetchQueries('key_categories')
                setAlert({ message: category ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        category: string,
        display_name: string,
        skip_bottom_rows: number
    }>({
        initialValues: {
            category: category ? category.category : "",
            display_name: category ? category.display_name : "",
            skip_bottom_rows: category ? Number(category.skip_bottom_rows) : 0
        },
        validationSchema: yup.object({
            category: yup.string().required(),
            display_name: yup.string().required(),
            skip_bottom_rows: yup.number().required()
        }),
        onSubmit: (values: {
            category: string,
            display_name: string,
            skip_bottom_rows: number
        }) => {
            mutate({
                id: category?._id,
                body: {
                    key: values.category, display_name: values.display_name, skip_bottom_rows: values.skip_bottom_rows
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
                        formik.touched.category && formik.errors.category ? true : false
                    }
                    autoFocus
                    id="category"
                    label="Category"
                    fullWidth
                    helperText={
                        formik.touched.category && formik.errors.category ? formik.errors.category : ""
                    }
                    {...formik.getFieldProps('category')}
                />
                <TextField
                    required
                    error={
                        formik.touched.display_name && formik.errors.display_name ? true : false
                    }
                    autoFocus
                    id="display_name"
                    label="Display Name"
                    fullWidth
                    helperText={
                        formik.touched.display_name && formik.errors.display_name ? formik.errors.display_name : ""
                    }
                    {...formik.getFieldProps('display_name')}
                />
                <TextField
                    required
                    error={
                        formik.touched.skip_bottom_rows && formik.errors.skip_bottom_rows ? true : false
                    }
                    autoFocus
                    id="skip_bottom_rows"
                    label="Skip Bottom Rows"
                    fullWidth
                    helperText={
                        formik.touched.skip_bottom_rows && formik.errors.skip_bottom_rows ? formik.errors.skip_bottom_rows : ""
                    }
                    {...formik.getFieldProps('skip_bottom_rows')}
                />

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !category ? "Add Category" : "Update Category"}
                </Button>
            </Stack>


        </form>
    )
}

export default CreateOrEditKeyCategoryForm
