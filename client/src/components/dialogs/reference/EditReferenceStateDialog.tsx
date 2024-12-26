import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import EditReferenceStateForm from '../../forms/reference/EditReferenceStateForm'


type Props = {
    dialog: string | undefined,
    state?: string,
    gst: string,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function EditReferenceStateDialog({ gst, state, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'EditReferenceStateDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{"Edit State"}</DialogTitle>
            <DialogContent>
                <EditReferenceStateForm gst={gst} state={state}  setDialog={
                    setDialog
                } />
            </DialogContent>
        </Dialog>
    )
}

export default EditReferenceStateDialog