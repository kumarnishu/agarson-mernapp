import { Button, Checkbox, CircularProgress, InputLabel, ListItemText, MenuItem, OutlinedInput, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect,  useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import Select from '@mui/material/Select';
import { CreateOrEditPayment, GetAllPaymentCategories } from '../../../services/PaymentsService';
import moment from 'moment';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { GetPaymentDto, CreateOrEditPaymentDto } from '../../../dtos/payment.dto';
import { GetUsersForDropdown } from '../../../services/UserServices';


function CreateorEditPaymentForm({ payment,setDialog }: { payment?: GetPaymentDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>>  }) {
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const [users, setUsers] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, { body: CreateOrEditPaymentDto, id?: string }>
        (CreateOrEditPayment, {
            onSuccess: () => {
                queryClient.invalidateQueries('payments')
            }
        })


    const { data: userData, isSuccess: userSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("users", async () => GetUsersForDropdown({ hidden: false, show_assigned_only: false }))
    const { data: categoriesData, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("payment_categories", GetAllPaymentCategories)

    const formik = useFormik({
        initialValues: {
            category: payment ? payment.category.id : "",
            payment_title: payment ? payment.payment_title : "",
            payment_description: payment ? payment.payment_description : "",
            link: payment ? payment.link : "",
            assigned_users: payment ? payment.assigned_users.map((user) => { return user.id }) : [],
            duedate: payment ? moment(payment.due_date).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"),
            frequency: payment?.frequency||""
        },
        validationSchema: Yup.object({
            payment_title: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                .max(200, 'Must be 200 characters or less'),
            payment_description: Yup.string(),
            link: Yup.string(),
            category: Yup.string().required("required field"),
            frequency: Yup.string().required("required"),
            assigned_users: Yup.array(),
        }),
        onSubmit: (values: CreateOrEditPaymentDto) => {
            if (payment) {
                mutate({
                    id: payment._id,
                    body: values
                })
            }
            else {
                mutate({
                    id: undefined,
                    body: values
                })
            }

        }
    });

    useEffect(() => {
        if (userSuccess && userData) {
            setUsers(userData.data)
        }
    }, [userData])

    useEffect(() => {
        if (categorySuccess && categoriesData) {
            setCategories(categoriesData.data)
        }
    }, [categoriesData])

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
                {/* titles */}
                <TextField
                    required
                    error={
                        formik.touched.payment_title && formik.errors.payment_title ? true : false
                    }
                    id="payment_title"
                    label="Work Title"
                    fullWidth
                    helperText={
                        formik.touched.payment_title && formik.errors.payment_title ? formik.errors.payment_title : ""
                    }
                    {...formik.getFieldProps('payment_title')}
                />
                <TextField

                    error={
                        formik.touched.payment_description && formik.errors.payment_description ? true : false
                    }
                    id="payment_description"
                    label="Work Description"
                    fullWidth
                    helperText={
                        formik.touched.payment_description && formik.errors.payment_description ? formik.errors.payment_description : ""
                    }
                    {...formik.getFieldProps('payment_description')}
                />
                <TextField

                    multiline
                    minRows={2}
                    error={
                        formik.touched.link && formik.errors.link ? true : false
                    }
                    id="link"
                    label="Link"
                    fullWidth
                    helperText={
                        formik.touched.link && formik.errors.link ? formik.errors.link : ""
                    }
                    {...formik.getFieldProps('link')}
                />
                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.frequency && formik.errors.frequency ? true : false
                    }
                    id="frequency"
                    disabled={payment ? true : false}
                    label="Frequency"
                    fullWidth
                    helperText={
                        formik.touched.frequency && formik.errors.frequency ? formik.errors.frequency : ""
                    }
                    {...formik.getFieldProps('frequency')}
                >
                    <option key={1} value="daily">
                        Daily
                    </option>

                    <option key={2} value='weekly'>
                        Weekly
                    </option>
                    <option key={1} value="monthly">
                        Monthly
                    </option>

                    <option key={2} value='yearly'>
                        Yearly
                    </option>

                </TextField>
                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.category && formik.errors.category ? true : false
                    }
                    id="category"
                    disabled={payment ? true : false}
                    label="Category"
                    fullWidth
                    helperText={
                        formik.touched.category && formik.errors.category ? formik.errors.category : ""
                    }
                    {...formik.getFieldProps('category')}
                >
                    <option key={0} value={undefined}>
                        Select Category
                    </option>
                    {
                        categories && categories.map(cat => {

                            return (<option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>)
                        })
                    }
                </TextField>
                < TextField
                    type="date"
                    error={
                        formik.touched.duedate && formik.errors.duedate ? true : false
                    }
                    focused
                    id="duedate"
                    label="Remind Date"
                    fullWidth
                    helperText={
                        formik.touched.duedate && formik.errors.duedate ? formik.errors.duedate : ""
                    }
                    {...formik.getFieldProps('duedate')}
                />
                <InputLabel id="demo-multiple-checkbox-label">Users</InputLabel>
                <Select
                    label="Users"
                    fullWidth
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    input={<OutlinedInput label="User" />}
                    renderValue={() => `${formik.values.assigned_users.length} users`}
                    {...formik.getFieldProps('assigned_users')}
                >
                     {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                            <Checkbox checked={formik.values.assigned_users.includes(user.id)} />
                            <ListItemText primary={user.label} />
                        </MenuItem>
                    ))}
                </Select>
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : payment ? 'Update' : 'Create'}
                </Button>
            </Stack>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message="new payment added" color="success" />
                ) : null
            }

        </form>
    )
}

export default CreateorEditPaymentForm
