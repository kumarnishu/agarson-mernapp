import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import * as yup from 'yup';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';
import { DropDownDto } from '../../../dtos/response/DropDownDto';



function CreateOrEditCategoryForm({ category, setDialog }: {
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>,
    category?: DropDownDto
}) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (new DropdownService().CreateOrEditCheckCategory, {

            onSuccess: () => {
                queryClient.invalidateQueries('check_categories')
                setAlert({ message: category ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        category: string
    }>({
        initialValues: {
            category: category ? category.label : ""
        },
        validationSchema: yup.object({
            category: yup.string().required()
        }),
        onSubmit: (values: {
            category: string,
        }) => {
            mutate({
                id: category?.id,
                body: {
                    key: values.category
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



                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !category ? "Add Category" : "Update Category"}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditCategoryForm
