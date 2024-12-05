import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditLeadSourceForm from '../../forms/crm/CreateOrEditLeadSourceForm'
import { DropDownDto } from '../../../dtos/dropdown.dto'

function CreateOrEditLeadSourceDialog({ source }: { source?: DropDownDto}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.create_or_edit_source  ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: LeadChoiceActions.close_lead })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!source ?"New Lead Source":"Edit Lead Source"}</DialogTitle>
            <DialogContent>
                <CreateOrEditLeadSourceForm source={source} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditLeadSourceDialog