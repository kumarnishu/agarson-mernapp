import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { SaleChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { DeleteVisitReportRemark } from '../../../services/SalesServices';
import { GetVisitSummaryReportRemarkDto } from '../../../dtos/visit_remark.dto';
type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}

function DeleteVisitRemarkDialog({ remark, display, setDisplay }: { remark: GetVisitSummaryReportRemarkDto, display: boolean, setDisplay: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { choice, setChoice } = useContext(ChoiceContext)
  const { mutate, isLoading, isSuccess, error, isError } = useMutation
    <AxiosResponse<any>, BackendError, string>
    (DeleteVisitReportRemark, {
      onSuccess: () => {
        queryClient.invalidateQueries('remarks')
      }
    })

  useEffect(() => {
    if (isSuccess) {
      setDisplay(false)
      setChoice({ type: SaleChoiceActions.close_sale })
    }

  }, [isSuccess])

  return (
    <Dialog open={choice === SaleChoiceActions.delete__visit_remark || display ? true : false}
    >
      <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
        if (!display)
          setChoice({ type: SaleChoiceActions.close_sale })
        else
          setDisplay(false)
      }}>
        <Cancel fontSize='large' />
      </IconButton>
      <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
        Delete Remark
      </DialogTitle>
      {
        isError ? (
          <AlertBar message={error?.response.data.message} color="error" />
        ) : null
      }
      {
        isSuccess ? (
          <AlertBar message="deleted" color="success" />
        ) : null
      }
      <DialogContent>
        <Typography variant="h4" color="error">
          Are you sure to permanently delete this remark ?

        </Typography>
      </DialogContent>
      <Stack
        direction="row"
        gap={2}
        padding={2}
        width="100%"
      >
        <Button fullWidth variant="outlined" color="error"
          onClick={() => {
            mutate(remark._id)
          }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress /> :
            "Delete"}
        </Button>
        <Button fullWidth variant="contained" color="info"
          onClick={() => {
            setDisplay(false)
          }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress /> :
            "Cancel"}
        </Button>
      </Stack >
    </Dialog >
  )
}

export default DeleteVisitRemarkDialog
