import { Dialog, DialogContent, DialogTitle, Typography, Stack, IconButton } from '@mui/material';
import { useContext } from 'react';
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import SignUpForm from '../../forms/user/SignUpForm';
import { Cancel } from '@mui/icons-material';

type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}
function SignUpDialog({ dialog, setDialog }: Props) {
  const { choice, setChoice } = useContext(ChoiceContext)
  return (
    <>
      <Dialog open={choice === UserChoiceActions.signup ? true : false}
        onClose={() => setChoice({ type: UserChoiceActions.close_user })}
        scroll="paper"
      >
        <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
          <Cancel fontSize='large' />
        </IconButton>

        <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Owner Signup Form</DialogTitle>
        <DialogContent>
          <SignUpForm />
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
            onClick={() => setChoice({ type: UserChoiceActions.close_user })}
          >
            <b>Close</b>
          </Typography >
          {" or "}
          <Typography
            variant="body1"
            sx={{ cursor: "pointer" }}
            component="span"
            onClick={() => setChoice({ type: UserChoiceActions.reset_password_mail })}
          >
            Forgot Password
          </Typography >

        </Stack>
      </Dialog>
    </>
  )
}

export default SignUpDialog