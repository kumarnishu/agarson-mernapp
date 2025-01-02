import { Dialog, DialogContent, DialogTitle, IconButton, Stack } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { DownloadFile } from '../../../utils/DownloadFile';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    url: string
}
function ViewLeaveDocumentDialog({ url, dialog, setDialog }: Props) {

    return (
        <>
            <Dialog fullScreen open={dialog == "ViewLeaveDocumentDialog"}
                onClose={() => {
                    setDialog(undefined)
                }}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Document</DialogTitle>
                <DialogContent>
                    <Stack justifyContent={'center'}
                        onDoubleClick={() => {
                            if (url !== "") {
                                DownloadFile(url, 'Leave Document.jpeg')
                            }
                        }}>
                        <iframe src={url} height={600} />
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ViewLeaveDocumentDialog







