import { Dialog, DialogContent, DialogTitle, Stack, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';

import CreateOrEditDyeForm from '../../forms/production/CreateOrEditDyeForm';
import { GetDyeDto } from '../../../dtos/dye.dto';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    dye?: GetDyeDto
}

function CreateOrEditDyeDialog({ dye, setDialog, dialog }: Props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditDyeDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {dye ? "Update Dye" : "Create Dye"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditDyeForm dye={dye} />
            </DialogContent>
            <Stack
                direction="column"
                gap={2}
                padding={2}
                width="100%"
            >
            </Stack >
        </Dialog >
    )
}

export default CreateOrEditDyeDialog
