import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditLeadTypeForm from '../../forms/dropdown/CreateOrEditLeadTypeForm'
import { DropDownDto } from '../../../dtos/response/DropDownDto'


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    type?: DropDownDto
}
function CreateOrEditLeadTypeDialog({ type, dialog, setDialog }: Props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditLeadTypeDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!type ? "New Lead Type" : "Edit Lead Type"}</DialogTitle>
            <DialogContent>
                <CreateOrEditLeadTypeForm setDialog={
                    setDialog
                }  type={type} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditLeadTypeDialog