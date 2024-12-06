import { Dialog, DialogContent, IconButton, Stack } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { GetSpareDyeDto } from '../../../dtos/spare-dye.dto';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    spare_dye: GetSpareDyeDto
}
function ViewSpareDyePhotoDialog({ spare_dye, dialog, setDialog }: Props) {
    
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "ViewSpareDyePhotoDialog"}
                onClose={() => setDialog(undefined)}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogContent>
                    <Stack justifyContent={'center'}>
                        <img width={350} src={spare_dye.dye_photo} alt="shoe photo" />
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ViewSpareDyePhotoDialog







