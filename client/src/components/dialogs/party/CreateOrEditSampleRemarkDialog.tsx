import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditSampleSystemRemarkForm from '../../forms/party/CreateOrEditSampleSystemRemarkForm'
import { GetSampleSystemRemarkDto } from '../../../dtos/RemarkDto'
import { GetSampleSystemDto } from '../../../dtos/PartyPageDto'

type Props = {
    dialog: string | undefined,
    sample: GetSampleSystemDto,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    remark?: GetSampleSystemRemarkDto
}
function CreateOrEditSampleRemarkDialog({ remark,sample, dialog, setDialog }: Props) {
    return (
        <Dialog
            open={dialog === "CreateOrEditSampleRemarkDialog"}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                <CreateOrEditSampleSystemRemarkForm sample={sample} remark={remark} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditSampleRemarkDialog