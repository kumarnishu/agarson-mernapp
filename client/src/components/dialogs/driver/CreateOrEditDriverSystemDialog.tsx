import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import CreateOrEditDriverSystemForm from '../../forms/driver/CreateOrEditDriverSystemForm';
import { GetDriverSystemDto } from '../../../dtos/driver.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    item?: GetDriverSystemDto
}
function CreateOrEditDriverSystemDialog({ item, dialog, setDialog }: Props) {

    return (
        <>
            <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditDriverSystemDialog"}

            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                    setDialog(undefined)
                }}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}> {!item ? "New Driver System" : "Edit Driver System"}
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <CreateOrEditDriverSystemForm setDialog={
                        setDialog
                    } item={item} />
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CreateOrEditDriverSystemDialog