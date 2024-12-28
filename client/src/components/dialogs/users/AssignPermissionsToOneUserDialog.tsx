import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, CircularProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { Cancel, CheckBoxOutlineBlank, CheckCircleOutline } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { IMenu, IPermission } from '../../../dtos/permission.dto';
import { GetUserDto } from '../../../dtos/user.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { UserService } from '../../../services/UserServices';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    user: GetUserDto
}

const RenderTree = ({ permissiontree, permissions, setPermissions, prefix }: { permissiontree: IMenu, permissions: string[], setPermissions: React.Dispatch<React.SetStateAction<string[]>>, prefix: string }) => {
    if (Array.isArray(permissiontree)) {
        return permissiontree.map((item, index) => {
            // Generate the index for this level
            const currentIndex = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;

            return (
                <div key={currentIndex} style={{ paddingTop: 10 }}>
                    <h5 style={{ paddingLeft: item.menues && item.permissions ? '10px' : '25px' }}>
                        {currentIndex} : {item.label}
                    </h5>
                    {item.permissions && (
                        <Stack flexDirection={'row'} flexWrap={'wrap'} gap={1} paddingTop={2}>
                            {item.permissions.map((perm: IPermission, idx: number) => (
                                <Stack flexDirection={'row'} pl={item.menues && item.permissions ? '10px' : '25px'} key={idx}>
                                    {permissions.includes(perm.value) ?
                                        <CheckCircleOutline color='success' onClick={() => {
                                            let perms = permissions.filter((i) => { return i !== perm.value });
                                            setPermissions(perms);
                                        }} />
                                        :
                                        <CheckBoxOutlineBlank
                                            onClick={() => {
                                                let perms = permissions.filter((i) => { return i !== perm.value });
                                                perms.push(perm.value);
                                                setPermissions(perms);
                                            }}
                                        />}
                                    <span style={{ paddingLeft: 5 }}>{perm.label}</span>
                                </Stack>
                            ))}
                        </Stack>
                    )}
                    {item.menues && RenderTree({ permissiontree: item.menues, permissions: permissions, setPermissions: setPermissions, prefix: currentIndex })}
                </div>
            );
        });
    }
};


function AssignPermissionsToOneUserDialog({ user, dialog, setDialog }: Props) {
    const [permissiontree, setPermissiontree] = useState<IMenu>()
    const [permissions, setPermissions] = useState<string[]>(user.assigned_permissions)
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_id: string,
                permissions: string[]
            }
        }>
        (new UserService(). AssignPermissionsToOneUser, {
            onSuccess: () => {
                queryClient.invalidateQueries('users')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { data: Permdata, isSuccess: isPermSuccess } = useQuery<AxiosResponse<IMenu>, BackendError>("permissions",new UserService().  GetPermissions)



    useEffect(() => {
        if (isPermSuccess) {
            setPermissiontree(Permdata.data);
        }

    }, [isPermSuccess, user])



    useEffect(() => {
        setPermissions(user.assigned_permissions)
    }, [user])

    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined);
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            fullScreen
            open={dialog === "AssignPermissionsToOneUserDialog"}
            onClose={() => {
                setDialog(undefined)
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px', justifyContent: 'space-around' }} textAlign="center">
                Assign Permissions

                <Button sx={{ ml: 4 }} variant='text' onClick={() => { setPermissions([]) }}>Clear All</Button>
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        {`Warning ! This will update  permissions for ${user.username} `}

                    </Typography>


                    {permissiontree && <RenderTree permissiontree={permissiontree} permissions={permissions} setPermissions={setPermissions} prefix='' />}

                    <Button style={{ padding: 10, marginTop: 10 }} variant="contained" color="primary" type="submit"
                        disabled={Boolean(isLoading)}
                        onClick={() => {
                            mutate({
                                body: {
                                    user_id: user._id,
                                    permissions: permissions
                                }
                            })
                        }}
                        fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                    </Button>



                </Stack>

            </DialogContent>
        </Dialog >
    )
}

export default AssignPermissionsToOneUserDialog