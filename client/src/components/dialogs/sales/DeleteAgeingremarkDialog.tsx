import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';
import { SalesService } from '../../../services/SalesServices';
import { GetAgeingRemarkDto } from '../../../dtos/response/SalesDto';
type Props = {
  dialog: string | undefined,
  setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
  remark: GetAgeingRemarkDto
}

function DeleteAgeingremarkDialog({ remark, dialog, setDialog }: Props) {
  const { setAlert } = useContext(AlertContext)
  const { mutate, isLoading, isSuccess, error, isError } = useMutation
    <AxiosResponse<any>, BackendError, string>
    (new SalesService().DeleteAgeingRemark, {

      onSuccess: () => {
        queryClient.invalidateQueries('remarks')
        setAlert({ message: "success", color: 'success' })
      },
      onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
    })

  useEffect(() => {
    if (isSuccess) {
      setDialog(undefined)
    }

  }, [isSuccess])

  return (
    <Dialog open={dialog === "DeleteAgeingremarkDialog"}
    >
      <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
        setDialog(undefined)
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
            setDialog(undefined)
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

export default DeleteAgeingremarkDialog