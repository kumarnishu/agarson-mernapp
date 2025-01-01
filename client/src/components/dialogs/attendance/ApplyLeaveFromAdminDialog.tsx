import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import { GetSalesmanAttendanceReportDto } from '../../../dtos/leave.dto';
import ApplyLeaveFromAdminForm from '../../forms/attendance/ApplyLeaveFromAdminForm';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    leavedata: GetSalesmanAttendanceReportDto,
}
function ApplyLeaveFromAdminDialog({ leavedata, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "ApplyLeaveFromAdminDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Consume leave - CL/FL/Sunday Working
            </DialogTitle>

            <DialogContent>
                <ApplyLeaveFromAdminForm setDialog={
                    setDialog
                } leavedata={leavedata} />
            </DialogContent>
        </Dialog >

    )
}

export default ApplyLeaveFromAdminDialog
