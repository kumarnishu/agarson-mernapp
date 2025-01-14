import { Dialog, DialogContent, CircularProgress, IconButton, DialogTitle } from '@mui/material'
import ReferLeadForm from '../../forms/crm/ReferLeadForm'
import { Cancel } from '@mui/icons-material'
import { GetLeadDto } from '../../../dtos/response/CrmDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    lead: GetLeadDto
}
function ReferLeadDialog({ lead, dialog, setDialog }: Props) {
   

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === "ReferLeadDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ textAlign: 'center', minWidth: '350px' }}>Refer Lead</DialogTitle>
            <DialogContent>
                {lead ?
                    < ReferLeadForm setDialog={
                        setDialog
                    }lead={lead} />
                    : <CircularProgress size="large" />
                }
            </DialogContent>
        </Dialog>
    )
}

export default ReferLeadDialog