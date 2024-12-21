import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect,  useState } from 'react';
import {  useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { GetLeadDto } from '../../../dtos/lead.dto';
import { GetReferDto } from '../../../dtos/refer.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { FeatureService } from '../../../services/FeatureServices';



function ReferLeadForm({ lead,setDialog }: { lead: GetLeadDto , setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
     const [display, setDisplay] = useState(false)
    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<GetReferDto>, BackendError, { id: string, body: { party_id: string, remark: string, remind_date?: string } }>
        (new FeatureService().ReferLead, {
           
            onSuccess: () => {
                queryClient.invalidateQueries('refers')
                queryClient.invalidateQueries('leads')
                setAlert({ message:  " refer successfully", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { data, isSuccess: isReferSuccess } = useQuery<AxiosResponse<GetReferDto[]>, BackendError>("refers",new FeatureService(). GetRefers)

    const [refers, setRefers] = useState<GetReferDto[]>()
    const formik = useFormik({
        initialValues: {
            remark: "",
            party_id: "",
            remind_date: undefined
        },
        validationSchema: Yup.object({
            remark: Yup.string()
                .required('Required field'),
            party_id: Yup.string().required("Required"),
            remind_date: Yup.string().test(() => {
                if (display && !formik.values.remind_date)
                    return false
                else
                    return true
            })

        }),
        onSubmit: (values) => {
            mutate({
                id: lead._id,
                body: {
                    remark: values.remark,
                    party_id: values.party_id,
                    remind_date: values.remind_date
                }
            })
        }
    });


    useEffect(() => {
        if (isReferSuccess) {
            setRefers(data.data)
        }
    }, [isReferSuccess, data])
    useEffect(() => {
        if (isSuccess) {
          setDialog(undefined) 
        }
    }, [isSuccess])

    return (
        <form onSubmit={formik.handleSubmit}>

            <Stack
                direction="column"
                gap={2}
                pt={2}
            >
                <TextField
                    autoFocus
                    required
                    fullWidth
                    multiline
                    minRows={4}
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    id="remark"
                    label="Remarks"
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />
                {lead && <>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox
                            checked={Boolean(display)}
                            onChange={() => setDisplay(!display)}
                        />} label="Make Reminder" />
                    </FormGroup></>}
                {display && < TextField
                    type="date"
                    error={
                        formik.touched.remind_date && formik.errors.remind_date ? true : false
                    }
                    focused
                    id="remind_date"
                    label="Remind Date"
                    fullWidth
                    helperText={
                        formik.touched.remind_date && formik.errors.remind_date ? formik.errors.remind_date : ""
                    }
                    {...formik.getFieldProps('remind_date')}
                />}
                < TextField
                    select
                    required
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.party_id && formik.errors.party_id ? true : false
                    }
                    id="party_id"
                    label="Party"
                    fullWidth
                    helperText={
                        formik.touched.party_id && formik.errors.party_id ? formik.errors.party_id : ""
                    }
                    {...formik.getFieldProps('party_id')}
                >
                    <option value="">

                    </option>
                    {
                        refers && refers.map(refer => {
                            return (<option key={refer._id} value={refer._id}>
                                {`${refer.name.toUpperCase()} ${refer.city.toUpperCase()}, ${refer.state.toUpperCase()}`}
                            </option>)
                        })
                    }
                </TextField>

               
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Refer"}
                </Button>
            </Stack>
        </form>
    )
}

export default ReferLeadForm