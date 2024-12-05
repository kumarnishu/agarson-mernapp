import { Dialog, DialogContent, DialogTitle, DialogActions, Typography, IconButton } from '@mui/material';
import NewUserForm from '../../forms/user/NewUserForm';
import { Cancel } from '@mui/icons-material';

type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function NewUserDialog({ dialog, setDialog }: Props) {
  return (
    <Dialog open={dialog === 'NewUserDialog'} onClose={() => setDialog(undefined)}
      scroll="paper"
    >
      <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
        <Cancel fontSize='large' />
      </IconButton>

      <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>New User Form</DialogTitle>
      <DialogContent>
        <NewUserForm setDialog={setDialog}/>
      </DialogContent>
      <DialogActions>
        <Typography
          variant="button"
          component="p"
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
        </Typography >
      </DialogActions>
    </Dialog>
  )
}

export default NewUserDialog