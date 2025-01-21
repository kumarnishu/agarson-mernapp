import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { toTitleCase } from '../../../utils/TitleCase';
import moment from 'moment';
import { AlertContext } from '../../../contexts/alertContext';
import { GetSampleSystemDto } from '../../../dtos/PartyPageDto';
import { CreateOrEditSampleRemarkDto, GetSampleSystemRemarkDto } from '../../../dtos/RemarkDto';
import { PartyPageService } from '../../../services/PartyPageService';


function CreateOrEditSampleSystemRemarkForm({ sample, remark, setDialog }: { sample: GetSampleSystemDto, remark?: GetSampleSystemRemarkDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {

    const [display, setDisplay] = useState(Boolean(remark?.next_call))
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            remark?: GetSampleSystemRemarkDto,
            body: CreateOrEditSampleRemarkDto
        }>
        (new PartyPageService().CreateOrEditSampleRemark, {
            onSuccess: () => {
                queryClient.refetchQueries('remarks')
                queryClient.refetchQueries('samples')
                setAlert({ message: remark ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        remark: string,
        next_call?: string,
        stage: string,
        sample: string
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
            sample: sample._id || "",
            next_call: remark?.next_call ? moment(new Date(remark?.next_call)).format("YYYY-MM-DD") : undefined,
            stage: sample?.stage || "",
        },
        validationSchema: Yup.object({
            stage: Yup.string(),
            sample: Yup.string(),
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')

                .required('Required field'),
            next_call: Yup.string().test(() => {
                if (display && !formik.values.next_call)
                    return false
                else
                    return true
            })
        }),
        onSubmit: (values) => {
            if (remark) {
                mutate({
                    remark: remark,
                    body: {
                        remark: values.remark,
                        next_call: values.next_call,
                        sample: values.sample,
                        stage: values.stage
                    }
                })
            }
            else
                mutate({
                    body: {
                        remark: values.remark,
                        next_call: values.next_call,
                        sample: values.sample,
                        stage: values.stage
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
                        formik.touched.next_call && formik.errors.next_call ? true : false
                    }
                    focused
                    id="next_call"
                    label="Remind Date"
                    fullWidth
                    helperText={
                        formik.touched.next_call && formik.errors.next_call ? formik.errors.next_call : ""
                    }
                    {...formik.getFieldProps('next_call')}
                />}


                {/* stage */}
                {sample &&
                    <>

                        < TextField
                            select
                            SelectProps={{
                                native: true
                            }}
                            focused
                            disabled={remark ? true : false}
                            error={
                                formik.touched.stage && formik.errors.stage ? true : false
                            }
                            id="stage"
                            label="Stage"
                            fullWidth
                            helperText={
                                formik.touched.stage && formik.errors.stage ? formik.errors.stage : ""
                            }
                            {...formik.getFieldProps('stage')}
                        >
                            {
                                ["pending", "ordered", "rejected"].map(stage => {
                                    return (<option key={stage} value={stage}>
                                        {toTitleCase(stage)}
                                    </option>)
                                })
                            }
                        </TextField>
                    </>
                }


                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !remark ? "Add Remark" : "Update Remark"}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditSampleSystemRemarkForm
