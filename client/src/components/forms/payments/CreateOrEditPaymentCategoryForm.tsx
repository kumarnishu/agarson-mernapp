import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import { CheckListChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { DropDownDto } from '../../../dtos';
import { CreateOrEditPaymentCategory } from '../../../services/PaymentsService';

function CreateOrEditCategoryForm({ category }: { category?: DropDownDto}) {
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
  

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        category: string
    }>({
        initialValues: {
            category: category ? category.value : ""
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
            setChoice({ type: CheckListChoiceActions.close_checklist })
           
        }
    }, [isSuccess, setChoice])
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
