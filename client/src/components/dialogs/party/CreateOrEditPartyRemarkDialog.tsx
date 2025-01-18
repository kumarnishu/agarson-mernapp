import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import { GetPartyRemarkDto } from '../../../dtos/PartyPageDto'
import CreateOrEditPartyRemarkForm from '../../forms/party/CreateOrEditPartyRemarkForm'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string,
    remark?: GetPartyRemarkDto
}
function CreateOrEditPartyRemarkDialog({ party, remark, dialog, setDialog }: Props) {

    return (
        <Dialog
            open={dialog === "CreateOrEditPartyRemarkDialog"}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                <CreateOrEditPartyRemarkForm party={party} remark={remark} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditPartyRemarkDialog