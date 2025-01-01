import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import {
    ApplyLeaveDtoFromAdmin,
    GetSalesmanAttendanceReportDto
} from '../../../dtos/leave.dto';
import { AttendanceService } from '../../../services/AttendanceService';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { UserService } from '../../../services/UserServices';



function ApplyLeaveFromAdminForm({ leavedata, setDialog }: { leavedata: GetSalesmanAttendanceReportDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetSalesmanAttendanceReportDto>, BackendError, {
            body: ApplyLeaveDtoFromAdmin
        }>
        (new AttendanceService().ApplyLeaveFromAdmin, {

            onSuccess: () => {
                queryClient.refetchQueries('leavedatas')
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
            cl: 0,
            fl: 0,
            sw: 0,
            status: 'pending',
            yearmonth: leavedata?.yearmonth || getCurrentYearMonth(),
            employee: leavedata && leavedata.employee.id || "",
        },
        validationSchema: Yup.object({
            cl: Yup.number().required("required").max(leavedata.total.cl || 0),
            fl: Yup.number().required("required").max(leavedata.total.fl || 0),
            sw: Yup.number().required("required").max(leavedata.total.sw || 0),
            status: Yup.string().required("required"),
            employee: Yup.string().required("required"),
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
        }),
        onSubmit: (values) => {
            let data: ApplyLeaveDtoFromAdmin;
            if (values.cl > 0) {
                data = {
                    leave_type: 'cl',
                    leave: values.cl,
                    status: values.status,
                    yearmonth: values.yearmonth,
                    employee: values.employee
                }
                mutate({ body: data })
            }
            if (values.fl > 0) {
                data = {
                    leave_type: 'fl',
                    leave: values.fl,
                    status: values.status,
                    yearmonth: values.yearmonth,
                    employee: values.employee
                }
                mutate({ body: data })
            }
            if (values.sw > 0) {
                data = {
                    leave_type: 'sw',
                    leave: values.sw,
                    status: values.status,
                    yearmonth: values.yearmonth,
                    employee: values.employee
                }
                mutate({ body: data })
            }
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
                    required
                    fullWidth
                    error={formik.touched.cl && formik.errors.cl ? true : false}
                    id="cl"
                    label="Casual Leave"
                    helperText={formik.touched.cl && formik.errors.cl ? formik.errors.cl : `Available ${leavedata.total.cl || 0}`}
                    {...formik.getFieldProps('cl')}
                />
                <TextField
                    required
                    fullWidth
                    error={formik.touched.fl && formik.errors.fl ? true : false}
                    id="fl"
                    label="Festive Leave"
                    helperText={formik.touched.fl && formik.errors.fl ? formik.errors.fl : `Available ${leavedata.total.fl || 0}`}
                    {...formik.getFieldProps('fl')}
                />
                <TextField
                    required
                    fullWidth
                    error={formik.touched.sw && formik.errors.sw ? true : false}
                    id="sw"
                    label="Sunday Working"
                    helperText={formik.touched.sw && formik.errors.sw ? formik.errors.sw : `Available ${leavedata.total.sw || 0}`}
                    {...formik.getFieldProps('sw')}
                />
                <TextField required fullWidth error={formik.touched.yearmonth && formik.errors.yearmonth ? true : false} id="yearmonth" label="Year Month" helperText={formik.touched.yearmonth && formik.errors.yearmonth ? formik.errors.yearmonth : "202501"}    {...formik.getFieldProps('yearmonth')} />

                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    fullWidth
                    focused
                    error={formik.touched.employee && formik.errors.employee ? true : false} id="employee" label="Year Month" helperText={formik.touched.employee && formik.errors.employee ? formik.errors.employee : ""}    {...formik.getFieldProps('employee')}
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
                    select
                    required
                    fullWidth
                    error={formik.touched.status && formik.errors.status ? true : false}
                    id="status"
                    label="Status"
                    helperText={formik.touched.status && formik.errors.status ? formik.errors.status : ""}
                    {...formik.getFieldProps('status')}
                    SelectProps={{
                        native: true,
                    }}
                >
                    <option key={1} value={'pending'}>
                        Pending
                    </option>
                    <option key={2} value={'approved'}>
                        Approved
                    </option>
                    <option key={3} value={'rejected'}>
                        Rejected
                    </option>
                </TextField>

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default ApplyLeaveFromAdminForm
