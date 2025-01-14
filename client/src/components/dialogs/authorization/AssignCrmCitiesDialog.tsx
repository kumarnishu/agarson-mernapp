import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { useFormik } from 'formik';
import * as Yup from "yup"
import { AlertContext } from '../../../contexts/alertContext';
import { UserService } from '../../../services/UserServices';
import { AuthorizationService } from '../../../services/AuthorizationService';
import { DropDownDto } from '../../../dtos/response/DropDownDto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    cities: DropDownDto[], flag: number
}

function AssignCrmCitiesDialog({ cities, flag, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const [users, setUsers] = useState<DropDownDto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, show_assigned_only: false }))
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                city_ids: string[],
                flag: number
            }
        }>
        (new AuthorizationService().AssignCRMCitiesToUsers, {

            onSuccess: () => {
                queryClient.invalidateQueries('crm_cities')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
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
            setDialog(undefined)
            formik.setValues({ user_ids: [], city_ids: [] });
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={dialog === 'AssignCrmCitiesDialog'}
            onClose={() => {
                setDialog(undefined)
                formik.setValues({ user_ids: [], city_ids: [] });
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
                formik.setValues({ user_ids: [], city_ids: [] });
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {flag === 0 ? 'Remove Cities' : 'Assign Cities'}
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        {flag === 1 && `Warning ! This will assign ${cities.length} Cities to the ${formik.values.user_ids.length} Users.`}
                        {flag === 0 && `Warning ! This will remove  ${cities.length} Cities from  ${formik.values.user_ids.length} Users.`}

                    </Typography>
                    <Button onClick={() => formik.setValues({ user_ids: [], city_ids: cities.map((item) => { return item.id }) })}>Remove Selection</Button>
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

export default AssignCrmCitiesDialog