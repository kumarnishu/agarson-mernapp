import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditLeadStageForm from '../../forms/crm/CreateOrEditLeadStageForm'
import { DropDownDto } from '../../../dtos'

function CreateOrEditStageDialog({ stage }: { stage?: DropDownDto}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.create_or_edit_stage  ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: LeadChoiceActions.close_lead })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!stage ?"New Stage":"Edit Stage"}</DialogTitle>
            <DialogContent>
                <CreateOrEditLeadStageForm stage={stage} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditStageDialog