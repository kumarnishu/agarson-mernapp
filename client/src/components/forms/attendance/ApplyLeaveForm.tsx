import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError, Target } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { AttendanceService } from '../../../services/AttendanceService';
import { UserService } from '../../../services/UserServices';
import { GetSalesmanAttendanceReportDto } from '../../../dtos/response/AttendanceDto';
import { DropDownDto } from '../../../dtos/response/DropDownDto';



function ApplyLeaveForm({ leavedata, setDialog }: { leavedata: GetSalesmanAttendanceReportDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetSalesmanAttendanceReportDto>, BackendError, {
            body: FormData
        }>
        (new AttendanceService().ApplyLeave, {

            onSuccess: () => {
                queryClient.refetchQueries('attendance_report')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const [users, setUsers] = useState<DropDownDto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, show_assigned_only: false }))

    const getCurrentYearMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Ensure two digits
        return Number(`${year}${month}`);
    };

    const formik = useFormik({
        initialValues: {
            leave_type: 'sl',
            leave: 1,
            photo: "",
            yearmonth: leavedata?.yearmonth || getCurrentYearMonth(),
            employee: leavedata && leavedata.employee.id || "",
        },
        validationSchema: Yup.object({
            leave_type: Yup.string().required("required"),
            employee: Yup.string().required("required"),
            leave: Yup.number().required("required").max(leavedata.total.sl-leavedata.consumed.sl),
            yearmonth: Yup.number()
                .required('Year and month are required')
                .test(
                    'valid-year-month',
                    'YearMonth must be in YYYYMM format and represent a valid year and month',
                    (value) => {
                        if (!value) return false;
                        const stringValue = value.toString();
                        if (!/^\d{6}$/.test(stringValue)) return false; // Ensure it's exactly 6 digits

                        const year = parseInt(stringValue.substring(0, 4), 10);
                        const month = parseInt(stringValue.substring(4, 6), 10);

                        return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
                    }
                ),
            photo: Yup.mixed<File>()
                .test("size", "size is allowed only less than 20mb",
                    file => {
                        if (file)
                            if (!file.size) //file not provided
                                return true
                            else
                                return Boolean(file.size <= 20 * 1024 * 1024)
                        return true
                    }
                )
                .test("type", " allowed only .jpg, .jpeg, .png, .gif .pdf .csv .xlsx .docs",
                    file => {
                        const Allowed = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"]
                        if (file)
                            if (!file.size) //file not provided
                                return true
                            else
                                return Boolean(Allowed.includes(file.type))
                        return true
                    }
                )
        }),
        onSubmit: (values) => {

            let formdata = new FormData()
            formdata.append("body", JSON.stringify(values))
            if (values.photo)
                formdata.append("file", values.photo)
            if (leavedata)
                mutate({ body: formdata })
        }
    });

    console.log(formik.values)
    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [isUsersSuccess, usersData])

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
                    select
                    required
                    fullWidth
                    error={formik.touched.leave_type && formik.errors.leave_type ? true : false}
                    id="leave_type"
                    label="Leave Type"
                    disabled
                    helperText={formik.touched.leave_type && formik.errors.leave_type ? formik.errors.leave_type : `${leavedata.total.sl-leavedata.consumed.sl} SL, ${leavedata.total.fl-leavedata.consumed.fl} FL, ${leavedata.total.sw-leavedata.consumed.sw} SW, ${leavedata.total.cl-leavedata.consumed.cl} CL`}
                    {...formik.getFieldProps('leave_type')}
                    SelectProps={{
                        native: true,
                    }}
                >
                    <option key={1} value={'sl'}>
                        SL
                    </option>

                </TextField>
                <TextField required fullWidth error={formik.touched.leave && formik.errors.leave ? true : false} id="leave" label="No Of Leaves" helperText={formik.touched.leave && formik.errors.leave ? formik.errors.leave : ""}    {...formik.getFieldProps('leave')} />

                <TextField required fullWidth error={formik.touched.yearmonth && formik.errors.yearmonth ? true : false} disabled id="yearmonth" label="Year Month" helperText={formik.touched.yearmonth && formik.errors.yearmonth ? formik.errors.yearmonth : "202501"}    {...formik.getFieldProps('yearmonth')} />

                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    fullWidth
                    focused
                    error={formik.touched.employee && formik.errors.employee ? true : false} id="employee" label="Employee" disabled
                    helperText={formik.touched.employee && formik.errors.employee ? formik.errors.employee : `Available ${leavedata.total.sl}`}
                    {...formik.getFieldProps('employee')}

                >
                    <option key={0} value={'all'}>
                        Select Users
                    </option>
                    {users && users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.label}
                        </option>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    variant='filled'
                    error={
                        formik.touched.photo && formik.errors.photo ? true : false
                    }
                    helperText={
                        formik.touched.photo && formik.errors.photo ? (formik.errors.photo) : ""
                    }
                    label="Document/Photo"
                    focused

                    type="file"
                    name="photo"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                        e.preventDefault()
                        const target: Target = e.currentTarget
                        let files = target.files
                        if (files) {
                            let file = files[0]
                            formik.setFieldValue("photo", file)
                        }
                    }}
                />


                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default ApplyLeaveForm
