import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditBillForm from '../../forms/crm/CreateOrEditBillForm'
import { GetBillDto } from '../../../dtos/crm-bill.dto'
import { GetLeadDto } from '../../../dtos/lead.dto'
import { GetReferDto } from '../../../dtos/refer.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    lead?: GetLeadDto, refer?: GetReferDto, bill?: GetBillDto
}
function CreateOrEditBillDialog({ lead, refer, bill, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog == 'CreateOrEditBillDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!bill ? "New Bill" : "Edit Bill"}</DialogTitle>
            <DialogContent>
            <CreateOrEditBillForm setDialog={
                    setDialog
                } lead={lead} refer={refer} bill={bill}/>
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditBillDialog