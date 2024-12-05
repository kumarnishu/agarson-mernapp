import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';

import { Cancel } from '@mui/icons-material';
import CreateOrEditLeadForm from '../../forms/crm/CreateOrEditLeadForm';
import { GetLeadDto } from '../../../dtos/lead.dto';

type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
  lead?: GetLeadDto
}
function CreateOrEditLeadDialog({ lead, dialog, setDialog }: Props) {
  return (
    <>
      <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog == 'CreateOrEditLeadDialog'}
      >
        <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
          setDialog(undefined)
        }}>
          <Cancel fontSize='large' />
        </IconButton>
        <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{lead ? 'Update Lead' : 'New Lead'}</DialogTitle>
        <DialogContent>
          <CreateOrEditLeadForm setDialog={
                    setDialog
                } lead={lead} />

        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateOrEditLeadDialog