import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import { CreateOrEditStage } from '../../../services/LeadsServices';
import { ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { DropDownDto } from '../../../dtos/dropdown.dto';

function CreateOrEditLeadStageForm({ stage }: { stage?: DropDownDto}) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditStage, {
            onSuccess: () => {
                queryClient.invalidateQueries('crm_stages')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        stage: string
    }>({
        initialValues: {
            stage: stage ? stage.label : ""
        },
        validationSchema:yup.object({
            stage:yup.string().required()
        }),
        onSubmit: (values: {
            stage: string,
        }) => {
            mutate({
                id:stage?.id,
                body: {
                    key: values.stage
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
                        formik.touched.stage && formik.errors.stage ? true : false
                    }
                    autoFocus
                    id="stage"
                    label="Stage"
                    fullWidth
                    helperText={
                        formik.touched.stage && formik.errors.stage ? formik.errors.stage : ""
                    }
                    {...formik.getFieldProps('stage')}
                />
              
               

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !stage ? "Add Stage" : "Update Stage"}
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
                        {!stage ? <AlertBar message="new stage created" color="success" /> : <AlertBar message="stage updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditLeadStageForm
