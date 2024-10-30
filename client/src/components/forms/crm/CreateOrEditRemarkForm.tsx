import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { CreateOrEditRemark, GetAllStages } from '../../../services/LeadsServices';
import { ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { toTitleCase } from '../../../utils/TitleCase';
import { GetRemarksDto } from '../../../dtos';
import { DropDownDto } from '../../../dtos';
import moment from 'moment';


function CreateOrEditRemarkForm({ lead, remark, setDisplay2 }: { lead?: { _id: string, has_card?: boolean, stage: string }, remark?: GetRemarksDto, setDisplay2?: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [display, setDisplay] = useState(Boolean(remark?.remind_date))
    const [card, setCard] = useState(Boolean(lead?.has_card))
    const [stages, setStages] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            lead_id?: string,
            remark_id?: string,
            body: {
                stage: string,
                remark: string,
                has_card: boolean,
                remind_date?: string
            }
        }>
        (CreateOrEditRemark,{onSuccess:()=>{
            queryClient.refetchQueries('remarks')
            queryClient.refetchQueries('activities')
            queryClient.refetchQueries('activities_topbar')
            queryClient.refetchQueries('reminders')
            queryClient.refetchQueries('leads')
        }})
    const { data: stagedata, isSuccess: stageSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("crm_stages", GetAllStages)

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        remark: string,
        remind_date?: string,
        stage: string,
        has_card: boolean
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
            remind_date: remark?.remind_date ? moment(new Date(remark?.remind_date)).format("YYYY-MM-DD") : undefined,
            stage: lead?.stage || "",
            has_card: card
        },
        validationSchema: Yup.object({
            stage: Yup.string(),
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                .max(200, 'Must be 200 characters or less')
                .required('Required field'),
            remind_date: Yup.string().test(() => {
                if (display && !formik.values.remind_date)
                    return false
                else
                    return true
            })
        }),
        onSubmit: (values: {
            remark: string,
            stage: string,
            lead_owners?: string[],
            remind_date?: string
        }) => {
            mutate({
                lead_id: lead && lead._id,
                remark_id: remark?._id,
                body: {
                    remark: values.remark,
                    has_card: card,
                    remind_date: values.remind_date,
                    stage: values.stage
                }
            })
        }
    });
    useEffect(() => {
        if (stageSuccess) {
            setStages(stagedata.data)
        }
    }, [isSuccess, stages, stagedata])


    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: LeadChoiceActions.close_lead })
            if (setDisplay2)
                setDisplay2(false);
            setCard(false)
        }
    }, [isSuccess, setChoice])
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


                {/* stage */}
                {lead &&
                    <>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox
                                checked={Boolean(card)}
                                onChange={() => setCard(!card)}
                            />} label="Have a Visiting Card ?" />
                        </FormGroup>
                        < TextField
                            select
                            SelectProps={{
                                native: true
                            }}
                            focused

                            error={
                                formik.touched.stage && formik.errors.stage ? true : false
                            }
                            disabled={Boolean(lead.stage == "refer")}
                            id="stage"
                            label="Stage"
                            fullWidth
                            helperText={
                                formik.touched.stage && formik.errors.stage ? formik.errors.stage : ""
                            }
                            {...formik.getFieldProps('stage')}
                        >

                            {lead.stage == "refer" && <option key={'01'} value="refer">
                                Refer
                            </option>}
                            {
                                stages.map(stage => {
                                    if (stage.value === "refer")
                                        return null
                                    else
                                        return (<option key={stage.id} value={stage.value}>
                                            {toTitleCase(stage.label)}
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
                        {!remark ? <AlertBar message="new remark created" color="success" /> : <AlertBar message="remark updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditRemarkForm
