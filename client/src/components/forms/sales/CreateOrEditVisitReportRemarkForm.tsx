import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { CreateOrEditVisitReportRemark } from '../../../services/SalesServices';
import { GetVisitSummaryReportRemarkDto, CreateOrEditVisitSummaryRemarkDto } from '../../../dtos/visit_remark.dto';


function CreateOrEditVisitReportRemarkForm({ employee, visit_date, remark, setDialog }: {
    employee: string,
    visit_date: string, remark?: GetVisitSummaryReportRemarkDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> 
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



    const formik = useFormik<{
        remark: string
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
        },
        validationSchema: Yup.object({
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                
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
