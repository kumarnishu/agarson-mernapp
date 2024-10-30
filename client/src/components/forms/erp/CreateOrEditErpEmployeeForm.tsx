import { Button, CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import { ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { CreateOrEditErpEmployeeDto, GetErpEmployeeDto } from '../../../dtos';
import { CreateOreditErpErpEmployee } from '../../../services/ErpServices';

function CreateOrEditErpEmployeeForm({ employee }: { employee?: GetErpEmployeeDto }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            employee: GetErpEmployeeDto | undefined;
            body: CreateOrEditErpEmployeeDto
        }>
        (CreateOreditErpErpEmployee, {
            onSuccess: () => {
                queryClient.invalidateQueries('erp_employees')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik({
        initialValues: {
            name: employee ? employee.name : "",
            display_name: employee ? employee.display_name : ""
        },
        validationSchema: yup.object({
            name: yup.string().required()
        }),
        onSubmit: (values) => {
            mutate({
                employee: employee,
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
        <form onSubmit={formik.handleSubmit} style={{ paddingTop: '10px' }}>
           
           
            <Stack
                gap={2}
                pt={2}
            >
                <TextField
                    required
                    error={
                        formik.touched.name && formik.errors.name ? true : false
                    }
                    autoFocus
                    id="name"
                    label="Name"
                    fullWidth
                    helperText={
                        formik.touched.name && formik.errors.name ? formik.errors.name : ""
                    }
                    {...formik.getFieldProps('name')}
                />
                <TextField
                    required
                    error={
                        formik.touched.display_name && formik.errors.display_name ? true : false
                    }
                    autoFocus
                    id="display_name"
                    label="Display Name"
                    fullWidth
                    helperText={
                        formik.touched.display_name && formik.errors.display_name ? formik.errors.display_name : ""
                    }
                    {...formik.getFieldProps('display_name')}
                />

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !employee ? "Add Employee" : "Update Employee"}
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
                        {!employee ? <AlertBar message="new employee created" color="success" /> : <AlertBar message="employee updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditErpEmployeeForm
