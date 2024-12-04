import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { DropDownDto } from '../../../dtos';
import { CreateOrEditItemUnit } from '../../../services/ExpenseServices';


type props = {
    unit?: DropDownDto,
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}


function CreateOrEditItemUnitForm({ unit, setDialog }: props) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string
            },
            id?: string
        }>
        (CreateOrEditItemUnit, {
            onSuccess: () => {
                queryClient.invalidateQueries('units')
            }
        })



    const formik = useFormik<{
        unit: string
    }>({
        initialValues: {
            unit: unit ? unit.value : ""
        },
        validationSchema: yup.object({
            unit: yup.string().required()
        }),
        onSubmit: (values: {
            unit: string,
        }) => {
            mutate({
                id: unit?.id,
                body: {
                    key: values.unit
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
                <TextField
                    required
                    error={
                        formik.touched.unit && formik.errors.unit ? true : false
                    }
                    autoFocus
                    id="unit"
                    label="Unit"
                    fullWidth
                    helperText={
                        formik.touched.unit && formik.errors.unit ? formik.errors.unit : ""
                    }
                    {...formik.getFieldProps('unit')}
                />



                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !unit ? "Add Unit" : "Update Unit"}
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
                        {!unit ? <AlertBar message="new unit created" color="success" /> : <AlertBar message="unit updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditItemUnitForm
