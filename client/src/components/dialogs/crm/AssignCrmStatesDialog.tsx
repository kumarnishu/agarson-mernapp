import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import {  useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { useFormik } from 'formik';
import * as Yup from "yup"
import { AssignCRMStatesToUsers } from '../../../services/LeadsServices';
import { GetCrmStateDto } from '../../../dtos/crm-state.dto';
import { GetUsersForDropdown } from '../../../services/UserServices';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    states: GetCrmStateDto[], flag: number
}
function AssignCrmStatesDialog({ states, flag, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const [users, setUsers] = useState<DropDownDto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => GetUsersForDropdown({ hidden: false, show_assigned_only: false }))



    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                state_ids: string[],
                flag: number
            }
        }>
        (AssignCRMStatesToUsers, {
           
            onSuccess: () => {
                queryClient.invalidateQueries('crm_states')
                setAlert({ message: "success", color: 'success' })
              },
              onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
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
            setDialog(undefined)
            formik.setValues({ user_ids: [], state_ids: [] });
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={dialog === 'AssignCrmStatesDialog'}
            onClose={() => {
                setDialog(undefined)
                formik.setValues({ user_ids: [], state_ids: [] });
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
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

                        <InputLabel id="demo-multiple-checkbox-label">Users</InputLabel>
                        <Select
                            label="Users"
                            fullWidth
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            input={<OutlinedInput label="User" />}
                            renderValue={() => `${formik.values.user_ids.length} users`}
                            {...formik.getFieldProps('user_ids')}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    <Checkbox checked={formik.values.user_ids.includes(user.id)} />
                                    <ListItemText primary={user.label} />
                                </MenuItem>
                            ))}
                        </Select>


                        <Button style={{ padding: 10, marginTop: 10 }} variant="contained" color={flag != 0 ? "primary" : "error"} type="submit"
                            disabled={Boolean(isLoading)}
                            fullWidth>
                            {flag == 0 ? 'Remove ' : "Assign"}
                        </Button>
                    </form>


                </Stack>
             
            </DialogContent>
        </Dialog >
    )
}

export default AssignCrmStatesDialog