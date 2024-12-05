import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditChecklistRemarkForm from '../../forms/checklists/CreateOrEditChecklistRemarkForm'
import { GetChecklistBoxDto } from '../../../dtos/checklist-box.dto'
import { GetChecklistRemarksDto } from '../../../dtos/checklist-remark.dto'
import { GetChecklistDto } from '../../../dtos/checklist.dto'

function CreateOrEditChecklistRemarkDialog({ remark, display, checklist, checklist_box, setDisplay }: { checklist: GetChecklistDto, checklist_box: GetChecklistBoxDto, remark?: GetChecklistRemarksDto, display: boolean, setDisplay?: React.Dispatch<React.SetStateAction<boolean>> }) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={display ? true : false}
            onClose={() => {
                setDisplay && setDisplay(false)
            }
            }
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDisplay && setDisplay(false)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                {remark && display && <CreateOrEditChecklistRemarkForm checklist={checklist} checklist_box={checklist_box} remark={remark} setDisplay={setDisplay} />}
                {!remark && display && <CreateOrEditChecklistRemarkForm checklist={checklist} checklist_box={checklist_box} setDisplay={setDisplay} />}
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditChecklistRemarkDialog