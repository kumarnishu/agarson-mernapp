import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditLeadTypeForm from '../../forms/crm/CreateOrEditLeadTypeForm'
import { DropDownDto } from '../../../dtos'

function CreateOrEditLeadTypeDialog({ type }: { type?: DropDownDto
}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.create_or_edit_leadtype  ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: LeadChoiceActions.close_lead })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!type ?"New Lead Type":"Edit Lead Type"}</DialogTitle>
            <DialogContent>
                <CreateOrEditLeadTypeForm type={type} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditLeadTypeDialog