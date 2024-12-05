import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { CreateOrEditState } from '../../../services/LeadsServices';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { GetCrmStateDto } from '../../../dtos/crm-state.dto';

function CreateOrEditStateForm({ state,setDialog }: { state?: GetCrmStateDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                state: string,
                alias1: string,
                alias2: string,
            },
            id?: string
        }>
        (CreateOrEditState, {
            onSuccess: () => {
                queryClient.invalidateQueries('crm_states')
            }
        })


    const formik = useFormik<{
        state: string,
        alias1: string,
        alias2: string,
    }>({
        initialValues: {
            state: state ? state.state : "",
            alias1: state ? state.alias1 : "",
            alias2: state ? state.alias2 : "",
         
        },
        validationSchema:yup.object({
            state: yup.string().required(),
            alias1: yup.string(),
            alias2: yup.string(),
        }),
        onSubmit: (values: {
            state: string,
            alias1: string,
            alias2: string,
        }) => {
            mutate({
                id:state?._id,
                body: {
                    state: values.state,
                    alias1: values.alias1,
                    alias2: values.alias2
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
                        formik.touched.state && formik.errors.state ? true : false
                    }
                    autoFocus
                    id="state"
                    label="State"
                    fullWidth
                    helperText={
                        formik.touched.state && formik.errors.state ? formik.errors.state : ""
                    }
                    {...formik.getFieldProps('state')}
                />
                <TextField
                    error={
                        formik.touched.alias1 && formik.errors.alias1 ? true : false
                    }
                    autoFocus
                    id="alias1"
                    label="Alias1"
                    fullWidth
                    helperText={
                        formik.touched.alias1 && formik.errors.alias1 ? formik.errors.alias1 : ""
                    }
                    {...formik.getFieldProps('alias1')}
                />
                <TextField
                    error={
                        formik.touched.alias2 && formik.errors.alias2 ? true : false
                    }
                    autoFocus
                    id="alias2"
                    label="Alias2"
                    fullWidth
                    helperText={
                        formik.touched.alias2 && formik.errors.alias2 ? formik.errors.alias2 : ""
                    }
                    {...formik.getFieldProps('alias2')}
                />
               

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !state ? "Add State" : "Update State"}
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
                        {!state ? <AlertBar message="new state created" color="success" /> : <AlertBar message="state updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditStateForm
