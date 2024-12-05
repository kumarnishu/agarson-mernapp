import { Dialog, DialogContent,  CircularProgress, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import ReferLeadForm from '../../forms/crm/ReferLeadForm'
import { Cancel } from '@mui/icons-material'
import { GetLeadDto } from '../../../dtos/lead.dto'

function ReferLeadDialog({ lead }: { lead: GetLeadDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.refer_lead ? true : false}
            onClose={() => setChoice({ type: LeadChoiceActions.close_lead })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: LeadChoiceActions.close_lead })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ textAlign: 'center', minWidth: '350px' }}>Refer Lead</DialogTitle>
            <DialogContent>
                {lead ?
                    < ReferLeadForm lead={lead} />
                    : <CircularProgress size="large" />
                }
            </DialogContent>
        </Dialog>
    )
}

export default ReferLeadDialog