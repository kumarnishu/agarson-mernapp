import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import * as yup from 'yup';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';

function CreateOrEditLeadTypeForm({ type ,setDialog}: { type?: DropDownDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (new DropdownService().CreateOrEditLeadType, {
           
            onSuccess: () => {
                queryClient.invalidateQueries('crm_types')
                setAlert({ message: type ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik<{
        type: string
    }>({
        initialValues: {
            type: type ? type.label : ""
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

           

        </form>
    )
}

export default CreateOrEditLeadTypeForm
