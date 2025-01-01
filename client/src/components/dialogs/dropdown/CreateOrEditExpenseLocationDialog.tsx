import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditExpenseLocationForm from '../../forms/dropdown/CreateOrEditExpenseLocationForm'
import { DropDownDto } from '../../../dtos/dropdown.dto'


type props = {
    location?: DropDownDto,
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function CreateOrEditExpenseLocationDialog({ location,dialog,setDialog }: props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog ==='CreateOrEditExpenseLocationDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!location ? "New Location" : "Edit Location"}</DialogTitle>
            <DialogContent>
                <CreateOrEditExpenseLocationForm location={location}dialog={dialog} setDialog={setDialog}  />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditExpenseLocationDialog