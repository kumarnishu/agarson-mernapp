import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import EmailVerifySendMailDialogForm from '../../forms/user/EmailVerifySendMailForm'
import { Cancel } from '@mui/icons-material'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function EmailVerifySendMailDialog({ dialog, setDialog }: Props) {
    return (
        <Dialog open={dialog === 'EmailVerifySendMailDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">Verify Your Email</DialogTitle>
            <DialogContent>
                <EmailVerifySendMailDialogForm setDialog={setDialog} />
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

export default EmailVerifySendMailDialog