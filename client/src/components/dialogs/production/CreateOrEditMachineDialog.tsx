import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { useContext } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import CreateOrEditMachineForm from '../../forms/production/CreateOrEditMachineForm';
import { GetMachineDto } from '../../../dtos/machine.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function CreateOrEditMachineDialog({ machine }: { machine?: GetMachineDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === ProductionChoiceActions.create_or_edit_machine ? true : false}
            onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {machine ? "Update Machine" : "Create Machine"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditMachineForm machine={machine} />
            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditMachineDialog
