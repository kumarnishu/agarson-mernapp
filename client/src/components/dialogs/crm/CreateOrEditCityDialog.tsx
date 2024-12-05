import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditCityForm from '../../forms/crm/CreateOrEditCityForm'
import { CreateOrEditCrmCity } from '../../../dtos/crm-city.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    city?: CreateOrEditCrmCity
}
function CreateOrEditCityDialog({ city, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditCityDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!city ? "New City" : "Edit City "}</DialogTitle>
            <DialogContent>
                <CreateOrEditCityForm setDialog={
                    setDialog
                } city={city} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditCityDialog