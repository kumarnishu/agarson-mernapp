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
import { DropDownDto } from '../../../dtos/DropDownDto';
function CreateOrEditMachinecategoryForm({ machine_category, setDialog }: { machine_category?: DropDownDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (new DropdownService().CreateOrEditMachineCategory, {

            onSuccess: () => {
                queryClient.refetchQueries('machine_categories')
                setAlert({ message: machine_category ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


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
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !machine_category ? "Add " : "Update "}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditMachinecategoryForm
