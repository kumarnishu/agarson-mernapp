import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'

import CreateChecklistRemarkForm from '../../forms/checklists/CreateChecklistRemarkForm'
import { GetChecklistBoxDto, GetChecklistDto } from '../../../dtos/ChecklistDto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    checklist: GetChecklistDto, checklist_box: GetChecklistBoxDto
}
function CreateChecklistRemarkDialogFromAdmin({ checklist, checklist_box, dialog, setDialog }: Props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog == 'CreateChecklistRemarkDialogFromAdmin'}
            onClose={() => {
                setDialog(undefined)
            }
            }
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{ "New Remark" }</DialogTitle>
            <DialogContent>
                { dialog && <CreateChecklistRemarkForm checklist={checklist} checklist_box={checklist_box} setDialog={setDialog} />}
          
            </DialogContent>
        </Dialog>
    )
}

export default CreateChecklistRemarkDialogFromAdmin