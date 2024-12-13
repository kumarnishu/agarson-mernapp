import { Dialog, DialogContent, IconButton, Stack } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { GetDriverSystemDto } from '../../../dtos/driver.dto';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    item: GetDriverSystemDto
}
function ViewDriverSystemPhotoDialog({ item, dialog, setDialog }: Props) {
    
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "ViewDriverSystemPhotoDialog" }
                onClose={() => setDialog(undefined)}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogContent>
                    <Stack justifyContent={'center'}>
                        <img width={350} src={item.photo} alt="shoe photo" />
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ViewDriverSystemPhotoDialog







