import { Dialog, DialogTitle, DialogContent, IconButton, Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ChoiceContext, CheckListChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { BulkDeleteChecklists } from '../../../services/CheckListServices';
import { queryClient } from '../../../main';

function BulkDeleteCheckListDialog({ ids, clearIds }: { ids: string[],clearIds:()=>any }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { ids: string[] }>
        (BulkDeleteChecklists, {
            onSuccess: () => {
                queryClient.invalidateQueries('checklists')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: CheckListChoiceActions.close_checklist })
    }, [setChoice, isSuccess])

    return (
        <>
            <Dialog fullWidth open={choice === CheckListChoiceActions.bulk_delete_checklist ? true : false}
                onClose={() => setChoice({ type: CheckListChoiceActions.close_checklist })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                    
                    setChoice({ type: CheckListChoiceActions.close_checklist })
                    clearIds();
                }
                }>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Delete Selected CheckList
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" deleted selected checklist" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will delete  ${ids.length} checklists`}

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
                            mutate({ ids: ids })
                            clearIds();
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

export default BulkDeleteCheckListDialog