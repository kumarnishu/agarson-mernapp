import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext, useState } from 'react';
import {  useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { UserContext } from '../../../contexts/userContext';
import { toTitleCase } from '../../../utils/TitleCase';

import { AlertContext } from '../../../contexts/alertContext';

import { AuthorizationService } from '../../../services/AuthorizationService';
import { CrmService } from '../../../services/CrmService';
import { GetCrmCityDto, GetCrmStateDto } from '../../../dtos/response/AuthorizationDto';
import { GetReferDto } from '../../../dtos/response/CrmDto';


function CreateOrEditReferForm({ refer,setDialog }: { refer?: GetReferDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>>  }) {
    const { user } = useContext(UserContext);
    const [states, setStates] = useState<GetCrmStateDto[]>([])
    const [cities, setCities] = useState<GetCrmCityDto[]>([])
    const [state, setState] = useState<string>();
    const { setAlert } = useContext(AlertContext)
    const { data, isSuccess: isStateSuccess } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>("crm_states",new AuthorizationService(). GetAllStates)
    const { data: citydata, isSuccess: isCitySuccess } = useQuery<AxiosResponse<GetCrmCityDto[]>, BackendError>(["crm_cities", state], async () =>new AuthorizationService(). GetAllCities({ state: state }))

    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<GetReferDto>, BackendError, { body: FormData, id?: string }>
        (new CrmService().CreateOrUpdateRefer, {
          
            onSuccess: () => {
                queryClient.invalidateQueries('refers')
                setAlert({ message: refer ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })

    const formik = useFormik({
        initialValues: {
            name: refer ? refer.name : "",
            customer_name: refer ? refer.customer_name : "",
            mobile: refer?.mobile||"",
            mobile2: refer?.mobile2 || "",
            mobile3: refer?.mobile3 || "",
            city: refer ? refer.city : "",
            gst: refer ? refer.gst : "",
            state: refer ? refer.state : "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("required field"),
            customer_name: Yup.string(),

            city: Yup.string().required("required field")
            ,
            state: Yup.string().required("required field")
            ,
            mobile: Yup.string().required("required mobile ")
                .min(10, 'Must be 10 digits')
                .max(10, 'Must be 10 digits'),
            mobile2: Yup.string()
                .min(10, 'Must be 10 digits')
                .max(10, 'Must be 10 digits'),
            mobile3: Yup.string()
                .min(10, 'Must be 10 digits')
                .max(10, 'Must be 10 digits'),
            gst: Yup.string().required("required gst ")
                .min(15, 'Must be 15 characters')
                .max(15, 'Must be 15 characters'),
        }),
        onSubmit: (values) => {
            let leadData = {
                customer_name: values.customer_name,
                mobile: values.mobile,
                mobile2: values.mobile2,
                mobile3: values.mobile3,
                city: values.city,
                state: values.state,
                gst: values.gst,
                name: values.name
            }
            let formdata = new FormData()
            formdata.append("body", JSON.stringify(leadData))
            mutate({ id: refer?._id, body: formdata });
        }
    });

    useEffect(() => {
        if (isStateSuccess) {
            setStates(data.data)
        }
    }, [isSuccess, states, data])

    useEffect(() => {
        if (isCitySuccess) {
            setCities(citydata.data)
        }
    }, [isSuccess, states, citydata])

    useEffect(() => {
        setState(formik.values.state)
    }, [formik.values.state])

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
                {/* name */}

                <TextField
                    autoFocus

                    fullWidth
                    disabled={!user?.is_admin && refer ? true : false}

                    error={
                        formik.touched.name && formik.errors.name ? true : false
                    }
                    id="name"
                    label="Refer Name"
                    helperText={
                        formik.touched.name && formik.errors.name ? formik.errors.name : ""
                    }
                    {...formik.getFieldProps('name')}
                />



                < TextField

                    fullWidth

                    error={
                        formik.touched.customer_name && formik.errors.customer_name ? true : false
                    }
                    id="customer_name"
                    label="Customer Name"
                    helperText={
                        formik.touched.customer_name && formik.errors.customer_name ? formik.errors.customer_name : ""
                    }
                    {...formik.getFieldProps('customer_name')}
                />

                < TextField

                    fullWidth

                    error={
                        formik.touched.gst && formik.errors.gst ? true : false
                    }
                    id="gst"
                    label="GST"
                    helperText={
                        formik.touched.gst && formik.errors.gst ? formik.errors.gst : ""
                    }
                    {...formik.getFieldProps('gst')}
                />
                {/* customer designiation */}




                {/* mobile */}


                < TextField

                    type="string"
                    required
                    error={
                        formik.touched.mobile && formik.errors.mobile ? true : false
                    }
                    id="mobile"
                    label="Mobile"
                    fullWidth
                    helperText={
                        formik.touched.mobile && formik.errors.mobile ? formik.errors.mobile : ""
                    }
                    {...formik.getFieldProps('mobile')}
                />
                < TextField

                    type="string"
                    error={
                        formik.touched.mobile2 && formik.errors.mobile2 ? true : false
                    }
                    id="mobile2"
                    label="Mobile2"
                    fullWidth
                    helperText={
                        formik.touched.mobile2 && formik.errors.mobile2 ? formik.errors.mobile2 : ""
                    }
                    {...formik.getFieldProps('mobile2')}
                />
                < TextField
                    type="string"
                    error={
                        formik.touched.mobile3 && formik.errors.mobile3 ? true : false
                    }
                    id="mobile3"
                    label="Mobile3"
                    fullWidth
                    helperText={
                        formik.touched.mobile3 && formik.errors.mobile3 ? formik.errors.mobile3 : ""
                    }
                    {...formik.getFieldProps('mobile3')}
                />

          
                {/* state */}


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
                            return (<option key={state.state} value={state.state}>
                                {toTitleCase(state.state)}
                            </option>)
                        })
                    }
                </TextField>
                < TextField

                    select

                    SelectProps={{
                        native: true
                    }}
                    focused

                    error={
                        formik.touched.city && formik.errors.city ? true : false
                    }
                    id="city"
                    label="City"
                    fullWidth
                    helperText={
                        formik.touched.city && formik.errors.city ? formik.errors.city : ""
                    }
                    {...formik.getFieldProps('city')}
                >
                    <option value="">
                    </option>
                    {
                        cities.map((city, index) => {
                            return (<option key={index} value={city.city.toLowerCase()}>
                                {toTitleCase(city.city)}
                            </option>)
                        })
                    }
                </TextField>

                <Button variant="contained" color="primary" type="submit"
                    disabled={isLoading}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : <>
                        {refer ? "Update" : "Create"}
                    </>}
                </Button>
            </Stack>
          

        </form>
    )
}

export default CreateOrEditReferForm
