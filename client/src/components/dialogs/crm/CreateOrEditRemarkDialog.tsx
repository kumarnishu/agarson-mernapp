import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditRemarkForm from '../../forms/crm/CreateOrEditRemarkForm'
import { GetRemarksDto } from '../../../dtos/crm-remarks.dto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    lead?: {
        _id: string;
        has_card?: boolean;
        stage: string
    }, remark?: GetRemarksDto,
}
function CreateOrEditRemarkDialog({ lead, remark, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditRemarkDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                <CreateOrEditRemarkForm lead={lead} remark={remark} setDisplay2={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditRemarkDialog