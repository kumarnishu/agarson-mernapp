import { Button, Checkbox, CircularProgress, InputLabel, ListItemText, MenuItem, OutlinedInput, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError, Target } from '../../..';
import { queryClient } from '../../../main';

import Select from '@mui/material/Select';
import { GetChecklistDto, CreateOrEditChecklistDto } from '../../../dtos/checklist.dto';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { UserService } from '../../../services/UserServices';
import { FeatureService } from '../../../services/FeatureServices';
import { DropdownService } from '../../../services/DropDownServices';


function CreateorEditCheckListForm({ checklist, setDialog }: { checklist?: GetChecklistDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const [users, setUsers] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, { body: FormData, id?: string }>
        (new FeatureService().CreateOrEditCheckList, {

            onSuccess: () => {
                queryClient.invalidateQueries('checklists')
                setAlert({ message: checklist ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const { data: userData, isSuccess: userSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, show_assigned_only: false }))
    const { data: categoriesData, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("check_categories", new DropdownService().GetAllCheckCategories)

    const formik = useFormik<CreateOrEditChecklistDto>({
        initialValues: {
            category: checklist ? checklist.category.id : "",
            serial_no: checklist ? checklist.serial_no : "",
            work_title: checklist ? checklist.work_title : "",
            group_title: checklist ? checklist.group_title : "",
            condition: checklist ? checklist.condition : "",
            expected_number: checklist ? checklist.expected_number : 0,
            link: checklist ? checklist.link : "",
            assigned_users: checklist ? checklist.assigned_users.map((user) => { return user.id }) : [],
            frequency: checklist ? checklist.frequency : "daily",
            photo: checklist && checklist.photo && checklist.photo || ""
        },
        validationSchema: Yup.object({
            serial_no: Yup.string().required("required field"),
            work_title: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
            ,
            group_title: Yup.string(),
            condition: Yup.string(),
            expected_number: Yup.number(),
            link: Yup.string(),
            category: Yup.string().required("required field"),
            frequency: Yup.string().required("required"),
            assigned_users: Yup.array(),
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
        onSubmit: (values: CreateOrEditChecklistDto) => {
            if (checklist) {
                let formdata = new FormData()
                formdata.append("body", JSON.stringify(values))
                if (values.photo)
                    formdata.append("photo", values.photo)
                mutate({
                    id: checklist._id,
                    body: formdata
                })
            }
            else {
                let formdata = new FormData()
                formdata.append("body", JSON.stringify(values))
                if (values.photo)
                    formdata.append("photo", values.photo)
                mutate({
                    id: undefined,
                    body: formdata
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

    useEffect(() => {
        if (formik.values.condition !== "check_expected_number")
            formik.values.expected_number = 0

    }, [formik.values.condition])

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
                        formik.touched.serial_no && formik.errors.serial_no ? true : false
                    }
                    id="serial_no"
                    label="Serial Number"
                    fullWidth
                    helperText={
                        formik.touched.serial_no && formik.errors.serial_no ? formik.errors.serial_no : ""
                    }
                    {...formik.getFieldProps('serial_no')}
                />
                <TextField
                    required
                    error={
                        formik.touched.work_title && formik.errors.work_title ? true : false
                    }
                    multiline
                    rows={4}
                    id="work_title"
                    label="Work Title"
                    fullWidth
                    helperText={
                        formik.touched.work_title && formik.errors.work_title ? formik.errors.work_title : ""
                    }
                    {...formik.getFieldProps('work_title')}
                />
                <TextField
                    multiline
                    rows={4}
                    error={
                        formik.touched.group_title && formik.errors.group_title ? true : false
                    }
                    id="group_title"
                    label="Group Title"
                    fullWidth
                    helperText={
                        formik.touched.group_title && formik.errors.group_title ? formik.errors.group_title : ""
                    }
                    {...formik.getFieldProps('group_title')}
                />
                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.condition && formik.errors.condition ? true : false
                    }
                    id="condition"
                    label="Condition"
                    fullWidth
                    helperText={
                        formik.touched.condition && formik.errors.condition ? formik.errors.condition : ""
                    }
                    {...formik.getFieldProps('condition')}
                >
                    ''||''||'
                    <option key={1} value="check-blank">
                        Check Blank Or Not
                    </option>

                    <option key={2} value='check_expected_number'>
                        Check Expected Number
                    </option>
                    <option key={3} value="check_yesno">
                        Check Pending/Done
                    </option>
                </TextField>
                {formik.values.condition == "check_expected_number" && <TextField

                    multiline
                    minRows={2}
                    error={
                        formik.touched.expected_number && formik.errors.expected_number ? true : false
                    }
                    id="expected_number"
                    label="Expected Number"
                    fullWidth
                    helperText={
                        formik.touched.expected_number && formik.errors.expected_number ? formik.errors.expected_number : ""
                    }
                    {...formik.getFieldProps('expected_number')}
                />}



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
                    disabled={checklist ? true : false}
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
                <InputLabel id="demo-multiple-checkbox-label">Users</InputLabel>
                <Select
                    label="Users"
                    variant='filled'
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
                < TextField
                    select
                    variant='filled'
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.category && formik.errors.category ? true : false
                    }
                    id="category"
                    label="Category"
                    fullWidth
                    helperText={
                        formik.touched.category && formik.errors.category ? formik.errors.category : ""
                    }
                    {...formik.getFieldProps('category')}
                >
                    <option key={0} value={undefined}>
                    </option>
                    {
                        categories && categories.map(cat => {

                            return (<option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>)
                        })
                    }
                </TextField>


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


                <TextField
                    fullWidth
                    variant='filled'
                    error={
                        formik.touched.photo && formik.errors.photo ? true : false
                    }
                    helperText={
                        formik.touched.photo && formik.errors.photo ? (formik.errors.photo) : ""
                    }
                    label="Photo"
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
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : checklist ? 'Update' : 'Create'}
                </Button>
            </Stack>


        </form>
    )
}

export default CreateorEditCheckListForm
