import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { toTitleCase } from '../../../utils/TitleCase';
import { SalesService } from '../../../services/SalesServices';
import { CreateOrEditReferenceRemarkDto } from '../../../dtos/request/SalesDto';
import { GetReferenceRemarksDto } from '../../../dtos/response/SalesDto';


function CreateOrEditReferenceRemarkForm({ party, stage, remark, setDialog }: {
    party: string, stage: string, remark?: GetReferenceRemarksDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            remark?: GetReferenceRemarksDto,
            body: CreateOrEditReferenceRemarkDto
        }>
        (new SalesService().CreateOrEditReferenceRemark, {

            onSuccess: () => {
                queryClient.refetchQueries('remarks')
                queryClient.refetchQueries('references')
                setAlert({ message: remark ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        remark: string,
        stage: string,
        party: string,
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
            stage: stage || "open",
            party: remark && remark.party || party,
        },
        validationSchema: Yup.object({
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more'),
            stage: Yup.string().required("required field"),

            party: Yup.string().required(),
        }),
        onSubmit: (values) => {
            mutate({
                remark: remark,
                body: {
                    remark: values.remark,
                    stage: values.stage,
                    party: values.party
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
                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused

                    error={
                        formik.touched.stage && formik.errors.stage ? true : false
                    }
                    disabled={Boolean(stage == "added")}
                    id="stage"
                    label="Stage"
                    fullWidth
                    helperText={
                        formik.touched.stage && formik.errors.stage ? formik.errors.stage : ""
                    }
                    {...formik.getFieldProps('stage')}
                >


                    {
                        ["existing", "open", "added", "not interested", "useless"].map(stage => {
                            return (<option key={stage} value={stage}>
                                {toTitleCase(stage)}
                            </option>)
                        })
                    }
                </TextField>

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !remark ? "Add Remark" : "Update Remark"}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditReferenceRemarkForm
