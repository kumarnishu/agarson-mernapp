import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';
import { CreateOrEditMachineDto } from '../../../dtos/DropDownDto';
import { GetMachineDto, DropDownDto } from '../../../dtos/DropDownDto';

function CreateOrEditMachineForm({ machine, setDialog }: { machine?: GetMachineDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetMachineDto>, BackendError, {
            body: CreateOrEditMachineDto, id?: string
        }>
        (new DropdownService().CreateOrEditMachine, {

            onSuccess: () => {
                queryClient.refetchQueries('machines')
                setAlert({ message: machine ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { data: catgeories } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("machine_catgeories", new DropdownService().GetMachineCategories, {
        staleTime: 10000
    })

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
            setDialog(undefined)
        }
    }, [isSuccess])
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

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default CreateOrEditMachineForm
