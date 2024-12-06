import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import CreateOrEditReferForm from '../../forms/crm/CreateOrEditReferForm';
import { GetReferDto } from '../../../dtos/refer.dto';


type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
  refer?: GetReferDto
}
function CreateOrEditReferDialog({ refer, dialog, setDialog }: Props) {
  
  return (
    <>
      <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === 'CreateOrEditReferDialog'}
      >
        <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
          setDialog(undefined)
        }}>
          <Cancel fontSize='large' />
        </IconButton>
        <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{refer ? 'Update Refer' : 'New Refer'}</DialogTitle>
        <DialogContent>
          <CreateOrEditReferForm setDialog={
                    setDialog
                }  refer={refer} />

        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateOrEditReferDialog