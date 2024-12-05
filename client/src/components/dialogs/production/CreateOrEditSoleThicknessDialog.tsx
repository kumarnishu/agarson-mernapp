import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import CreateOrEditSoleThicknessForm from '../../forms/production/CreateOrEditSoleThicknessForm.tsx';
import { GetSoleThicknessDto } from '../../../dtos/sole-thickness.dto.ts';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    thickness?: GetSoleThicknessDto
}


function CreateOrEditSoleThicknessDialog({ thickness, dialog, setDialog }: Props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditSoleThicknessDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {thickness ? "Update thickness" : "New thickness"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditSoleThicknessForm thickness={thickness} />
            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditSoleThicknessDialog
