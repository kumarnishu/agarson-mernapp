import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, CircularProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { ChoiceContext, UserChoiceActions } from '../../../contexts/dialogContext';
import { Cancel, CheckBoxOutlineBlank, CheckCircleOutline } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { AssignPermissionsToUsers, GetPermissions } from '../../../services/UserServices';
import { IMenu, IPermission } from '../../../dtos';


function AssignPermissionsToUsersDialog({ user_ids, flag }: { user_ids: string[], flag: number }) {
    const [permissiontree, setPermissiontree] = useState<IMenu>()
    const [permissions, setPermissions] = useState<string[]>([])
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                permissions: string[],
                flag: number
            }
        }>
        (AssignPermissionsToUsers, {
            onSuccess: () => {
                queryClient.invalidateQueries('users')
            }
        })
    const { data: Permdata, isSuccess: isPermSuccess } = useQuery<AxiosResponse<IMenu>, BackendError>("permissions", GetPermissions)



    useEffect(() => {
        if (isPermSuccess) {
            setPermissiontree(Permdata.data);
        }

    }, [isPermSuccess])

    const renderData = (permissiontree: IMenu) => {
        if (Array.isArray(permissiontree)) {
            return permissiontree.map((item, index) => (
                <div key={index} style={{ paddingTop: 10 }}>
                    <h3 style={{ paddingLeft: item.menues && item.permissions ? '10px' : '25px' }}>{item.label}</h3>
                    {item.permissions && (
                        <Stack flexDirection={'row'} gap={1} paddingTop={2}>
                            {item.permissions.map((perm: IPermission, idx: number) => (
                                <Stack flexDirection={'row'} pl={item.menues && item.permissions ? '10px' : '25px'} key={idx}>
                                    {permissions.includes(perm.value) ?
                                        <CheckCircleOutline color='success' onClick={() => {
                                            let perms = permissions.filter((i) => { return i !== perm.value })
                                            setPermissions(perms);

                                        }} />

                                        :
                                        <CheckBoxOutlineBlank
                                            onClick={() => {
                                                let perms = permissions.filter((i) => { return i !== perm.value })
                                                perms.push(perm.value);
                                                setPermissions(perms);

                                            }}
                                        />}
                                    <span style={{ paddingLeft: 5 }}>{perm.label}</span>
                                </Stack>
                            ))}
                        </Stack>
                    )}
                    {item.menues && renderData(item.menues)}
                </div>
            ));
        }
        return null;
    };


    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: UserChoiceActions.close_user });
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            fullScreen
            open={choice === UserChoiceActions.bulk_assign_permissions ? true : false}
            onClose={() => {
                setChoice({ type: UserChoiceActions.close_user });
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: UserChoiceActions.close_user });
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {flag !== 0 ? "Assign Permissions" : "Remove Permissions"}
            </DialogTitle>
            <DialogContent sx={{ alignItems: 'center' }}>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        {`Warning ! This will ${flag == 0 ? "remove " : "add "}  permissions for ${user_ids.length} Users.`}

                    </Typography>


                    {permissiontree && renderData(permissiontree)}

                    <Button style={{ padding: 10, marginTop: 10 }} variant="contained" color="primary" type="submit"
                        disabled={Boolean(isLoading)}
                        onClick={() => {

                            mutate({
                                body: {
                                    user_ids: user_ids,
                                    permissions: permissions,
                                    flag: flag
                                }
                            })
                        }}
                        fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                    </Button>



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

export default AssignPermissionsToUsersDialog