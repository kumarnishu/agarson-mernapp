import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, SaleChoiceActions, } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { GetSalesAttendanceDto } from '../../../dtos'
import CreateOrEditSalesAttendanceForm from '../../forms/sales/CreateOrEditSalesAttendanceForm'

function CreateOrEditSalesmanAttendanceDialog({ attendance }: {
    attendance?: GetSalesAttendanceDto,
}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog
            open={choice === SaleChoiceActions.create_or_edit_sale_attendance ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: SaleChoiceActions.close_sale })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!attendance ? "New Attendance" : "Edit Attendance"}</DialogTitle>
            <DialogContent>
                <CreateOrEditSalesAttendanceForm attendance={attendance} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditSalesmanAttendanceDialog