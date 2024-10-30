import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useContext } from 'react';
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';

import { Cancel } from '@mui/icons-material';
import CreateOrEditLeadForm from '../../forms/crm/CreateOrEditLeadForm';
import { GetLeadDto } from '../../../dtos';

function CreateOrEditLeadDialog({lead}:{lead?:GetLeadDto}) {
  const { choice, setChoice } = useContext(ChoiceContext);
  return (
    <>
      <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === LeadChoiceActions.create_or_edit_lead ? true : false}
      >
        <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
          setChoice({ type: LeadChoiceActions.close_lead })
        }}>
          <Cancel fontSize='large' />
        </IconButton>
        <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{lead?'Update Lead':'New Lead'}</DialogTitle>
        <DialogContent>
          <CreateOrEditLeadForm lead={lead} />
          
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateOrEditLeadDialog