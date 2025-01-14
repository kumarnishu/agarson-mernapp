import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditStateForm from '../../forms/authorization/CreateOrEditStateForm'
import { GetCrmStateDto } from '../../../dtos/response/AuthorizationDto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    state?: GetCrmStateDto
}
function CreateOrEditCrmStateDialog({ state, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog == 'CreateOrEditStateDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!state ? "New State" : "Edit State"}</DialogTitle>
            <DialogContent>
                <CreateOrEditStateForm setDialog={
                    setDialog
                }state={state} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditCrmStateDialog