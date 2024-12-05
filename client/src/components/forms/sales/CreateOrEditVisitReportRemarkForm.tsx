import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext,  KeyChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { CreateOrEditVisitReportRemark } from '../../../services/SalesServices';
import { GetVisitSummaryReportRemarkDto, CreateOrEditVisitSummaryRemarkDto } from '../../../dtos/visit_remark.dto';


function CreateOrEditVisitReportRemarkForm({ employee, visit_date, remark, setDisplay }: {
    employee: string,
    visit_date: string, remark?: GetVisitSummaryReportRemarkDto, setDisplay?: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            remark?: GetVisitSummaryReportRemarkDto,
            body: CreateOrEditVisitSummaryRemarkDto
        }>
        (CreateOrEditVisitReportRemark, {
            onSuccess: () => {
                queryClient.refetchQueries('remarks')
                queryClient.refetchQueries('visits')
                
            }
        })


    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        remark: string
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
        },
        validationSchema: Yup.object({
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                .max(200, 'Must be 200 characters or less')
                .required('Required field'),
        }),
        onSubmit: (values) => {
            mutate({
                remark: remark,
                body: {
                    remark: values.remark,
                    visit_date: visit_date,
                    employee: employee
                }
            })
        }
    });
   


    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: KeyChoiceActions.close_key })
            if (setDisplay)
                setDisplay(false);
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

export default CreateOrEditVisitReportRemarkForm
