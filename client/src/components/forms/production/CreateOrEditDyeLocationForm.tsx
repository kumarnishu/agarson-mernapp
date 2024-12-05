import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { CreateOrEditDyeLocation } from '../../../services/ProductionServices';
import { GetDyeLocationDto } from '../../../dtos/dye-location.dto';

function CreateOrEditDyeLocationForm({ location,setDialog }: { location?: GetDyeLocationDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>>  }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                name: string,
                display_name: string
            },
            id?: string
        }>
        (CreateOrEditDyeLocation, {
            onSuccess: () => {
                queryClient.invalidateQueries('dyelocations')
            }
        })


    const formik = useFormik<{
        name: string,
        display_name: string
    }>({
        initialValues: {
            name: location ? location.name : "",
            display_name: location ? location.display_name : ""
        },
        validationSchema: yup.object({
            name: yup.string().required(),
            display_name: yup.string().required()
        }),
        onSubmit: (values: {
            name: string,
            display_name: string
        }) => {
            mutate({
                id: location?._id,
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
                gap={2}
                pt={2}
            >
                {/* remarks */}
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
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !location ? "Add " : "Update "}
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
                        {!location ? <AlertBar message="new location created" color="success" /> : <AlertBar message="location updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditDyeLocationForm
