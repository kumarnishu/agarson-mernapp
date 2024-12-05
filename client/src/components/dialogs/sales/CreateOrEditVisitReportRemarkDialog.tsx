import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, SaleChoiceActions, } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditVisitReportRemarkForm from '../../forms/sales/CreateOrEditVisitReportRemarkForm'
import { GetVisitSummaryReportRemarkDto } from '../../../dtos/visit_remark.dto'

function CreateOrEditVisitReportRemarkDialog({ employee, visit_date, remark, display, setDisplay }: {
    employee: string,
    visit_date: string, remark?: GetVisitSummaryReportRemarkDto, display?: boolean, setDisplay?: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog 
            open={choice === SaleChoiceActions.create_or_edit_visit_remark || display ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                !remark && !display && setChoice({ type: SaleChoiceActions.close_sale })
                setDisplay && setDisplay(false)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                {remark && display && employee && visit_date && <CreateOrEditVisitReportRemarkForm employee={employee} remark={remark} visit_date={visit_date} setDisplay={setDisplay} />}
                {!remark && !display && employee && visit_date && <CreateOrEditVisitReportRemarkForm visit_date={visit_date} employee={employee} setDisplay={setDisplay} />}
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditVisitReportRemarkDialog