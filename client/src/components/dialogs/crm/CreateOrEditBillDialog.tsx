import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { GetBillDto, GetLeadDto, GetReferDto } from '../../../dtos'
import CreateOrEditBillForm from '../../forms/crm/CreateOrEditBillForm'

function CreateOrEditBillDialog({ lead, refer, setDisplay, bill, display }: { lead?: GetLeadDto, refer?: GetReferDto, bill?: GetBillDto, display?: boolean, setDisplay?: React.Dispatch<React.SetStateAction<boolean>> }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.create_or_edit_bill || display ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                !bill && !display && setChoice({ type: LeadChoiceActions.close_lead })
                setDisplay && setDisplay(false)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!bill ? "New Bill" : "Edit Bill"}</DialogTitle>
            <DialogContent>
                {bill && display && <CreateOrEditBillForm lead={lead} refer={refer} bill={bill} setDisplay2={setDisplay} />}
                {!bill && !display && <CreateOrEditBillForm lead={lead} refer={refer} bill={bill} />}
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditBillDialog