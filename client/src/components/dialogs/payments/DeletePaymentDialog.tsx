import { Dialog, DialogTitle, DialogContent, IconButton,  Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ChoiceContext, PaymentsChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { DeletePayment } from '../../../services/PaymentsService';
import { GetChecklistDto } from '../../../dtos/checklist.dto';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function DeletePaymentDialog({ payment }: { payment: GetChecklistDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (DeletePayment, {
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
            <Dialog fullWidth open={choice === PaymentsChoiceActions.delete_payment ? true : false}
                onClose={() => setChoice({ type: PaymentsChoiceActions.close_payment })}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: PaymentsChoiceActions.close_payment })}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Delete Payment
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" deleted payment" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will delete  ${payment.work_title}`}

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
                            setChoice({ type: PaymentsChoiceActions.delete_payment })
                            mutate(payment._id)
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Delete Payment"}
                    </Button>
                </Stack >
            </Dialog>
        </>
    )
}

export default DeletePaymentDialog