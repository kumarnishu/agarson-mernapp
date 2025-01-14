import { Button, CircularProgress, Dialog, DialogTitle, IconButton, Stack } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import { AttendanceService } from '../../../services/AttendanceService';
import { useMutation } from 'react-query';
import { AxiosResponse } from 'axios';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { useContext } from 'react';
import { AlertContext } from '../../../contexts/alertContext';
import { GetLeaveDto } from '../../../dtos/response/AttendanceDto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    leavedata: GetLeaveDto,

}
function ApproveOrRejectLeaveDialog({ leavedata, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading } = useMutation
        <AxiosResponse<GetLeaveDto>, BackendError, {
            body: { status: string }, id: string
        }>
        (new AttendanceService().ApproveOrRejectLeave, {

            onSuccess: () => {
                queryClient.refetchQueries('leaves')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "ApproveOrRejectLeaveDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Approve/Reject
            </DialogTitle>

            <Stack
                direction="row"
                gap={2}
                padding={2}
                width="100%"
            >
                <Button fullWidth variant="outlined" color="error"
                    onClick={() => {
                        mutate({ body: { status: 'rejected' }, id: leavedata._id })
                        setDialog(undefined)
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Reject"}
                </Button>
                <Button fullWidth variant="contained" color="info"
                    onClick={() => {
                        mutate({ body: { status: 'approved' }, id: leavedata._id })
                        setDialog(undefined)
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Approve"}
                </Button>
            </Stack >
        </Dialog >
    )
}

export default ApproveOrRejectLeaveDialog
