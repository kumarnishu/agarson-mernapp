import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { BackendError } from '../../..';
import { useMutation } from 'react-query';
import { GetUserDto } from '../../../dtos/user.dto';
import { GetShoeWeightDto } from '../../../dtos/shoe-weight.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { ProductionService } from '../../../services/ProductionService';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    weight: GetShoeWeightDto
}
function ValidateShoeWeightDialog({ weight, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetUserDto>, BackendError, string>
        (new ProductionService().ValidateShoeWeight, {
            onSuccess: () => {
                queryClient.invalidateQueries('shoe_weights')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                setDialog(undefined)
            }, 1000)
        }
    }, [isSuccess])
    return (
        <>


            <Dialog open={dialog === "ValidateShoeWeightDialog"}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Validate Shoe Weight</DialogTitle>
                <DialogContent>
                    <Button variant="contained" color="error" onClick={() => mutate(weight._id)}
                        disabled={Boolean(isLoading)}
                        fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ValidateShoeWeightDialog




