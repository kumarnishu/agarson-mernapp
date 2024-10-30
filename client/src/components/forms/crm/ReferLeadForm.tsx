import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { GetRefers, ReferLead } from '../../../services/LeadsServices';
import AlertBar from '../../snacks/AlertBar';
import { GetLeadDto, GetReferDto } from '../../../dtos';



function ReferLeadForm({ lead }: { lead: GetLeadDto }) {
    const [display, setDisplay] = useState(false)
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetReferDto>, BackendError, { id: string, body: { party_id: string, remark: string, remind_date?: string } }>
        (ReferLead, {
            onSuccess: () => {
                queryClient.invalidateQueries('refers')
                queryClient.invalidateQueries('leads')
            }
        })
    const { data, isSuccess: isReferSuccess } = useQuery<AxiosResponse<GetReferDto[]>, BackendError>("refers", GetRefers)

    const { setChoice } = useContext(ChoiceContext)
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
            setChoice({ type: LeadChoiceActions.close_lead })
        }
    }, [isSuccess, setChoice])

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

                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="referred successfully" color="success" />
                    ) : null
                }
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Refer"}
                </Button>
            </Stack>
        </form>
    )
}

export default ReferLeadForm