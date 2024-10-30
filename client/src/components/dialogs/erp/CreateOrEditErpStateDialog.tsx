import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, UserChoiceActions, } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditErpStateForm from '../../forms/erp/CreateOrEditErpStateForm'
import { GetErpStateDto } from '../../../dtos'

function CreateOrEditErpStateDialog({ state }: { state?: GetErpStateDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen
            open={choice === UserChoiceActions.create_or_edit_erpstate ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: UserChoiceActions.close_user })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!state ? "New State" : "Edit State"}</DialogTitle>
            <DialogContent>
                <CreateOrEditErpStateForm state={state} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditErpStateDialog