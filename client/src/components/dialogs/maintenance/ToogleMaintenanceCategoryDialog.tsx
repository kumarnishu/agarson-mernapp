import { Dialog, DialogTitle, DialogContent, IconButton,  Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ChoiceContext, CheckListChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import {  DeleteChecklistCategory } from '../../../services/CheckListServices';
import { queryClient } from '../../../main';
import { DropDownDto } from '../../../dtos/common/dropdown.dto';

function ToogleMaintenanceCategoryDialog({ category }: { category: DropDownDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (DeleteChecklistCategory, {
            onSuccess: () => {
                queryClient.invalidateQueries('check_categories')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: CheckListChoiceActions.close_checklist })
    }, [setChoice, isSuccess])

    return (
        <>
            <Dialog fullWidth open={choice === CheckListChoiceActions.delete_checklist_category ? true : false}
                onClose={() => setChoice({ type: CheckListChoiceActions.close_checklist })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: CheckListChoiceActions.close_checklist })}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Delete Category
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" deleted checklist category" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will delete  ${category.label}`}

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
                            setChoice({ type: CheckListChoiceActions.delete_checklist })
                            mutate(category.id)
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Delete Category"}
                    </Button>
                </Stack >
            </Dialog>
        </>
    )
}

export default ToogleMaintenanceCategoryDialog