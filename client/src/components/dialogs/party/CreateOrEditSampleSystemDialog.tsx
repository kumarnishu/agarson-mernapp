import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditSampleSystemForm from '../../forms/party/CreateOrEditSampleSystemForm'
import { GetSampleSystemDto } from '../../../dtos/PartyPageDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    sample?: GetSampleSystemDto
}
function CreateOrEditSampleSystemDialog({ sample, dialog, setDialog }: Props) {
    return (
        <Dialog
            open={dialog === "CreateOrEditSampleSystemDialog"}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!sample ? "New Sample" : "Edit Sample"}</DialogTitle>
            <DialogContent>
                 <CreateOrEditSampleSystemForm sample={sample} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditSampleSystemDialog