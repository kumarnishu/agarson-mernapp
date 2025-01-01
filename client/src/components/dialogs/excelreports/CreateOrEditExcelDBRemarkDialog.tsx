import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditExcelDBRemarkForm from '../../forms/excelreports/CreateOrEditExcelDBRemarkForm'
import { GetExcelDBRemarksDto } from '../../../dtos/excel-db-remark.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    obj: string,
    category: string, remark?: GetExcelDBRemarksDto,
}
function CreateOrEditExcelDBRemarkDialog({ category, obj, remark, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditExcelDBRemarkDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                <CreateOrEditExcelDBRemarkForm category={category} remark={remark} obj={obj} setDialog={
                    setDialog
                } />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditExcelDBRemarkDialog