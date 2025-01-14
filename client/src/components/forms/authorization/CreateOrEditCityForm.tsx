import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import * as yup from 'yup';
import { toTitleCase } from '../../../utils/TitleCase';
import { AlertContext } from '../../../contexts/alertContext';
import { AuthorizationService } from '../../../services/AuthorizationService';
import { CreateOrEditCrmCity } from '../../../dtos/request/AuthorizationDto';
import { GetCrmStateDto } from '../../../dtos/response/AuthorizationDto';

function CreateOrEditCityForm({ city, setDialog }: { city?: CreateOrEditCrmCity, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const [states, setStates] = useState<GetCrmStateDto[]>([])
    const { data, isSuccess: isStateSuccess } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>("crm_states",new AuthorizationService(). GetAllStates)
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                city: string,
                alias1: string,
                alias2: string,
                state: string
            },
            id?: string
        }>
        (new AuthorizationService().CreateOrEditCity, {

            onSuccess: () => {
                queryClient.invalidateQueries('crm_cities')
                setAlert({ message: city ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        city: string,
        alias1: string,
        alias2: string,
        state: string
    }>({
        initialValues: {
            city: city ? city.city : "",
            alias1: city ? city.alias1 : "",
            alias2: city ? city.alias2 : "",
            state: city ? city.state : ""
        },
        validationSchema: yup.object({
            city: yup.string().required(),
            alias1: yup.string(),
            alias2: yup.string(),
            state: yup.string().required()
        }),
        onSubmit: (values: {
            city: string,
            alias1: string,
            alias2: string,
            state: string,
        }) => {
            mutate({
                id: city?._id,
                body: {
                    city: values.city,
                    alias1: values.alias1,
                    alias2: values.alias2,
                    state: values.state
                }
            })
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)

        }
    }, [isSuccess])

    useEffect(() => {
        if (isStateSuccess) {
            setStates(data.data)
        }
    }, [isSuccess, states, data])
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack
                gap={2}
                pt={2}
            >
                < TextField

                    select


                    SelectProps={{
                        native: true
                    }}
                    focused

                    error={
                        formik.touched.state && formik.errors.state ? true : false
                    }
                    id="state"
                    label="State"
                    fullWidth
                    helperText={
                        formik.touched.state && formik.errors.state ? formik.errors.state : ""
                    }
                    {...formik.getFieldProps('state')}
                >
                    <option key={0} value={undefined}>
                        Select State
                    </option>
                    {
                        states.map(state => {
                            return (<option key={state._id} value={state.state}>
                                {toTitleCase(state.state)}
                            </option>)
                        })
                    }
                </TextField>
                {/* remarks */}
                <TextField
                    required
                    error={
                        formik.touched.city && formik.errors.city ? true : false
                    }
                    autoFocus
                    id="city"
                    label="City"
                    fullWidth
                    helperText={
                        formik.touched.city && formik.errors.city ? formik.errors.city : ""
                    }
                    {...formik.getFieldProps('city')}
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
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !city ? "Add City" : "Update City"}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditCityForm
