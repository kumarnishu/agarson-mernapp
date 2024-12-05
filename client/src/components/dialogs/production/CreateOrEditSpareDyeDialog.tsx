import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { useContext } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import CreateOrEditSpareDyeForm from '../../forms/production/CreateOrEditSpareDyeForm';
import { GetSpareDyeDto } from '../../../dtos/spare-dye.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function CreateOrEditSpareDyeDialog({ sparedye }: { sparedye?: GetSpareDyeDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === ProductionChoiceActions.create_or_edit_spareDye ? true : false}
            onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">

                {!sparedye ? "Create Spare Dye" : "Update Spare Dye"}

            </DialogTitle>

            <DialogContent>
                <CreateOrEditSpareDyeForm sparedye={sparedye} />

            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditSpareDyeDialog
