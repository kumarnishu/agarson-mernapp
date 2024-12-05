import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditLeadSourceForm from '../../forms/crm/CreateOrEditLeadSourceForm'
import { DropDownDto } from '../../../dtos/dropdown.dto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    source?: DropDownDto
}
function CreateOrEditLeadSourceDialog({ source, dialog, setDialog }: Props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog == 'CreateOrEditLeadSourceDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!source ? "New Lead Source" : "Edit Lead Source"}</DialogTitle>
            <DialogContent>
                <CreateOrEditLeadSourceForm setDialog={
                    setDialog
                } source={source} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditLeadSourceDialog