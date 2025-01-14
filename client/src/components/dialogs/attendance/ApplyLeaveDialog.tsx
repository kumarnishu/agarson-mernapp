import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import ApplyLeaveForm from '../../forms/attendance/ApplyLeaveForm';
import { GetSalesmanAttendanceReportDto } from '../../../dtos/AttendanceDto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    leavedata: GetSalesmanAttendanceReportDto,

}
function ApplyLeaveDialog({ leavedata, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "ApplyLeaveDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
               Consume leave - SL
            </DialogTitle>

            <DialogContent>
                <ApplyLeaveForm setDialog={
                    setDialog
                } leavedata={leavedata} />
            </DialogContent>
        </Dialog >
    )
}

export default ApplyLeaveDialog
