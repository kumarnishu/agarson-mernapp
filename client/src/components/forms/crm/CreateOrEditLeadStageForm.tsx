import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { CreateOrEditStage } from '../../../services/LeadsServices';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import * as yup from 'yup';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';

function CreateOrEditLeadStageForm({ stage ,setDialog}: { stage?: DropDownDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditStage, {
          
            onSuccess: () => {
                queryClient.invalidateQueries('crm_stages')
                setAlert({ message: stage ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


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

          
        </form>
    )
}

export default CreateOrEditLeadStageForm
