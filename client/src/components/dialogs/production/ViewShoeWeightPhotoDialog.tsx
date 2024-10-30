import { Dialog, DialogContent, IconButton, Stack } from '@mui/material';
import { useContext } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import { GetShoeWeightDto } from '../../../dtos';

function ViewShoeWeightPhotoDialog({ weight }: { weight: GetShoeWeightDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === ProductionChoiceActions.view_shoe_photo || choice === ProductionChoiceActions.view_shoe_photo2 || choice === ProductionChoiceActions.view_shoe_photo3}
                onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogContent>
                    <Stack justifyContent={'center'}>
                        {choice === ProductionChoiceActions.view_shoe_photo && <img width={350} src={weight.shoe_photo1} alt="shoe photo" />}
                        {choice === ProductionChoiceActions.view_shoe_photo2 && <img width={350} src={weight.shoe_photo2} alt="shoe photo2" />}
                        {choice === ProductionChoiceActions.view_shoe_photo3 && <img width={350} src={weight.shoe_photo3} alt="shoe photo3" />}
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ViewShoeWeightPhotoDialog







