import { Dialog, DialogContent, DialogTitle,  DialogActions, Typography, IconButton } from '@mui/material';
import { useContext} from 'react';
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import NewUserForm from '../../forms/user/NewUserForm';
import { Cancel } from '@mui/icons-material';
type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function NewUserDialog() {
  const { choice, setChoice } = useContext(ChoiceContext)
  return (
    <Dialog open={choice === UserChoiceActions.new_user ? true : false} onClose={() => setChoice({ type: UserChoiceActions.close_user })}
      scroll="paper"
    >
      <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
        <Cancel fontSize='large' />
      </IconButton>
      
      <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>New User Form</DialogTitle>
      <DialogContent>
        <NewUserForm />
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