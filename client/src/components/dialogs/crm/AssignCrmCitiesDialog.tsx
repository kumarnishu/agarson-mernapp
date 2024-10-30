import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { useFormik } from 'formik';
import * as Yup from "yup"
import { GetUsers } from '../../../services/UserServices';
import { AssignCRMCitiesToUsers } from '../../../services/LeadsServices';
import { DropDownDto } from '../../../dtos';
import { GetUserDto } from '../../../dtos';


function AssignCrmCitiesDialog({ cities, flag }: { cities: DropDownDto[], flag: number }) {

    const [users, setUsers] = useState<GetUserDto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission:'dropdown_menu',show_assigned_only:true}))



    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                city_ids: string[],
                flag: number
            }
        }>
        (AssignCRMCitiesToUsers, {
            onSuccess: () => {
                queryClient.invalidateQueries('crm_cities')
            }
        })
    const formik = useFormik<{
        user_ids: string[],
        city_ids: string[],
    }>({
        initialValues: {
            user_ids: [],
            city_ids: cities.map((item) => { return item.id })
        },
        validationSchema: Yup.object({
            user_ids: Yup.array()
                .required('field'),
            city_ids: Yup.array()
                .required('field')
        }),
        onSubmit: (values: {
            user_ids: string[],
            city_ids: string[]
        }) => {
            mutate({
                body: {
                    user_ids: values.user_ids,
                    city_ids: cities.map((item) => { return item.id }),
                    flag: flag
                }
            })

        }
    });

    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [isUsersSuccess, usersData])


    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: LeadChoiceActions.close_lead });
            formik.setValues({ user_ids: [], city_ids: [] });
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={choice === LeadChoiceActions.bulk_assign_crm_cities ? true : false}
            onClose={() => {
                setChoice({ type: LeadChoiceActions.close_lead });
                formik.setValues({ user_ids: [], city_ids: [] });
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: LeadChoiceActions.close_lead });
                formik.setValues({ user_ids: [], city_ids: [] });
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {flag === 0 ? 'Remove States' : 'Assign States'}
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        {flag === 1 && `Warning ! This will assign ${cities.length} States to the ${formik.values.user_ids.length} Users.`}
                        {flag === 0 && `Warning ! This will remove  ${cities.length} States from  ${formik.values.user_ids.length} Users.`}

                    </Typography>
                    <Button onClick={() => formik.setValues({ user_ids: [], city_ids: cities.map((item) => { return item.id }) })}>Remove Selection</Button>
                    <form onSubmit={formik.handleSubmit}>
                        < TextField
                            select
                            SelectProps={{
                                native: true,
                                multiple: true
                            }}
                            focused
                            id="Users"
                            label="Select Users"
                            fullWidth
                            {...formik.getFieldProps('user_ids')}
                        >
                            {
                                users.map(user => {
                                    if (user.is_active)
                                        return (<option key={user._id} value={user._id}>
                                            {user.username}
                                        </option>)
                                })
                            }
                        </TextField>
                        <Button style={{ padding: 10, marginTop: 10 }} variant="contained" color={flag != 0 ? "primary" : "error"} type="submit"
                            disabled={Boolean(isLoading)}
                            fullWidth>
                            {flag == 0 ? 'Remove ' : "Assign"}
                        </Button>
                    </form>


                </Stack>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="successfull" color="success" />
                    ) : null
                }
            </DialogContent>
        </Dialog >
    )
}

export default AssignCrmCitiesDialog