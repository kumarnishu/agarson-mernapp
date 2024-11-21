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
import { GetKeyCategoryDto } from '../../../dtos';
import { CreateOrEditKeyCategory } from '../../../services/KeyServices';

function CreateOrEditKeyCategoryForm({ category }: { category?: GetKeyCategoryDto}) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string,
                display_name: string,
                skip_bottom_rows:number
            },
            id?: string
        }>
        (CreateOrEditKeyCategory, {
            onSuccess: () => {
                queryClient.invalidateQueries('key_categories')
            }
        })
  

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        category: string,
        display_name:string,
        skip_bottom_rows:number
    }>({
        initialValues: {
            category: category ? category.category : "",
            display_name: category ? category.display_name : "",
            skip_bottom_rows: category ? category.skip_bottom_rows:0
        },
        validationSchema:yup.object({
            category: yup.string().required(),
            display_name: yup.string().required(),
            skip_bottom_rows: yup.number().required()
        }),
        onSubmit: (values: {
            category: string,
            display_name: string,
            skip_bottom_rows:number
        }) => {
            mutate({
                id:category?._id,
                body: {
                    key: values.category, display_name: values.display_name, skip_bottom_rows: values.skip_bottom_rows
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

export default CreateOrEditKeyCategoryForm
