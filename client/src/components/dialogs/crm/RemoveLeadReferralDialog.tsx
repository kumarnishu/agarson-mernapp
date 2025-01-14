import { Dialog, DialogContent, DialogTitle, Typography, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import RemoveLeadReferForm from '../../forms/crm/RemoveLeadReferForm';
import { GetLeadDto } from '../../../dtos/CrmDto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    lead: GetLeadDto
}
function RemoveLeadReferralDialog({ lead, dialog, setDialog }: Props) {
 
    return (
        <Dialog open={dialog === "RemoveLeadReferralDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Remove Refer from lead
            </DialogTitle>


            <DialogContent>
                <Typography variant="body1" color="error">
                    {`Warning ! This will remove refreral from  ${lead.name}`}

                </Typography>
                <RemoveLeadReferForm setDialog={
                    setDialog
                }lead={lead} />
            </DialogContent>
        </Dialog >
    )
}

export default RemoveLeadReferralDialog
