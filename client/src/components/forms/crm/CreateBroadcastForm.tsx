import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import React, { useEffect, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext, TemplateChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { IBroadcast } from '../../../types/crm.types';
import { CreateBroadcast } from '../../../services/LeadsServices';
import { IUser } from '../../../types/user.types';
import { GetUsers } from '../../../services/UserServices';
import { IMessageTemplate, ITemplateCategoryField } from '../../../types/template.types';
import { GetCategories, GetTemplates } from '../../../services/TemplateServices';


type FormData = {
    name: string,
    connected_users: string[],
    templates: string[],
    is_random_template: boolean,
    daily_limit: number,
    time_gap: number,
    autoRefresh: boolean
}

function CreateBroadCastForm() {
    const [category, setCategory] = useState<string>('marketing')
    const { data: usersData } = useQuery<AxiosResponse<IUser[]>, BackendError>("users", async () => GetUsers())
    const { data: categoryData } = useQuery<AxiosResponse<ITemplateCategoryField>, BackendError>("catgeories", GetCategories, {
        staleTime: 10000
    })
    const { data: templatesData } = useQuery<AxiosResponse<IMessageTemplate[]>, BackendError>(["templates", category], async () => GetTemplates({ category: category }))

    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<IBroadcast>, BackendError, FormData>
        (CreateBroadcast, {
            onSuccess: () => {
                queryClient.invalidateQueries('broadcast')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<FormData>({
        initialValues: {
            name: "",
            time_gap: 5,
            connected_users: [],
            templates: [],
            is_random_template: true,
            autoRefresh: true,
            daily_limit: 1000
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Required field'),
            connected_users: Yup.array().required(),
            templates: Yup.array().required(),
            time_gap: Yup.number()
                .required('Required field'),
            daily_limit: Yup.number()
                .required('Required field'),
            is_random_template: Yup.boolean(),
            autoRefresh: Yup.boolean()
        }),
        onSubmit: (values: FormData) => {
            mutate(values)
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                setChoice({ type: TemplateChoiceActions.close_template })
            }, 1000)
        }
    }, [isSuccess, setChoice])

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack sx={{ direction: { xs: 'column', md: 'row' } }}>
                <Stack
                    direction="column"
                    gap={2}
                    sx={{ p: 1 }}
                >
                    < TextField
                        size='small'
                        fullWidth
                        focused
                        id="name"
                        error={
                            formik.touched.name && formik.errors.name ? true : false
                        }
                        label="Broadcast Name"
                        helperText={
                            formik.touched.name && formik.errors.name ? formik.errors.name : ""
                        }
                        {...formik.getFieldProps('name')}
                    />
                    <TextField
                        fullWidth
                        required
                        focused
                        select
                        SelectProps={{
                            native: true,
                            multiple: true
                        }}
                        error={
                            formik.touched.connected_users && formik.errors.connected_users ? true : false
                        }
                        id="whatsapp_users"
                        label="Whatsapp Users"
                        helperText={
                            formik.touched.connected_users && formik.errors.connected_users ? formik.errors.connected_users : ""
                        }
                        {...formik.getFieldProps('connected_users')}
                    >
                        {
                            usersData && usersData.data.map(user => {
                                return (
                                    <React.Fragment key={user._id}>
                                        {user.connected_number && <option value={user._id}>
                                            {`${user.username} :: ${String(user.connected_number).split(":")[0].replace("91", "").toString()}`}
                                        </option>}
                                    </React.Fragment>
                                )
                            })
                        }
                    </TextField>
                    <TextField
                        fullWidth
                        required
                        type="number"
                        error={
                            formik.touched.time_gap && formik.errors.time_gap ? true : false
                        }
                        id="time_gap"
                        label="gap in Seconds"
                        helperText={
                            formik.touched.time_gap && formik.errors.time_gap ? formik.errors.time_gap : ""
                        }
                        {...formik.getFieldProps('time_gap')}
                    />
                    < TextField
                        size='small'
                        select
                        value={category}
                        SelectProps={{
                            native: true,
                        }}
                        fullWidth
                        onChange={(e) => setCategory(e.currentTarget.value)}
                        focused
                        id="category"
                        label="category"

                    >
                        {
                            categoryData && categoryData.data && categoryData.data.categories.map((category, index) => {
                                return (<option key={index} value={category}>
                                    {category}
                                </option>)
                            })
                        }
                    </TextField>
                    <TextField
                        fullWidth
                        required
                        select
                        focused
                        SelectProps={{
                            native: true,
                            multiple: true
                        }}
                        error={
                            formik.touched.templates && formik.errors.templates ? true : false
                        }
                        id="Templates"
                        label="Templates"
                        helperText={
                            formik.touched.templates && formik.errors.templates ? formik.errors.templates : ""
                        }
                        {...formik.getFieldProps('templates')}
                    >
                        {
                            templatesData && templatesData.data.map(template => {
                                return (
                                    <React.Fragment key={template._id}>
                                        <option value={template._id}>
                                            {template.name}
                                        </option>
                                    </React.Fragment>
                                )
                            })
                        }
                    </TextField>
                    <TextField
                        variant='standard'
                        fullWidth
                        required
                        type="number"
                        error={
                            formik.touched.daily_limit && formik.errors.daily_limit ? true : false
                        }
                        id="daily_limit"
                        label="Daily limit"
                        helperText={
                            formik.touched.daily_limit && formik.errors.daily_limit ? formik.errors.daily_limit : ""
                        }
                        {...formik.getFieldProps('daily_limit')}
                    />

                    <FormGroup>
                        <FormControlLabel control={<Checkbox
                            checked={Boolean(formik.values.is_random_template)}
                            {...formik.getFieldProps('is_random_template')}
                        />} label="Random Template" />
                    </FormGroup>

                    <FormGroup>
                        <FormControlLabel control={<Checkbox
                            checked={Boolean(formik.values.autoRefresh)}
                            {...formik.getFieldProps('autoRefresh')}
                        />} label="Auto Refresh" />
                    </FormGroup>

                    {
                        isError ? (
                            <AlertBar message={error?.response.data.message} color="error" />
                        ) : null
                    }
                    {
                        isSuccess ? (
                            <AlertBar message="new broadcast created" color="success" />
                        ) : null
                    }
                    <Button variant="contained" color="primary" type="submit"
                        disabled={Boolean(isLoading)}
                        fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Create"}
                    </Button>
                </Stack>
            </Stack>
        </form >
    )
}

export default CreateBroadCastForm