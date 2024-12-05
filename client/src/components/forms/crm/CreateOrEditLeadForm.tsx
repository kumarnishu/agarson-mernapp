import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect,  useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { CreateOrUpdateLead, GetAllCities, GetAllLeadTypes, GetAllSources, GetAllStates } from '../../../services/LeadsServices';
import { Countries } from '../../../utils/countries';
import { BackendError, Target } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { toTitleCase } from '../../../utils/TitleCase';
import { GetCrmCityDto } from '../../../dtos/crm-city.dto';
import { GetCrmStateDto } from '../../../dtos/crm-state.dto';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { GetLeadDto } from '../../../dtos/lead.dto';


function CreateOrEditLeadForm({ lead,setDialog }: { lead?: GetLeadDto , setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const [states, setStates] = useState<GetCrmStateDto[]>([])
    const [cities, setCities] = useState<GetCrmCityDto[]>([])
    const [state, setState] = useState<string>();
    const [types, setTypes] = useState<DropDownDto[]>([])
    const [sources, setSources] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetLeadDto>, BackendError, { body: FormData, id?: string }>
        (CreateOrUpdateLead, {
            onSuccess: () => {
                queryClient.invalidateQueries('leads')
            }
        })

    const { data: typesdata, isSuccess: isTypeSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("crm_types", GetAllLeadTypes)

    const { data: sourcedata, isSuccess: isSourceSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("crm_sources", GetAllSources)

    const { data, isSuccess: isStateSuccess } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>("crm_states", GetAllStates)
    const { data: citydata, isSuccess: isCitySuccess } = useQuery<AxiosResponse<GetCrmCityDto[]>, BackendError>(["crm_cities", state], async () => GetAllCities({ state: state }))


    const formik = useFormik({
        initialValues: {
            name: lead ? lead.name : "",
            customer_name: lead ? lead.customer_name : "",
            customer_designation: lead ? lead.customer_designation : "",
            mobile: lead ? lead.mobile : "",
            email: lead ? lead.email : "",
            city: lead ? lead.city : "",
            gst: lead ? lead.gst : "",
            state: lead ? lead.state : "",
            country: lead ? lead.country : "India",
            address: lead ? lead.address : "",
            remark: lead && lead.last_remark || "",
            work_description: lead ? lead.work_description : "",
            turnover: lead ? lead.turnover : "",
            lead_type: lead ? lead.lead_type : "",
            alternate_mobile1: lead ? lead.alternate_mobile1 : "",
            alternate_mobile2: lead ? lead.alternate_mobile2 : "",
            alternate_email: lead ? lead.alternate_email : "",
            lead_source: lead ? lead.lead_source : "internet",
            visiting_card: lead && lead.visiting_card && lead.visiting_card || ""
        },
        validationSchema: Yup.object({
            name: Yup.string(),
            email: Yup.string()
                .email('provide a valid email id'),
            alternate_email: Yup.string()
                .email('provide a valid email id'),
            customer_name: Yup.string(),
            customer_designation: Yup.string(),
            city: Yup.string()
            ,
            state: Yup.string().required()
            ,
            lead_type: Yup.string(),
            turnover: Yup.string(),
            lead_source: Yup.string(),
            country: Yup.string(),
            work_description: Yup.string()
            ,
            address: Yup.string()
            ,
            remark: Yup.string()
            ,
            mobile: Yup.string().required("required mobile string")
                .min(10, 'Must be 10 digits')
                .max(10, 'Must be 10 digits'),
            gst: Yup.string()
                .min(15, 'Must be 15 characters')
                .max(15, 'Must be 15 characters'),
            alternate_mobile1: Yup.string().nullable()
                .min(10, 'Must be 10 digits')
                .max(10, 'Must be 10 digits'),
            alternate_mobile2: Yup.string().nullable()
                .min(10, 'Must be 10 digits')
                .max(10, 'Must be 10 digits'),
            visiting_card: Yup.mixed<File>()
                .test("size", "size is allowed only less than 10mb",
                    file => {
                        if (file)
                            if (!file.size) //file not provided
                                return true
                            else
                                return Boolean(file.size <= 20 * 1024 * 1024)
                        return true
                    }
                )
                .test("type", " allowed only .jpg, .jpeg, .png, .gif .pdf .csv .xlsx .docs",
                    file => {
                        const Allowed = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"]
                        if (file)
                            if (!file.size) //file not provided
                                return true
                            else
                                return Boolean(Allowed.includes(file.type))
                        return true
                    }
                )
        }),
        onSubmit: (values) => {
            let leadData = {
                customer_name: values.customer_name,
                customer_designation: values.customer_designation,
                mobile: values.mobile,
                email: values.email,
                city: values.city,
                state: values.state,
                gst: values.gst,
                country: values.country,
                address: values.address,
                remark: values.remark,
                work_description: values.work_description,
                turnover: values.turnover,
                lead_type: values.lead_type,
                alternate_mobile1: values.alternate_mobile1,
                alternate_mobile2: values.alternate_mobile2,
                alternate_email: values.alternate_email,
                lead_source: values.lead_source,
                name: values.name
            }
            let formdata = new FormData()
            formdata.append("body", JSON.stringify(leadData))
            if (values.visiting_card)
                formdata.append("visiting_card", values.visiting_card)
            mutate({ id: lead?._id, body: formdata });
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
        if (isSourceSuccess) {
            setSources(sourcedata?.data)
        }
    }, [isSuccess, sources, sourcedata])

    useEffect(() => {
        if (isTypeSuccess) {
            setTypes(typesdata.data)
        }
    }, [isSuccess, types, typesdata])

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


                    error={
                        formik.touched.name && formik.errors.name ? true : false
                    }
                    id="name"
                    label="Lead Name"
                    helperText={
                        formik.touched.name && formik.errors.name ? formik.errors.name : ""
                    }
                    {...formik.getFieldProps('name')}
                />


                {/* customer name */}

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

                {/* customer designiation */}


                < TextField

                    fullWidth


                    error={
                        formik.touched.customer_designation && formik.errors.customer_designation ? true : false
                    }
                    id="customer_designation"
                    label="Customer Designation"
                    helperText={
                        formik.touched.customer_designation && formik.errors.customer_designation ? formik.errors.customer_designation : ""
                    }
                    {...formik.getFieldProps('customer_designation')}
                />

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

                {/* email */}


                < TextField


                    fullWidth
                    error={
                        formik.touched.email && formik.errors.email ? true : false
                    }
                    id="email"
                    label="Email"
                    helperText={
                        formik.touched.email && formik.errors.email ? formik.errors.email : ""
                    }
                    {...formik.getFieldProps('email')}
                />

                {/* alternate mobile */}



                < TextField

                    fullWidth
                    type="string"
                    error={
                        formik.touched.alternate_mobile1 && formik.errors.alternate_mobile1 ? true : false
                    }
                    id="alternate_mobile1"
                    label="Alternate Mobile1"
                    helperText={
                        formik.touched.alternate_mobile1 && formik.errors.alternate_mobile1 ? formik.errors.alternate_mobile1 : ""
                    }
                    {...formik.getFieldProps('alternate_mobile1')}
                />

                {/* alternate mobile */}



                < TextField

                    fullWidth
                    type="string"
                    error={
                        formik.touched.alternate_mobile2 && formik.errors.alternate_mobile2 ? true : false
                    }
                    id="alternate_mobile2"
                    label="Alternate Mobile2"
                    helperText={
                        formik.touched.alternate_mobile2 && formik.errors.alternate_mobile2 ? formik.errors.alternate_mobile2 : ""
                    }
                    {...formik.getFieldProps('alternate_mobile2')}
                />

                {/* turnover */}

                <TextField

                    fullWidth
                    error={
                        formik.touched.turnover && formik.errors.turnover ? true : false
                    }

                    id="turnover"
                    label="TurnOver"
                    helperText={
                        formik.touched.turnover && formik.errors.turnover ? formik.errors.turnover : ""
                    }
                    {...formik.getFieldProps('turnover')}
                />

                {/* alternate_email */}



                < TextField

                    fullWidth
                    error={
                        formik.touched.alternate_email && formik.errors.alternate_email ? true : false
                    }
                    id="alternate_email"
                    label="Alternate Email"
                    helperText={
                        formik.touched.alternate_email && formik.errors.alternate_email ? formik.errors.alternate_email : ""
                    }
                    {...formik.getFieldProps('alternate_email')}
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
                            return (<option key={state._id} value={state.state}>
                                {toTitleCase(state.state)}
                            </option>)
                        })
                    }
                </TextField>
                {/* city */}


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

                



                {/* lead type */}
                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused

                    error={
                        formik.touched.lead_type && formik.errors.lead_type ? true : false
                    }
                    id="lead_type"
                    label="Lead Type"
                    fullWidth
                    helperText={
                        formik.touched.lead_type && formik.errors.lead_type ? formik.errors.lead_type : ""
                    }
                    {...formik.getFieldProps('lead_type')}
                >
                    <option value="">

                    </option>
                    {
                        types.map(type => {
                            return (<option key={type.id} value={type.label}>
                                {toTitleCase(type.label)}
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
                        formik.touched.lead_source && formik.errors.lead_source ? true : false
                    }
                    id="lead_source"
                    label="Source"
                    fullWidth
                    helperText={
                        formik.touched.lead_source && formik.errors.lead_source ? formik.errors.lead_source : ""
                    }
                    {...formik.getFieldProps('lead_source')}
                >
                    <option value="">

                    </option>
                    {
                        sources.map(source => {
                            return (<option key={source.id} value={source.label}>
                                {toTitleCase(source.label)}
                            </option>)
                        })
                    }
                </TextField>

                {/* country */}
                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused

                    error={
                        formik.touched.country && formik.errors.country ? true : false
                    }
                    id="country"
                    label="country"
                    fullWidth
                    helperText={
                        formik.touched.country && formik.errors.country ? formik.errors.country : ""
                    }
                    {...formik.getFieldProps('country')}
                >
                    <option value="india">
                        India
                    </option>
                    {
                        Countries.map(country => {
                            return (<option key={country.unicode} value={country.name}>
                                {country.name}
                            </option>)
                        })
                    }
                </TextField>

                {/* address */}

                < TextField



                    multiline
                    minRows={2}

                    error={
                        formik.touched.address && formik.errors.address ? true : false
                    }
                    id="address"
                    label="Address"
                    fullWidth
                    helperText={
                        formik.touched.address && formik.errors.address ? formik.errors.address : ""
                    }
                    {...formik.getFieldProps('address')}
                />

                {/* work_description */}



                < TextField

                    multiline
                    minRows={2}



                    error={
                        formik.touched.work_description && formik.errors.work_description ? true : false
                    }
                    id="work_description"
                    label="Work Description"
                    fullWidth
                    helperText={
                        formik.touched.work_description && formik.errors.work_description ? formik.errors.work_description : ""
                    }
                    {...formik.getFieldProps('work_description')}
                />

                {/* remark */}


                < TextField

                    multiline
                    minRows={2}
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    id="remark"
                    label="Remark"
                    fullWidth
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />
                <TextField
                    fullWidth
                    error={
                        formik.touched.visiting_card && formik.errors.visiting_card ? true : false
                    }
                    helperText={
                        formik.touched.visiting_card && formik.errors.visiting_card ? (formik.errors.visiting_card) : ""
                    }
                    label="Visting Card"
                    focused

                    type="file"
                    name="visiting_card"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                        e.preventDefault()
                        const target: Target = e.currentTarget
                        let files = target.files
                        if (files) {
                            let file = files[0]
                            formik.setFieldValue("visiting_card", file)
                        }
                    }}
                />
                <Button variant="contained" color="primary" type="submit"
                    disabled={isLoading}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : <>
                        {lead ? "Update" : "Create"}
                    </>}
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
                        {lead ? <AlertBar message="updated lead" color="success" /> : <AlertBar message="new lead created" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditLeadForm
