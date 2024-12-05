import { Dialog, DialogContent,  IconButton, Stack } from '@mui/material';
import { useContext } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import { GetSpareDyeDto } from '../../../dtos/spare-dye.dto';

function ViewSpareDyePhotoDialog({ spare_dye }: { spare_dye: GetSpareDyeDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === ProductionChoiceActions.view_spare_dye_photo}
                onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                    <Cancel fontSize='large' />
                </IconButton>
             
                <DialogContent>
                    <Stack justifyContent={'center'}>
                        {choice === ProductionChoiceActions.view_spare_dye_photo && <img width={350} src={spare_dye.dye_photo} alt="shoe photo" />}

                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ViewSpareDyePhotoDialog







