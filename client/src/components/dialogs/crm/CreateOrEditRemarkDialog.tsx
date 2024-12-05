import { Dialog, DialogContent,  IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditRemarkForm from '../../forms/crm/CreateOrEditRemarkForm'
import { GetRemarksDto } from '../../../dtos/crm-remarks.dto'

function CreateOrEditRemarkDialog({ lead, remark, display, setDisplay }: {
    lead?: {
        _id: string;
        has_card?: boolean;
        stage: string
    }, remark?: GetRemarksDto, display?: boolean, setDisplay?: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.create_or_edt_remark || display ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                !remark && !display && setChoice({ type: LeadChoiceActions.close_lead })
                setDisplay && setDisplay(false)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                {remark && display && <CreateOrEditRemarkForm lead={lead} remark={remark} setDisplay2={setDisplay} />}
                {!remark && !display && <CreateOrEditRemarkForm lead={lead} />}
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditRemarkDialog