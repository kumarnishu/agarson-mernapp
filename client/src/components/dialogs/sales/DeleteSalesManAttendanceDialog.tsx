import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { SaleChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { DeleteSalesManAttendance } from '../../../services/SalesServices';
import { GetSalesAttendanceDto } from '../../../dtos/sales-attendance.dto';


function DeleteSalesManAttendanceDialog({ attendance }: {
  attendance?: GetSalesAttendanceDto,
}) {
  const { choice, setChoice } = useContext(ChoiceContext)
  const { mutate, isLoading, isSuccess, error, isError } = useMutation
    <AxiosResponse<any>, BackendError, string>
    (DeleteSalesManAttendance, {
      onSuccess: () => {
        queryClient.invalidateQueries('attendances')
      }
    })

  useEffect(() => {
    if (isSuccess) {
      setChoice({ type: SaleChoiceActions.close_sale })
    }

  }, [isSuccess])

  return (
    <Dialog open={choice === SaleChoiceActions.delete_sale_attendance  ? true : false}
    >
      <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
        setChoice({ type: SaleChoiceActions.close_sale })
      }}>
        <Cancel fontSize='large' />
      </IconButton>
      <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
        Delete Attendance
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
          Are you sure to permanently delete the attendance ?

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
            if (attendance)
              mutate(attendance._id)
          }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress /> :
            "Delete"}
        </Button>
        <Button fullWidth variant="contained" color="info"
          onClick={() => {
            setChoice({ type: SaleChoiceActions.close_sale })
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

export default DeleteSalesManAttendanceDialog
