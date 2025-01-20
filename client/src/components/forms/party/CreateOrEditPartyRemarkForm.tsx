import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import moment from 'moment';
import { CreateOrEditPartyRemarkDto, GetPartyRemarkDto } from '../../../dtos/PartyPageDto';
import { PartyPageService } from '../../../services/PartyPageService';


function CreateOrEditPartyRemarkForm({ party, remark, setDialog }: {
    party: string,
    remark?: GetPartyRemarkDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}) {
    const [display, setDisplay] = useState(Boolean(remark?.nextcall))
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            remark?: GetPartyRemarkDto,
            body: CreateOrEditPartyRemarkDto
        }>
        (new PartyPageService().CreateOrEditPartyRemark, {

            onSuccess: () => {
                queryClient.refetchQueries('remarks')
                queryClient.refetchQueries('exceldb')
                queryClient.refetchQueries('ageings')
                setAlert({ message: remark ? 'updated remark' : 'created new remark', color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })

        })



    const formik = useFormik({
        initialValues: {
            remark: remark ? remark.remark : "",
            remind_date: remark?.nextcall ? moment(new Date(remark?.nextcall)).format("YYYY-MM-DD") : undefined,
        },
        validationSchema: Yup.object({
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')

                .required('Required field'),
            remind_date: Yup.string().test(() => {
                if (display && !formik.values.remind_date)
                    return false
                else
                    return true
            })
        }),
        onSubmit: (values) => {
            mutate({
                remark: remark,
                body: {
                    remark: values.remark,
                    nextcall: values.remind_date,
                    party: party
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
                {/* remarks */}
                <TextField
                    multiline
                    minRows={4}
                    required
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    autoFocus
                    id="remark"
                    label="Remark"
                    fullWidth
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />
                <FormGroup>
                    <FormControlLabel control={<Checkbox
                        checked={Boolean(display)}
                        onChange={() => setDisplay(!display)}
                    />} label="Make Reminder" />
                </FormGroup>
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


                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !remark ? "Add Remark" : "Update Remark"}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditPartyRemarkForm
