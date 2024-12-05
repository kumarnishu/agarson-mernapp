import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import {  useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { DeleteCheckListRemark } from '../../../services/CheckListServices';
import { GetChecklistRemarksDto } from '../../../dtos/checklist-remark.dto';


function DeleteChecklistRemarkDialog({ remark, display, setDisplay }: { remark: GetChecklistRemarksDto, display: boolean, setDisplay: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { mutate, isLoading, isSuccess, error, isError } = useMutation
    <AxiosResponse<any>, BackendError, string>
    (DeleteCheckListRemark, {
      onSuccess: () => {
        queryClient.invalidateQueries('remarks')
        queryClient.invalidateQueries('checklists')
      }
    })

  useEffect(() => {
    if (isSuccess) {
      setDisplay(false)
    }

  }, [isSuccess])

  return (
    <Dialog open={display ? true : false}
    >
      <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
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

export default DeleteChecklistRemarkDialog
