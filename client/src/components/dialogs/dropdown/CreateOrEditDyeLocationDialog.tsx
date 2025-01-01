import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditDyeLocationForm from '../../forms/dropdown/CreateOrEditDyeLocationForm'
import { GetDyeLocationDto } from '../../../dtos/dye-location.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    location?: GetDyeLocationDto
}
function CreateOrEditDyeLocationDialog({ location, dialog, setDialog }: Props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditDyeLocationDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!location ? "New Location" : "Edit Location"}</DialogTitle>
            <DialogContent>
                <CreateOrEditDyeLocationForm setDialog={
                    setDialog
                }location={location} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditDyeLocationDialog