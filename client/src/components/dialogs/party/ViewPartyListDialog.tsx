import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import PartyPage from '../../../pages/sales/PartyPage'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}
function ViewPartyListDialog({ dialog, setDialog }: Props) {
    return (
        <Dialog
            open={dialog === "ViewPartyListDialog"}
            onClose={() => { setDialog(undefined) }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>All Parties</DialogTitle>
            <DialogContent>
                <PartyPage />
            </DialogContent>
        </Dialog>
    )
}

export default ViewPartyListDialog