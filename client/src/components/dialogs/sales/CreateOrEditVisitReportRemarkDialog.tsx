import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditVisitReportRemarkForm from '../../forms/sales/CreateOrEditVisitReportRemarkForm'
import { GetVisitSummaryReportRemarkDto } from '../../../dtos/SalesDto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    employee: string,
    visit_date: string, remark?: GetVisitSummaryReportRemarkDto,
}
function CreateOrEditVisitReportRemarkDialog({ employee, visit_date, remark, dialog, setDialog }: Props) {
    
     return (
        <Dialog
            open={dialog === "CreateOrEditVisitReportRemarkDialog"}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
              setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
            <CreateOrEditVisitReportRemarkForm employee={employee} remark={remark} visit_date={visit_date} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditVisitReportRemarkDialog