import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditSalesAttendanceForm from '../../forms/sales/CreateOrEditSalesAttendanceForm'
import { GetSalesAttendanceDto } from '../../../dtos/SalesDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    attendance?: GetSalesAttendanceDto,
}

function CreateOrEditSalesmanAttendanceDialog({ attendance, dialog, setDialog }: Props) {
   
     return (
        <Dialog
            open={dialog === "CreateOrEditSalesmanAttendanceDialog"}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!attendance ? "New Attendance" : "Edit Attendance"}</DialogTitle>
            <DialogContent>
                <CreateOrEditSalesAttendanceForm setDialog={setDialog}attendance={attendance} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditSalesmanAttendanceDialog