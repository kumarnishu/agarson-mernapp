import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect,  useState } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import moment from 'moment';
import { GetExcelDBRemarksDto, CreateOrEditExcelDbRemarkDto } from '../../../dtos/excel-db-remark.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { ExcelReportsService } from '../../../services/ExcelReportsServices';


function CreateOrEditExcelDBRemarkForm({ category, obj, remark, setDialog }: {
    category: string, obj: string, remark?: GetExcelDBRemarksDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> 
}) {
    const { setAlert } = useContext(AlertContext)
     const [show, setShow] = useState(Boolean(remark?.next_date))
    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError, {
            remark?: GetExcelDBRemarksDto,
            body: CreateOrEditExcelDbRemarkDto
        }>
        (new ExcelReportsService(). CreateOrEditExcelDbRemark, {
           
            onSuccess: () => {
                queryClient.refetchQueries('remarks')
                queryClient.refetchQueries('exceldb')
                setAlert({ message: remark ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })



    const formik = useFormik<{
        remark: string,
        next_date?: string,
        category: string,
        obj: string,
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
            next_date: remark?.next_date ? moment(new Date(remark?.next_date)).format("YYYY-MM-DD") : undefined,
            obj: remark ? remark.obj : obj,
            category: remark && remark.category && remark.category.id || category,
        },
        validationSchema: Yup.object({
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                
                .required('Required field'),
            next_date: Yup.string().test(() => {
                if (show && !formik.values.next_date)
                    return false
                else
                    return true
            }),
            obj: Yup.string().required(),
            category: Yup.string().required(),
        }),
        onSubmit: (values) => {
            mutate({
                remark: remark,
                body: {
                    remark: values.remark,
                    obj: values.obj,
                    next_date: values.next_date,
                    category: values.category
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
                        checked={Boolean(show)}
                        onChange={() => setShow(!show)}
                    />} label="Create Reminder" />
                </FormGroup>
                {show && < TextField
                    type="date"
                    error={
                        formik.touched.next_date && formik.errors.next_date ? true : false
                    }
                    focused
                    id="next_date"
                    label="Next Call"
                    fullWidth
                    helperText={
                        formik.touched.next_date && formik.errors.next_date ? formik.errors.next_date : ""
                    }
                    {...formik.getFieldProps('next_date')}
                />}
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !remark ? "Add Remark" : "Update Remark"}
                </Button>
            </Stack>

           

        </form>
    )
}

export default CreateOrEditExcelDBRemarkForm
