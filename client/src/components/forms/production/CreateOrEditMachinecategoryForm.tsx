import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { CreateOrEditMachineCategory } from '../../../services/ProductionServices';
import { DropDownDto } from '../../../dtos/dropdown.dto';

function CreateOrEditMachinecategoryForm({ machine_category }: { machine_category?: DropDownDto }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditMachineCategory, {
            onSuccess: () => {
                queryClient.invalidateQueries('machine_categories')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        category: string
    }>({
        initialValues: {
            category: machine_category ? machine_category.label : ""
        },
        validationSchema: yup.object({
            category: yup.string().required()
        }),
        onSubmit: (values) => {
            mutate({
                id: machine_category?.id,
                body: { key: values.category }
            })
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: ProductionChoiceActions.close_production })

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
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !machine_category ? "Add " : "Update "}
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
                        {!machine_category ? <AlertBar message="new machine_category created" color="success" /> : <AlertBar message="machine_category updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditMachinecategoryForm
