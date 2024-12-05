import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { BackendError } from '../../..';
import { useMutation } from 'react-query';
import AlertBar from '../../snacks/AlertBar';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { ValidateSpareDye } from '../../../services/ProductionServices';
import { GetUserDto } from '../../../dtos/user.dto';
import { GetSpareDyeDto } from '../../../dtos/spare-dye.dto';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function ValidateSpareDyeDialog({ sparedye }: { sparedye: GetSpareDyeDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetUserDto>, BackendError, string>
        (ValidateSpareDye, {
            onSuccess: () => {
                queryClient.invalidateQueries('spare_dyes')
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

            <Dialog open={choice === ProductionChoiceActions.validate_spareDye ? true : false}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Validate Spare Dye</DialogTitle>
                <DialogContent>
                    <Button variant="contained" color="error" onClick={() => mutate(sparedye._id)}
                        disabled={Boolean(isLoading)}
                        fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ValidateSpareDyeDialog




