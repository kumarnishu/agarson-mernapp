import { Dialog, DialogContent, IconButton, Stack } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { GetShoeWeightDto } from '../../../dtos/ProductionDto';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    weight: GetShoeWeightDto
}
function ViewShoeWeightPhotoDialog({ weight, dialog, setDialog }: Props) {
    
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "ViewShoeWeightPhotoDialog" || dialog === "ViewShoeWeightPhotoDialog2" || dialog === "ViewShoeWeightPhotoDialog3"}
                onClose={() => setDialog(undefined)}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogContent>
                    <Stack justifyContent={'center'}>
                        {dialog === "ViewShoeWeightPhotoDialog" && <img width={350} src={weight.shoe_photo1} alt="shoe photo" />}
                        {dialog === "ViewShoeWeightPhotoDialog2" && <img width={350} src={weight.shoe_photo2} alt="shoe photo2" />}
                        {dialog === "ViewShoeWeightPhotoDialog3" && <img width={350} src={weight.shoe_photo3} alt="shoe photo3" />}
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ViewShoeWeightPhotoDialog







