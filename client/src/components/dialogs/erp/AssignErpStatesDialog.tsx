import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, CircularProgress, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { ChoiceContext, UserChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { useFormik } from 'formik';
import * as Yup from "yup"
import { GetUsers } from '../../../services/UserServices';
import { AssignErpStatesToUsers } from '../../../services/ErpServices';
import { GetUserDto } from '../../../dtos';
import { GetErpStateDto } from '../../../dtos';


function AssignErpStatesDialog({ states, flag }: { states: GetErpStateDto[], flag: number }) {

    const [users, setUsers] = useState<GetUserDto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'dropdown_menu', show_assigned_only: true }))



    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                state_ids: string[],
                flag: number
            }
        }>
        (AssignErpStatesToUsers, {
            onSuccess: () => {
                queryClient.invalidateQueries('erp_states')
            }
        })
    const formik = useFormik<{
        user_ids: string[],
        state_ids: string[],
    }>({
        initialValues: {
            user_ids: [],
            state_ids: states.map((item) => { return item._id })
        },
        validationSchema: Yup.object({
            user_ids: Yup.array()
                .required('field'),
            state_ids: Yup.array()
                .required('field')
        }),
        onSubmit: (values: {
            user_ids: string[],
            state_ids: string[]
        }) => {
            mutate({
                body: {
                    user_ids: values.user_ids,
                    state_ids: states.map((item) => { return item._id }),
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
            setChoice({ type: UserChoiceActions.close_user });
            formik.setValues({ user_ids: [], state_ids: [] });
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={choice === UserChoiceActions.bulk_assign_erp_states ? true : false}
            onClose={() => {
                setChoice({ type: UserChoiceActions.close_user });
                formik.setValues({ user_ids: [], state_ids: [] });
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: UserChoiceActions.close_user });
                formik.setValues({ user_ids: [], state_ids: [] });
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

                        {flag === 1 && `Warning ! This will assign ${states.length} States to the ${formik.values.user_ids.length} Users.`}
                        {flag === 0 && `Warning ! This will remove  ${states.length} States from  ${formik.values.user_ids.length} Users.`}

                    </Typography>
                    <Button onClick={() => formik.setValues({ user_ids: [], state_ids: states.map((item) => { return item._id }) })}>Remove Selection</Button>
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
                        <Button style={{ padding: 10, marginTop: 10 }} variant="contained" color="primary" type="submit"
                            disabled={Boolean(isLoading)}
                            fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Assign"}
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

export default AssignErpStatesDialog