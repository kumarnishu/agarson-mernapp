import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { GetChecklistBoxDto } from '../../../dtos/checklist-box.dto';
import { GetChecklistRemarksDto, CreateOrEditChecklistRemarkDto } from '../../../dtos/checklist-remark.dto';
import { GetChecklistDto } from '../../../dtos/checklist.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { FeatureService } from '../../../services/FeatureServices';


function CreateOrEditChecklistRemarkForm({ remark, checklist, checklist_box, setDialog }: { checklist: GetChecklistDto, checklist_box: GetChecklistBoxDto, remark?: GetChecklistRemarksDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: CreateOrEditChecklistRemarkDto,
            remark?: GetChecklistRemarksDto
        }>
        (new FeatureService().CreateOrEditChecklistRemark, {

            onSuccess: () => {
                queryClient.invalidateQueries('remarks')
                queryClient.invalidateQueries('checklists')
                setAlert({ message: remark ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik<{
        remark: string,
        stage: string,
        expected_number: number,
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
            expected_number: 0,
            stage: checklist_box ? checklist_box.stage : ""
        },
        validationSchema: Yup.object({
            stage: Yup.string(),
            expected_number: Yup.number(),
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')

                .required('Required field')
        }),
        onSubmit: (values: {
            remark: string,
            stage: string,
            expected_number: number
        }) => {
            let score = 0;
            if (checklist.condition == 'check-blank' && values.remark && values.stage == 'done') {
                score = 1
            }
            if (checklist.condition == 'check_yesno' && values.remark && values.stage == 'done') {
                score = 1
            }
            if (checklist.condition == 'check_expected_number' && values.remark && values.stage == 'done' && checklist.expected_number > 0) {
                score = values.expected_number / checklist.expected_number
            }
            if (remark) {
                mutate({
                    remark,
                    body: {
                        remark: values.remark,
                        stage: values.stage,
                        score: score,
                        checklist_box: checklist_box._id,
                        checklist: checklist._id
                    }
                })
            }
            else {
                mutate({
                    body: {
                        remark: values.remark,
                        stage: values.stage,
                        score: score,
                        checklist_box: checklist_box._id,
                        checklist: checklist._id
                    }
                })
            }

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
                {checklist.condition == "check_expected_number" && <TextField
                    type='number'
                    error={
                        formik.touched.expected_number && formik.errors.expected_number ? true : false
                    }
                    required={true}
                    autoFocus
                    id="expected_number"
                    label="Number"
                    fullWidth
                    helperText={
                        formik.touched.expected_number && formik.errors.expected_number ? formik.errors.expected_number : `Expected Number is : ${checklist.expected_number}`
                    }
                    {...formik.getFieldProps('expected_number')}
                />}

                {!remark &&
                    < TextField
                        select
                        SelectProps={{
                            native: true
                        }}
                        focused
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

                        <option key={'open'} value={'open'}>
                            Open
                        </option>
                        <option key={'pending'} value={'pending'}>
                            Pending
                        </option>
                        <option key={'done'} value={'done'}>
                            Done
                        </option>
                    </TextField>
                }


                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !remark ? "Add Remark" : "Update Remark"}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditChecklistRemarkForm
