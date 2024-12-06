import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import ResetPasswordSendMailForm from '../../forms/user/ResetPasswordSendMailForm'
import { Cancel } from '@mui/icons-material'


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function ResetPasswordSendMailDialog({ dialog, setDialog }: Props) {
   
    return (
        <Dialog open={dialog === 'ResetPasswordSendMailDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">Reset Password  </DialogTitle>
            <DialogContent>
                <ResetPasswordSendMailForm setDialog={setDialog}/>
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

export default ResetPasswordSendMailDialog