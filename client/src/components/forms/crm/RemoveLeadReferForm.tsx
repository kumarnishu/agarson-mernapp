import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import {  ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { RemoveReferLead } from '../../../services/LeadsServices';
import { GetLeadDto } from '../../../dtos/lead.dto';
import { GetReferDto } from '../../../dtos/refer.dto';


function RemoveLeadReferForm({ lead }: { lead: GetLeadDto }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetReferDto>, BackendError, { id: string, body: { remark: string } }>
        (RemoveReferLead, {
            onSuccess: () => {
                queryClient.invalidateQueries('leads')
            }
        })
    const { setChoice } = useContext(ChoiceContext)
    const formik = useFormik({
        initialValues: {
            remark: ""

        },
        validationSchema: Yup.object({
            remark: Yup.string()
                .required('Required field')


        }),
        onSubmit: (values) => {
            mutate({
                id: lead._id,
                body: values
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
                direction="column"
                gap={2}
                pt={2}
            >
                <TextField
                    autoFocus
                    required
                    fullWidth
                    multiline
                    minRows={4}
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    id="remark"
                    label="Remarks"
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />

                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="removed refer successfully" color="success" />
                    ) : null
                }
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default RemoveLeadReferForm
