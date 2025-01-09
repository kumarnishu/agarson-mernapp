import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import { GetAgeingRemarkDto } from '../../../dtos/sales.dto'
import CreateOrEditAgeingRemarkForm from '../../forms/sales/CreateOrEditAgeingRemarkForm'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string,
    remark?: GetAgeingRemarkDto
}
function CreateOrEditAgeingRemarkDialog({ party, remark, dialog, setDialog }: Props) {

    return (
        <Dialog
            open={dialog === "CreateOrEditAgeingRemarkDialog"}
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

export default CreateOrEditAgeingRemarkDialog