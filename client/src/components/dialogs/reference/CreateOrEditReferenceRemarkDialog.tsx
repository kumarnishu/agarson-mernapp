import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditReferenceRemarkForm from '../../forms/reference/CreateOrEditReferenceRemarkForm'
import { GetReferenceRemarksDto } from '../../../dtos/references-remark.dto'


type Props = {
    dialog: string | undefined,
    remark?: GetReferenceRemarksDto,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string,
    reference: string,
}
function CreateOrEditReferenceRemarkDialog({ party, reference, remark, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditReferenceRemarkDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                <CreateOrEditReferenceRemarkForm party={party} reference={reference} remark={remark} setDialog={
                    setDialog
                } />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditReferenceRemarkDialog