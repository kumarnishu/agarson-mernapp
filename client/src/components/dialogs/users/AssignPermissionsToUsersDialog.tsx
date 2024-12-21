import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, CircularProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { Cancel, CheckBoxOutlineBlank, CheckCircleOutline } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { IMenu, IPermission } from '../../../dtos/permission.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { UserService } from '../../../services/UserServices';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    user_ids: string[], flag: number
}

function AssignPermissionsToUsersDialog({ user_ids, flag, dialog, setDialog }: Props) {
    const [permissiontree, setPermissiontree] = useState<IMenu>()
    const [permissions, setPermissions] = useState<string[]>([])
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                permissions: string[],
                flag: number
            }
        }>
        (new UserService().AssignPermissionsToUsers, {
            onSuccess: () => {
                queryClient.invalidateQueries('users')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { data: Permdata, isSuccess: isPermSuccess } = useQuery<AxiosResponse<IMenu>, BackendError>("permissions", new UserService().GetPermissions)



    useEffect(() => {
        if (isPermSuccess) {
            setPermissiontree(Permdata.data);
        }

    }, [isPermSuccess])

    {/* const renderData = (permissiontree: IMenu) => {
        if (Array.isArray(permissiontree)) {
            return permissiontree.map((item, index) => (
                
                <div key={index} style={{ paddingTop: 10 }}>
                    <h3 style={{ paddingLeft: item.menues && item.permissions ? '10px' : '25px' }}>{index + 1} : {item.label}</h3>
                    {item.permissions && (
                        <Stack flexDirection={'row'} flexWrap={'wrap'} gap={1} paddingTop={2}>
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
    }; */}
    const renderData = (permissiontree: IMenu, prefix: string = '') => {
        if (Array.isArray(permissiontree)) {
            return permissiontree.map((item, index) => {
                // Generate the index for this level
                const currentIndex = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;

                return (
                    <div key={currentIndex} style={{ paddingTop: 10 }}>
                        <h3 style={{ paddingLeft: item.menues && item.permissions ? '10px' : '25px' }}>
                            {currentIndex} : {item.label}
                        </h3>
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
                        {item.menues && renderData(item.menues, currentIndex)} {/* Pass the current index as a prefix */}
                    </div>
                );
            });
        }
    };


    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            fullScreen
            open={dialog === 'AssignPermissionsToUsersDialog'}
            onClose={() => {
                setDialog(undefined)
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {flag !== 0 ? "Assign Selected Permissions" : "Remove Selected Permissions"}
            </DialogTitle>
            <DialogContent sx={{ alignItems: 'center' }}>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        {`Warning ! This will ${flag == 0 ? "remove " : "add "} selected  permissions for the selected  ${user_ids.length} Users.`}

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

            </DialogContent>
        </Dialog >
    )
}

export default AssignPermissionsToUsersDialog