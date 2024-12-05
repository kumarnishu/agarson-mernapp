import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditCityForm from '../../forms/crm/CreateOrEditCityForm'
import { CreateOrEditCrmCity } from '../../../dtos/crm-city.dto'

function CreateOrEditCityDialog({ city }: { city?: CreateOrEditCrmCity }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.create_or_edit_city ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: LeadChoiceActions.close_lead })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!city ? "New City" : "Edit City "}</DialogTitle>
            <DialogContent>
                <CreateOrEditCityForm city={city} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditCityDialog