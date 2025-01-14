import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditKeyForm from '../../forms/authorization/CreateOrEditKeyForm'
import { GetKeyDto } from '../../../dtos/AuthorizationDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    keyitm?: GetKeyDto
}
function CreateOrEditKeyDialog({ keyitm, dialog, setDialog }: Props) {
    
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditKeyDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!keyitm ? "New Key" : "Edit Key"}</DialogTitle>
            <DialogContent>
                <CreateOrEditKeyForm setDialog={
                    setDialog
                }keyitm={keyitm} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditKeyDialog