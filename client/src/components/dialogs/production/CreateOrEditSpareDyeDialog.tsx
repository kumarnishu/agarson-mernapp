import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import CreateOrEditSpareDyeForm from '../../forms/production/CreateOrEditSpareDyeForm';
import { GetSpareDyeDto } from '../../../dtos/spare-dye.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    sparedye?: GetSpareDyeDto
}
function CreateOrEditSpareDyeDialog({ sparedye, dialog, setDialog }: Props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditSpareDyeDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">

                {!sparedye ? "Create Spare Dye" : "Update Spare Dye"}

            </DialogTitle>

            <DialogContent>
                <CreateOrEditSpareDyeForm sparedye={sparedye} />

            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditSpareDyeDialog
