import { Dialog, DialogContent, DialogTitle, Stack, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import CreateOrEditProductionForm from '../../forms/production/CreateOrEditProductionForm.tsx';
import { GetProductionDto } from '../../../dtos/production.dto.ts';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    production?: GetProductionDto
}
function CreateOrEditProductionDialog({ production, dialog, setDialog }: Props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditProductionDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {production ? "Update Production" : "New Production"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditProductionForm setDialog={
                    setDialog
                }production={production} />
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

export default CreateOrEditProductionDialog
