import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditKeyCategoryForm from '../../forms/authorization/CreateOrEditKeyCategoryForm'
import { GetKeyCategoryDto } from '../../../dtos/response/AuthorizationDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    category?: GetKeyCategoryDto
}
function CreateOrEditKeyCategoryDialog({ category, dialog, setDialog }: Props) {
  
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog == 'CreateOrEditKeyCategoryDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!category ? "New Category" : "Edit Category"}</DialogTitle>
            <DialogContent>
                <CreateOrEditKeyCategoryForm setDialog={
                    setDialog
                }category={category} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditKeyCategoryDialog