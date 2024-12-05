import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import UpdateShoeWeightForm2 from '../../forms/production/UpdateShoeWeightForm2';
import UpdateShoeWeightForm3 from '../../forms/production/UpdateShoeWeightForm3';
import CreateOrEditShoeWeightForm from '../../forms/production/CreateOrEditShoeWeightForm';
import { GetShoeWeightDto } from '../../../dtos/shoe-weight.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    shoe_weight?: GetShoeWeightDto
}
function CreateOrEditShoeWeightDialog({ shoe_weight, dialog, setDialog }: Props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditShoeWeightDialog" || dialog === "CreateOrEditShoeWeightDialog2" || dialog === "CreateOrEditShoeWeightDialog3"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">

                {!shoe_weight && dialog === "CreateOrEditShoeWeightDialog" && "Create Shoe Weight"}
                {shoe_weight && <>
                    {dialog === "CreateOrEditShoeWeightDialog" && "Update Shoe Weight 1"}
                    {dialog === "CreateOrEditShoeWeightDialog2" && ' Update Shoe Weight 2'}
                    {dialog === "CreateOrEditShoeWeightDialog3" && ' Update Shoe Weight 3'}
                </>}
            </DialogTitle>

            <DialogContent>
                {dialog === "CreateOrEditShoeWeightDialog" && <CreateOrEditShoeWeightForm shoe_weight={shoe_weight} />}
                {shoe_weight && <>
                    {dialog === "CreateOrEditShoeWeightDialog2" && <UpdateShoeWeightForm2 shoe_weight={shoe_weight} />}
                    {dialog === "CreateOrEditShoeWeightDialog3" && <UpdateShoeWeightForm3 shoe_weight={shoe_weight} />}
                </>}


            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditShoeWeightDialog
