import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import SignUpForm from '../../forms/user/SignUpForm';
import { Cancel } from '@mui/icons-material';

type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}

function SignUpDialog({ dialog, setDialog }: Props) {
  return (
    <>
      <Dialog open={dialog === "SignUpDialog"}
        onClose={() => setDialog(undefined)}
        scroll="paper"
      >
        <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
          <Cancel fontSize='large' />
        </IconButton>

        <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Owner Signup Form</DialogTitle>
        <DialogContent>
          <SignUpForm setDialog={setDialog}/>
        </DialogContent>
      
      </Dialog>
    </>
  )
}

export default SignUpDialog