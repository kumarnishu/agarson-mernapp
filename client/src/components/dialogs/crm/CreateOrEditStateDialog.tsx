import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditStateForm from '../../forms/crm/CreateOrEditStateForm'
import { GetCrmStateDto } from '../../../dtos/crm-state.dto'

function CreateOrEditCrmStateDialog({ state }: { state?: GetCrmStateDto}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.create_or_edit_state  ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: LeadChoiceActions.close_lead })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!state ?"New State":"Edit State"}</DialogTitle>
            <DialogContent>
                <CreateOrEditStateForm state={state} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditCrmStateDialog