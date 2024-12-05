import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { GetMachineCategories, CreateOrEditMachine } from '../../../services/ProductionServices';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { GetMachineDto, CreateOrEditMachineDto } from '../../../dtos/machine.dto';


function CreateOrEditMachineForm({ machine }: { machine?: GetMachineDto }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetMachineDto>, BackendError, {
            body: CreateOrEditMachineDto, id?: string
        }>
        (CreateOrEditMachine, {
            onSuccess: () => {
                queryClient.invalidateQueries('machines')
            }
        })
    const { data: catgeories } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("machine_catgeories", GetMachineCategories, {
        staleTime: 10000
    })
    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik({
        initialValues: {
            name: machine ? machine.name : "",
            display_name: machine ? machine.display_name : "",
            category: machine ? machine.category : "",
            serial_no: machine ? machine.serial_no : 0
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Required field'),
            display_name: Yup.string()
                .required('Required field'),
            category: Yup.string()
                .required('Required field'),
            serial_no: Yup.number().required("required")


        }),
        onSubmit: (values) => {
            if (machine) {
                mutate({ id: machine._id, body: { name: values.name, display_name: values.display_name, category: values.category, serial_no: values.serial_no } })
            }
            else {
                mutate({ body: values })
            }

        }
    });



    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: ProductionChoiceActions.close_production })
        }
    }, [isSuccess, setChoice])
    console.log(formik.errors)
    return (
        <form onSubmit={formik.handleSubmit}>

            <Stack
                direction="column"
                gap={2}
                pt={2}
            >
                <TextField
                    required
                    fullWidth
                    error={
                        formik.touched.name && formik.errors.name ? true : false
                    }
                    id="name"
                    label="Name"
                    helperText={
                        formik.touched.name && formik.errors.name ? formik.errors.name : ""
                    }
                    {...formik.getFieldProps('name')}
                />
                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.serial_no && formik.errors.serial_no ? true : false
                    }
                    id="serial_no"
                    label="Serial no"
                    helperText={
                        formik.touched.serial_no && formik.errors.serial_no ? formik.errors.serial_no : ""
                    }
                    {...formik.getFieldProps('serial_no')}
                />
                <TextField


                    required
                    fullWidth
                    error={
                        formik.touched.display_name && formik.errors.display_name ? true : false
                    }
                    id="display_name"
                    label="Display Name"
                    helperText={
                        formik.touched.display_name && formik.errors.display_name ? formik.errors.display_name : ""
                    }
                    {...formik.getFieldProps('display_name')}
                />
                < TextField
                    size='small'
                    select
                    SelectProps={{
                        native: true,
                    }}
                    fullWidth
                    required
                    error={
                        formik.touched.category && formik.errors.category ? true : false
                    }
                    focused
                    id="category"
                    label="category"
                    helperText={
                        formik.touched.category && formik.errors.category ? formik.errors.category : ""
                    }
                    {...formik.getFieldProps('category')}
                >
                    <option key={"01"} value={undefined}>
                        Select
                    </option>
                    {machine &&
                        <option key={"02"} value={machine.category}>
                            {machine.category}
                        </option>
                    }
                    {
                        catgeories && catgeories.data.map((category, index) => {
                            return (<option key={index} value={category.id}>
                                {category.label}
                            </option>)
                        })
                    }
                </TextField>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message={machine ? "machine updated" : "created"} color="success" />
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

export default CreateOrEditMachineForm
