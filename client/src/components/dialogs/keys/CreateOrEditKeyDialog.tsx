import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, KeyChoiceActions } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { GetKeyDto } from '../../../dtos'
import CreateOrEditKeyForm from '../../forms/keys/CreateOrEditKeyForm'

function CreateOrEditKeyDialog({ keyitm }: { keyitm?: GetKeyDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === KeyChoiceActions.create_or_edit_key ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: KeyChoiceActions.close_key })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!keyitm ? "New Key" : "Edit Key"}</DialogTitle>
            <DialogContent>
                <CreateOrEditKeyForm keyitm={keyitm} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditKeyDialog