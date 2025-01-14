import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import {  useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { CrmService } from '../../../services/CrmService';
import { GetLeadDto, GetReferDto } from '../../../dtos/response/CrmDto';



function RemoveLeadReferForm({ lead ,setDialog}: { lead: GetLeadDto , setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
     const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<GetReferDto>, BackendError, { id: string, body: { remark: string } }>
        (new CrmService(). RemoveReferLead, {
           
            onSuccess: () => {
                queryClient.refetchQueries('leads')
                setAlert({ message:  "removed refer", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
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
          setDialog(undefined) 
        }
    }, [isSuccess])

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

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default RemoveLeadReferForm
