import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import CreateOrEditMachineForm from '../../forms/production/CreateOrEditMachineForm';
import { GetMachineDto } from '../../../dtos/machine.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    machine?: GetMachineDto
}
function CreateOrEditMachineDialog({ machine, dialog, setDialog }: Props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditMachineDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {machine ? "Update Machine" : "Create Machine"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditMachineForm setDialog={
                    setDialog
                }machine={machine} />
            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditMachineDialog
