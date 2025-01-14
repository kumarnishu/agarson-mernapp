import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Cancel } from '@mui/icons-material';

import CreateorEditCheckListForm from '../../forms/checklists/CreateorEditCheckListForm';
import { GetChecklistDto } from '../../../dtos/response/ChecklistDto';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    checklist?: GetChecklistDto, setChecklist: React.Dispatch<React.SetStateAction<GetChecklistDto | undefined>>
}
function CreateOrEditCheckListDialog({ checklist, setChecklist, dialog, setDialog }: Props) {
   
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === 'CreateOrEditCheckListDialog'}

            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                    setDialog(undefined)
                    setChecklist(undefined)
                }}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}> {!checklist ? "New Checklist" : "Edit Checklist"}
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <CreateorEditCheckListForm setDialog={
                    setDialog
                } checklist={checklist} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateOrEditCheckListDialog