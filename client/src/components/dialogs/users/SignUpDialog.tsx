import { Dialog, DialogContent, DialogTitle, Typography, Stack, IconButton } from '@mui/material';
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
        <Stack
          alignItems="center"
          justifyContent="center"
          gap={1}
          p={1}
          direction={"row"}
          sx={{ backgroundColor: "lightgrey" }}
        >
          <Typography
            variant="body1"
            sx={{ cursor: "pointer" }}
            component="span"
            onClick={() => setDialog(undefined)}
          >
            <b>Close</b>
          </Typography >
          {" or "}
          <Typography
            variant="body1"
            sx={{ cursor: "pointer" }}
            component="span"
          >
            Forgot Password
          </Typography >

        </Stack>
      </Dialog>
    </>
  )
}

export default SignUpDialog