import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { useContext } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext.tsx';
import { Cancel } from '@mui/icons-material';
import CreateOrEditSoleThicknessForm from '../../forms/production/CreateOrEditSoleThicknessForm.tsx';
import { GetSoleThicknessDto } from '../../../dtos/sole-thickness.dto.ts';


function CreateOrEditSoleThicknessDialog({ thickness }: { thickness?: GetSoleThicknessDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === ProductionChoiceActions.create_or_edit_thickness ? true : false}
            onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {thickness ? "Update thickness" : "New thickness"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditSoleThicknessForm thickness={thickness} />
            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditSoleThicknessDialog
