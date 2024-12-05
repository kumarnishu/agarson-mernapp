import { Dialog, DialogTitle, DialogContent, IconButton, Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { ChoiceContext, PaymentsChoiceActions } from '../../../contexts/dialogContext';
import { BulkDeletePaymentss } from '../../../services/PaymentsService';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function BulkDeletePaymentsDialog({ ids, clearIds }: { ids: string[],clearIds:()=>any }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { ids: string[] }>
        (BulkDeletePaymentss, {
            onSuccess: () => {
                queryClient.invalidateQueries('payments')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: PaymentsChoiceActions.close_payment })
    }, [setChoice, isSuccess])

    return (
        <>
            <Dialog fullWidth open={choice === PaymentsChoiceActions.bulk_delete_payment ? true : false}
                onClose={() => setChoice({ type: PaymentsChoiceActions.close_payment })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                    
                    setChoice({ type: PaymentsChoiceActions.close_payment })
                    clearIds();
                }
                }>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Delete Selected Payment
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" deleted selected payment" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will delete  ${ids.length} payments`}

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

export default BulkDeletePaymentsDialog