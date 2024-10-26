import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { useContext } from 'react';
import { ChoiceContext, MaintenanceChoiceActions,  } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import { GetMaintenanceDto } from '../../../dtos/maintenance/maintenance.dto';
import CreateOrEditMaintenanceForm from '../../forms/maintenance/CreateOrEditMaintenanceForm';


function CreateOrEditMaintenanceDialog({ maintenance, setMaintenance }: { maintenance?: GetMaintenanceDto, setMaintenance: React.Dispatch<React.SetStateAction<GetMaintenanceDto | undefined>> }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === MaintenanceChoiceActions.create_or_edit_maintenance ? true : false}
                onClose={() => {
                    setChoice({ type: MaintenanceChoiceActions.close_maintenance })
                    setMaintenance(undefined)
                }}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                    setChoice({ type: MaintenanceChoiceActions.close_maintenance })
                    setMaintenance(undefined)
                }}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}> {!maintenance ? "New Checklist" : "Edit Checklist"}
                </DialogTitle>
                <DialogContent>
                    <CreateOrEditMaintenanceForm maintenance={maintenance} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateOrEditMaintenanceDialog