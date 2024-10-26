import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { useContext } from 'react';
import { ChoiceContext, CheckListChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';

import { GetChecklistDto } from '../../../dtos/checklist/checklist.dto';
import CreateorEditCheckListForm from '../../forms/checklists/CreateorEditCheckListForm';

function CreateOrEditMaintenanceDialog({ checklist, setChecklist }: { checklist?: GetChecklistDto, setChecklist: React.Dispatch<React.SetStateAction<GetChecklistDto | undefined>> }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === CheckListChoiceActions.create_or_edit_checklist ? true : false}
                onClose={() => {
                    setChoice({ type: CheckListChoiceActions.close_checklist })
                    setChecklist(undefined)
                }}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                    setChoice({ type: CheckListChoiceActions.close_checklist })
                    setChecklist(undefined)
                }}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}> {!checklist ? "New Checklist" : "Edit Checklist"}
                </DialogTitle>
                <DialogContent>
                    <CreateorEditCheckListForm checklist={checklist} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateOrEditMaintenanceDialog