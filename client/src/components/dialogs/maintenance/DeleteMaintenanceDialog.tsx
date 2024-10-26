import { Dialog, DialogTitle, DialogContent, IconButton,  Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ChoiceContext,  MaintenanceChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import {  GetMaintenanceDto } from '../../../dtos/maintenance/maintenance.dto';
import { DeleteMaintenance } from '../../../services/MaintenanceServices';

function DeleteMaintenanceDialog({ maintenance }: { maintenance: GetMaintenanceDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (DeleteMaintenance, {
            onSuccess: () => {
                queryClient.invalidateQueries('maintenances')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: MaintenanceChoiceActions.close_maintenance })
    }, [setChoice, isSuccess])

    return (
        <>
            <Dialog fullWidth open={choice === MaintenanceChoiceActions.delete_maintenance ? true : false}
                onClose={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Delete Maintenance
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" deleted maintenance" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will delete  ${maintenance.work}`}

                    </Typography>
                </DialogContent>

                <Stack
                    direction="column"
                    gap={2}
                    padding={2}
                    width="100%"
                >
                    <Button fullWidth variant="outlined" color="error"
                        onClick={() => {
                            setChoice({ type: MaintenanceChoiceActions.delete_maintenance })
                            mutate(maintenance._id)
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Delete"}
                    </Button>
                </Stack >
            </Dialog>
        </>
    )
}

export default DeleteMaintenanceDialog