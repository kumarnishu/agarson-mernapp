import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { BackendError } from '../../..';
import { useMutation } from 'react-query';
import AlertBar from '../../snacks/AlertBar';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { ValidateShoeWeight } from '../../../services/ProductionServices';
import { GetUserDto } from '../../../dtos/user.dto';
import { GetShoeWeightDto } from '../../../dtos/shoe-weight.dto';

function ValidateShoeWeightDialog({ weight }: { weight: GetShoeWeightDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetUserDto>, BackendError, string>
        (ValidateShoeWeight, {
            onSuccess: () => {
                queryClient.invalidateQueries('shoe_weights')
            }
        })
    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                setChoice({ type: ProductionChoiceActions.close_production })
            }, 1000)
        }
    }, [isSuccess, setChoice])
    return (
        <>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message="validated successfull" color="success" />
                ) : null
            }

            <Dialog open={choice === ProductionChoiceActions.validate_weight ? true : false}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
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




