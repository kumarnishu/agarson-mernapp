import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { CreateOrEditPaymentCategory } from '../../../services/PaymentsService';
import { DropDownDto } from '../../../dtos/dropdown.dto';

function CreateOrEditCategoryForm({ category,setDialog }: { category?: DropDownDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditPaymentCategory, {
            onSuccess: () => {
                queryClient.invalidateQueries('payment_categories')
            }
        })
  


    const formik = useFormik<{
        category: string
    }>({
        initialValues: {
            category: category ? category.label : ""
        },
        validationSchema:yup.object({
            category:yup.string().required()
        }),
        onSubmit: (values: {
            category: string,
        }) => {
            mutate({
                id:category?.id,
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

            {
                isError ? (
                    <>
                        {<AlertBar message={error?.response.data.message} color="error" />}
                    </>
                ) : null
            }
            {
                isSuccess ? (
                    <>
                        {!category ? <AlertBar message="new category created" color="success" /> : <AlertBar message="category updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditCategoryForm
