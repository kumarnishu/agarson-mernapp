import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditChecklistRemarkForm from '../../forms/checklists/CreateOrEditChecklistRemarkForm'
import { GetChecklistDto, GetChecklistBoxDto, GetChecklistRemarksDto } from '../../../dtos/ChecklistDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    checklist: GetChecklistDto, checklist_box: GetChecklistBoxDto, remark?: GetChecklistRemarksDto
}
function CreateOrEditChecklistRemarkDialog({ remark, checklist, checklist_box, dialog, setDialog }: Props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog == 'CreateOrEditChecklistRemarkDialog'}
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
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                {remark && dialog && <CreateOrEditChecklistRemarkForm checklist={checklist} checklist_box={checklist_box} remark={remark} setDialog={setDialog} />}
                {!remark && dialog && <CreateOrEditChecklistRemarkForm checklist={checklist} checklist_box={checklist_box} setDialog={setDialog} />}
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditChecklistRemarkDialog