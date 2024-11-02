import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext, CheckListChoiceActions } from '../../../contexts/dialogContext';
import { BackendError, Target } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { CreateOrEditCheckList, GetAllCheckCategories } from '../../../services/CheckListServices';
import { GetUserDto } from '../../../dtos';
import { GetUsers } from '../../../services/UserServices';
import { CreateOrEditChecklistDto, GetChecklistDto } from '../../../dtos';
import { DropDownDto } from '../../../dtos';

function CreateorEditCheckListForm({ checklist }: { checklist?: GetChecklistDto }) {
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const [users, setUsers] = useState<GetUserDto[]>([])
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, { body: FormData, id?: string }>
        (CreateOrEditCheckList, {
            onSuccess: () => {
                queryClient.invalidateQueries('checklists')
            }
        })


    const { data: userData, isSuccess: userSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', show_assigned_only: true, permission: 'feature_menu' }))
    const { data: categoriesData, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("check_categories", GetAllCheckCategories)
    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<CreateOrEditChecklistDto>({
        initialValues: {
            category: checklist ? checklist.category.id : "",
            work_title: checklist ? checklist.work_title : "",
            work_description: checklist ? checklist.work_description : "",
            link: checklist ? checklist.link : "",
            assigned_users: checklist ? checklist.assigned_users.map((user)=>{return user.id}) : [],
            frequency: checklist ? checklist.frequency : "daily",
            photo: checklist && checklist.photo && checklist.photo || ""
        },
        validationSchema: Yup.object({
            work_title: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                .max(200, 'Must be 200 characters or less'),
            work_description: Yup.string(),
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
            setChoice({ type: CheckListChoiceActions.close_checklist })
        }
    }, [isSuccess, setChoice])


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
                        formik.touched.work_title && formik.errors.work_title ? true : false
                    }
                    id="work_title"
                    label="Work Title"
                    fullWidth
                    helperText={
                        formik.touched.work_title && formik.errors.work_title ? formik.errors.work_title : ""
                    }
                    {...formik.getFieldProps('work_title')}
                />
                <TextField
                    
                    error={
                        formik.touched.work_description && formik.errors.work_description ? true : false
                    }
                    id="work_description"
                    label="Work Description"
                    fullWidth
                    helperText={
                        formik.touched.work_description && formik.errors.work_description ? formik.errors.work_description : ""
                    }
                    {...formik.getFieldProps('work_description')}
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
                    disabled={checklist ? true : false}
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
                        categories.map(cat => {

                            return (<option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>)
                        })
                    }
                </TextField>

                < TextField
                    select
                    SelectProps={{
                        native: true,
                        multiple:true
                    }}
                    focused
                    error={
                        formik.touched.assigned_users && formik.errors.assigned_users ? true : false
                    }
                    id="assigned_users"
                    label="Responsible Persons"
                    fullWidth
                    helperText={
                        formik.touched.assigned_users && formik.errors.assigned_users ? formik.errors.assigned_users : ""
                    }
                    {...formik.getFieldProps('assigned_users')}
                >
                    <option key={0} value={undefined}>
                        Select Person
                    </option>
                    {
                        users.map(user => {

                            return (<option key={user._id} value={user._id}>
                                {user.username}
                            </option>)
                        })
                    }
                </TextField>
                
                <TextField
                    fullWidth
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
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message="new checklist added" color="success" />
                ) : null
            }

        </form>
    )
}

export default CreateorEditCheckListForm
