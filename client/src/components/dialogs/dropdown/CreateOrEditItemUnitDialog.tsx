import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditItemUnitForm from '../../forms/dropdown/CreateOrEditItemUnitForm'
import { DropDownDto } from '../../../dtos/dropdown.dto'


type props = {
    unit?: DropDownDto,
    dialog: string | undefined
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function CreateOrEditItemUnitDialog({ unit, dialog, setDialog }: props) {
   
     return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditItemUnitDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!unit ? "New Unit" : "Edit Unit"}</DialogTitle>
            <DialogContent>
                <CreateOrEditItemUnitForm unit={unit} dialog={dialog} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditItemUnitDialog 