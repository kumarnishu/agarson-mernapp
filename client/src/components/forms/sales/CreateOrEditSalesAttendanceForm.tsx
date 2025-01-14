import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { UserContext } from '../../../contexts/userContext';
import moment from 'moment';
import { AlertContext } from '../../../contexts/alertContext';
import { AuthorizationService } from '../../../services/AuthorizationService';
import { UserService } from '../../../services/UserServices';
import { SalesService } from '../../../services/SalesServices';
import { CreateOrEditSalesAttendanceDto } from '../../../dtos/request/AttendanceDto';
import { DropDownDto } from '../../../dtos/response/DropDownDto';
import { GetSalesAttendanceDto } from '../../../dtos/response/SalesDto';

function CreateOrEditSalesAttendanceForm({ attendance, setDialog }: { attendance?: GetSalesAttendanceDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { user } = useContext(UserContext)
    const { data: users } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'sales_menu', show_assigned_only: true }))
    const { data: cities } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("cities", async () => new AuthorizationService().GetAllCRMCitiesForDropDown({ state: 'all' }))

    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetSalesAttendanceDto>, BackendError, {
            id?: string,
            body: CreateOrEditSalesAttendanceDto
        }>
        (new SalesService().CreateOrEditSalesmanAttendance, {
            onSuccess: () => {
                queryClient.refetchQueries('attendances')
                setAlert({ message: attendance ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })

        })


    const formik = useFormik({
        initialValues: {
            station: attendance ? attendance.station.id : "",
            employee: attendance ? attendance.employee.id : "",
            is_sunday_working: attendance && attendance.sunday_working == "yes" ? true : false,
            in_time: attendance ? attendance.in_time : '',
            old_visit: attendance ? Number(attendance.old_visit) : 0,
            attendance: attendance ? attendance.attendance : 'absent',
            end_time: attendance ? attendance.end_time : '',
            new_visit: attendance ? Number(attendance.new_visit) : 0,
            remark: attendance ? attendance.remark : '',
            date: attendance ? moment(attendance.date).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD")
        },
        validationSchema: Yup.object({
            station: Yup.string()
                .required('Required field'),
            employee: Yup.string()
                .required('Required field'),
            old_visit: Yup.number().max(25, "should not be more than 25")
                .required('Required field'),
            in_time: Yup.string(),
            is_sunday_working: Yup.boolean(),
            attendance: Yup.string()
                .required('Required field'),
            end_time: Yup.string(),
            new_visit: Yup.number().max(25, "should not be more than 25"),
            remark: Yup.string()
            ,
            date: Yup.string().required('Required field'),
        }),
        onSubmit: (values) => {
            if (attendance)
                mutate({
                    id: attendance._id,
                    body: values
                })
            else {
                mutate({
                    body: values

                })
            }
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)
        }
    }, [isSuccess])

    useEffect(() => {
        if (new Date(formik.values.date).getDay() == 0)
            formik.values.is_sunday_working = true
        else
            formik.values.is_sunday_working = false

    }, [formik.values.date])

    return (
        <form onSubmit={formik.handleSubmit}>

            <Stack
                direction="column"
                gap={2}
                pt={2}
            >
                {user?.assigned_users && user?.assigned_users.length > 0 && < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.employee && formik.errors.employee ? true : false
                    }
                    disabled={attendance ? true : false}
                    id="employee"
                    helperText={
                        formik.touched.employee && formik.errors.employee ? formik.errors.employee : ""
                    }
                    {...formik.getFieldProps('employee')}
                    required
                    label="Select Salesman"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>

                    </option>
                    {
                        users && users.data.map((user, index) => {
                            return (<option key={index} value={user.id}>
                                {user.label}
                            </option>)

                        })
                    }
                </TextField>}

                < TextField
                    type="date"
                    focused
                    error={
                        formik.touched.date && formik.errors.date ? true : false
                    }
                    disabled={attendance ? true : false}
                    id="date"
                    label="Attendance Date"
                    fullWidth
                    required
                    helperText={
                        formik.touched.date && formik.errors.date ? formik.errors.date : ""
                    }
                    {...formik.getFieldProps('date')}
                />
                < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.station && formik.errors.station ? true : false
                    }
                    id="station"
                    helperText={
                        formik.touched.station && formik.errors.station ? formik.errors.station : ""
                    }
                    {...formik.getFieldProps('station')}
                    required
                    label="Select Station"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>
                    </option>
                    {
                        cities && cities.data && cities.data.map((station, index) => {
                            return (<option key={index} value={station.id}>
                                {station.label}
                            </option>)

                        })
                    }
                </TextField>
                < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.attendance && formik.errors.attendance ? true : false
                    }
                    id="attendance"
                    helperText={
                        formik.touched.attendance && formik.errors.attendance ? formik.errors.attendance : ""
                    }
                    {...formik.getFieldProps('attendance')}
                    required
                    label="Attendance"
                    fullWidth
                >
                    <option key={'absent'} value={'absent'}>
                        Absent
                    </option>
                    <option key={'present'} value={'present'}>
                        Present
                    </option>
                </TextField>
                <TextField
                    fullWidth
                    type="number"
                    error={
                        formik.touched.new_visit && formik.errors.new_visit ? true : false
                    }
                    id="new_visit"
                    label="New Visit"
                    helperText={
                        formik.touched.new_visit && formik.errors.new_visit ? formik.errors.new_visit : ""
                    }
                    {...formik.getFieldProps('new_visit')}
                />
                <TextField
                    fullWidth
                    type="number"
                    error={
                        formik.touched.old_visit && formik.errors.old_visit ? true : false
                    }
                    id="old_visit"
                    label="Old Visit"
                    helperText={
                        formik.touched.old_visit && formik.errors.old_visit ? formik.errors.old_visit : ""
                    }
                    {...formik.getFieldProps('old_visit')}
                />

                <TextField
                    fullWidth
                    type="time"
                    focused
                    error={
                        formik.touched.in_time && formik.errors.in_time ? true : false
                    }
                    id="in_time"
                    label="In Time"
                    helperText={
                        formik.touched.in_time && formik.errors.in_time ? formik.errors.in_time : ""
                    }
                    {...formik.getFieldProps('in_time')}
                />

                <TextField
                    focused
                    fullWidth
                    type="time"
                    error={
                        formik.touched.end_time && formik.errors.end_time ? true : false
                    }
                    id="end_time"
                    label="End day"
                    helperText={
                        formik.touched.end_time && formik.errors.end_time ? formik.errors.end_time : ""
                    }
                    {...formik.getFieldProps('end_time')}
                />

                {new Date(formik.values.date).getDay() == 0 && <FormGroup>
                    <FormControlLabel control={<Checkbox
                        checked={formik.values.is_sunday_working}
                        {...formik.getFieldProps('is_sunday_working')}
                    />} label="Make Sunday Working" />
                </FormGroup>}

                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    id="remark"
                    label="Remark"
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />


                <Button variant="contained" size="large" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default CreateOrEditSalesAttendanceForm
