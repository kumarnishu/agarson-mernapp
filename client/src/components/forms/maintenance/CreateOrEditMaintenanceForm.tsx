import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext, MaintenanceChoiceActions, } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { GetUserDto } from '../../../dtos/users/user.dto';
import { GetUsers } from '../../../services/UserServices';
import { DropDownDto } from '../../../dtos/common/dropdown.dto';

import { CreateOrEditMaintenanceDto, GetMaintenanceDto } from '../../../dtos/maintenance/maintenance.dto';
import { CreateOrEditMaintenance, GetAllMaintenanceCategory } from '../../../services/MaintenanceServices';

function CreateOrEditMaintenanceForm({ maintenance }: { maintenance?: GetMaintenanceDto }) {
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const [users, setUsers] = useState<GetUserDto[]>([])
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, { body: FormData, id?: string }>
        (CreateOrEditMaintenance, {
            onSuccess: () => {
                queryClient.invalidateQueries('maintenances')
            }
        })


    const { data: userData, isSuccess: userSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', show_assigned_only: true, permission: 'feature_menu' }))
    const { data: categoriesData, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("m_categories", GetAllMaintenanceCategory)
    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<CreateOrEditMaintenanceDto>({
        initialValues: {
            category: maintenance ? maintenance.category.id : "",
            work: maintenance ? maintenance.work : "",
            maintainable_item: maintenance ? maintenance.item : "",
            user: maintenance ? maintenance.user.id : "",
            frequency: maintenance ? maintenance.frequency : "daily",
        },
        validationSchema: Yup.object({
            work: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                .max(200, 'Must be 200 characters or less'),
            category: Yup.string().required("required field"),
            maintainable_item: Yup.string().required("required field"),
            frequency: Yup.string().required("required"),
            user: Yup.string().required("required"),
        }),
        onSubmit: (values: CreateOrEditMaintenanceDto) => {
            if (maintenance) {
                let formdata = new FormData()
                formdata.append("body", JSON.stringify(values))
                mutate({
                    id: maintenance._id,
                    body: formdata
                })
            }
            else {
                let formdata = new FormData()
                formdata.append("body", JSON.stringify(values))
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
            setChoice({ type: MaintenanceChoiceActions.close_maintenance })
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
                        formik.touched.work && formik.errors.work ? true : false
                    }
                    id="work"
                    label="Work Title"
                    fullWidth
                    helperText={
                        formik.touched.work && formik.errors.work ? formik.errors.work : ""
                    }
                    {...formik.getFieldProps('work')}
                />



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
                    disabled={maintenance ? true : false}
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
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.frequency && formik.errors.frequency ? true : false
                    }
                    id="frequency"
                    disabled={maintenance ? true : false}
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
                        formik.touched.user && formik.errors.user ? true : false
                    }
                    id="user"
                    label="Assign To"
                    fullWidth
                    helperText={
                        formik.touched.user && formik.errors.user ? formik.errors.user : ""
                    }
                    {...formik.getFieldProps('user')}
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
                    required
                    error={
                        formik.touched.maintainable_item && formik.errors.maintainable_item ? true : false
                    }
                    disabled={maintenance ? true : false}
                    id="maintainable_item"
                    label="Maintainable Item"
                    fullWidth
                    helperText={
                        formik.touched.maintainable_item && formik.errors.maintainable_item ? formik.errors.maintainable_item : "type machine if wants to add machines list ?"
                    }
                    {...formik.getFieldProps('maintainable_item')}
                />


                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : maintenance ? 'Update' : 'Create'}
                </Button>
            </Stack>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message="new maintenance added" color="success" />
                ) : null
            }

        </form>
    )
}

export default CreateOrEditMaintenanceForm
