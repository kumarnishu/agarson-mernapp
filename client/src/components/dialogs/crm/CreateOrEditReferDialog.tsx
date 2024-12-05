import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useContext } from 'react';
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import CreateOrEditReferForm from '../../forms/crm/CreateOrEditReferForm';
import { GetReferDto } from '../../../dtos/refer.dto';

function CreateOrEditReferDialog({refer}:{refer?:GetReferDto}) {
  const { choice, setChoice } = useContext(ChoiceContext);
  return (
    <>
      <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === LeadChoiceActions.create_or_edit_refer ? true : false}
      >
        <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
          setChoice({ type: LeadChoiceActions.close_lead })
        }}>
          <Cancel fontSize='large' />
        </IconButton>
        <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{refer?'Update Refer':'New Refer'}</DialogTitle>
        <DialogContent>
          <CreateOrEditReferForm refer={refer} />
          
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateOrEditReferDialog