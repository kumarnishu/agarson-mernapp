import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, KeyChoiceActions } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { GetExcelDBRemarksDto } from '../../../dtos'
import CreateOrEditExcelDBRemarkForm from '../../forms/exceldb/CreateOrEditExcelDBRemarkForm'

function CreateOrEditExcelDBRemarkDialog({ category, obj, remark, display, setDisplay }: {
    obj: string,
    category: string, remark?: GetExcelDBRemarksDto, display?: boolean, setDisplay?: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const { choice, setChoice } = useContext(ChoiceContext)
    console.log(category, obj)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === KeyChoiceActions.create_or_edit_excel_db_remark || display ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                !remark && !display && setChoice({ type: KeyChoiceActions.close_key })
                setDisplay && setDisplay(false)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!remark ? "New Remark" : "Edit Remark"}</DialogTitle>
            <DialogContent>
                {remark && display && category && obj && <CreateOrEditExcelDBRemarkForm category={category} remark={remark} obj={obj} setDisplay={setDisplay} />}
                {!remark && !display && category && obj && <CreateOrEditExcelDBRemarkForm obj={obj} category={category}  setDisplay={setDisplay} />}
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditExcelDBRemarkDialog