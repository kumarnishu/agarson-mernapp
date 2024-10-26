import { Dialog, DialogTitle, DialogContent, IconButton,  Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ChoiceContext, MaintenanceChoiceActions,  } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { DropDownDto } from '../../../dtos/common/dropdown.dto';
import { ToogleMaintenanceCategory } from '../../../services/MaintenanceServices';

function ToogleMaintenanceCategoryDialog({ category }: { category: DropDownDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (ToogleMaintenanceCategory, {
            onSuccess: () => {
                queryClient.invalidateQueries('check_categories')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: MaintenanceChoiceActions.close_maintenance })
    }, [setChoice, isSuccess])

    return (
        <>
            <Dialog fullWidth open={choice === MaintenanceChoiceActions.toogle_maintenance_category ? true : false}
                onClose={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Toogle Status Of Category
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" changed status of  category" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will toogle  ${category.label}`}

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
                            setChoice({ type: MaintenanceChoiceActions.toogle_maintenance_category })
                            mutate(category.id)
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Toogle Category"}
                    </Button>
                </Stack >
            </Dialog>
        </>
    )
}

export default ToogleMaintenanceCategoryDialog