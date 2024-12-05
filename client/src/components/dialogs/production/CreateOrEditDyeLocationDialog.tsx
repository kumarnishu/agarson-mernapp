import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ProductionChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditDyeLocationForm from '../../forms/production/CreateOrEditDyeLocationForm'
import { GetDyeLocationDto } from '../../../dtos/dye-location.dto'

function CreateOrEditDyeLocationDialog({ location }: { location?: GetDyeLocationDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === ProductionChoiceActions.create_or_edit_location ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: ProductionChoiceActions.close_production })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!location ? "New Location" : "Edit Location"}</DialogTitle>
            <DialogContent>
                <CreateOrEditDyeLocationForm location={location} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditDyeLocationDialog