import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditAgeingRemarkForm from '../../forms/sales/CreateOrEditAgeingRemarkForm'
import { GetAgeingRemarkDto } from '../../../dtos/SalesDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string,
    remark?: GetAgeingRemarkDto
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
                <CreateOrEditAgeingRemarkForm party={party} remark={remark} setDialog={setDialog} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditPartyRemarkDialog