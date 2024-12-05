import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { useContext } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import UpdateShoeWeightForm2 from '../../forms/production/UpdateShoeWeightForm2';
import UpdateShoeWeightForm3 from '../../forms/production/UpdateShoeWeightForm3';
import CreateOrEditShoeWeightForm from '../../forms/production/CreateOrEditShoeWeightForm';
import { GetShoeWeightDto } from '../../../dtos/shoe-weight.dto';


function CreateOrEditShoeWeightDialog({ shoe_weight }: { shoe_weight?: GetShoeWeightDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === ProductionChoiceActions.create_or_edit_shoe_weight || choice === ProductionChoiceActions.update_shoe_weight2 || choice === ProductionChoiceActions.update_shoe_weight3 ? true : false}
            onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">

                {!shoe_weight && choice === ProductionChoiceActions.create_or_edit_shoe_weight && "Create Shoe Weight"}
                {shoe_weight && <>
                    {choice === ProductionChoiceActions.create_or_edit_shoe_weight && "Update Shoe Weight 1"}
                    {choice === ProductionChoiceActions.update_shoe_weight2 && ' Update Shoe Weight 2'}
                    {choice === ProductionChoiceActions.update_shoe_weight3 && ' Update Shoe Weight 3'}
                </>}
            </DialogTitle>

            <DialogContent>
                {choice === ProductionChoiceActions.create_or_edit_shoe_weight && <CreateOrEditShoeWeightForm shoe_weight={shoe_weight} />}
                {shoe_weight && <>
                    {choice === ProductionChoiceActions.update_shoe_weight2 && <UpdateShoeWeightForm2 shoe_weight={shoe_weight} />}
                    {choice === ProductionChoiceActions.update_shoe_weight3 && <UpdateShoeWeightForm3 shoe_weight={shoe_weight} />}
                </>}


            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditShoeWeightDialog
