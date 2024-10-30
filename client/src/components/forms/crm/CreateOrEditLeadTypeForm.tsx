import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import {  CreateOrEditLeadType } from '../../../services/LeadsServices';
import { ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { DropDownDto } from '../../../dtos';

function CreateOrEditLeadTypeForm({ type }: { type?: DropDownDto}) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditLeadType, {
            onSuccess: () => {
                queryClient.invalidateQueries('crm_types')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        type: string
    }>({
        initialValues: {
            type: type ? type.value : ""
        },
        validationSchema:yup.object({
            type:yup.string().required()
        }),
        onSubmit: (values: {
            type: string,
        }) => {
            mutate({
                id:type?.id,
                body: {
                    key: values.type
                }
            })
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: LeadChoiceActions.close_lead })
           
        }
    }, [isSuccess, setChoice])
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
                        formik.touched.type && formik.errors.type ? true : false
                    }
                    autoFocus
                    id="type"
                    label="Lead Type"
                    fullWidth
                    helperText={
                        formik.touched.type && formik.errors.type ? formik.errors.type : ""
                    }
                    {...formik.getFieldProps('type')}
                />
              
               

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !type ? "Add Lead Type" : "Update Lead Type"}
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
                        {!type ? <AlertBar message="new type created" color="success" /> : <AlertBar message="type updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditLeadTypeForm
