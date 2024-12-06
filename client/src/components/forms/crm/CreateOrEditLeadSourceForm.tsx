import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { CreateOrEditSource } from '../../../services/LeadsServices';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import * as yup from 'yup';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';

function CreateOrEditLeadSourceForm({ source, setDialog }: { source?: DropDownDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditSource, {

            onSuccess: () => {
                queryClient.invalidateQueries('crm_sources')
                setAlert({ message: source ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik<{
        source: string
    }>({
        initialValues: {
            source: source ? source.label : ""
        },
        validationSchema: yup.object({
            source: yup.string().required()
        }),
        onSubmit: (values: {
            source: string,
        }) => {
            mutate({
                id: source?.id,
                body: {
                    key: values.source
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
                {/* remarks */}
                <TextField
                    required
                    error={
                        formik.touched.source && formik.errors.source ? true : false
                    }
                    autoFocus
                    id="source"
                    label="Lead Source"
                    fullWidth
                    helperText={
                        formik.touched.source && formik.errors.source ? formik.errors.source : ""
                    }
                    {...formik.getFieldProps('source')}
                />



                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !source ? "Add Lead Source" : "Update Lead Source"}
                </Button>
            </Stack>


        </form>
    )
}

export default CreateOrEditLeadSourceForm
