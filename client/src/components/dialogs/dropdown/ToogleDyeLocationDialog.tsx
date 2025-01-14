import { Dialog, DialogContent, DialogTitle, Button, DialogActions, CircularProgress, IconButton } from '@mui/material';
import { useContext, useEffect } from 'react';
import { queryClient } from '../../../main';
import { AxiosResponse } from 'axios';
import { BackendError } from '../../..';
import { useMutation } from 'react-query';
import { Cancel } from '@mui/icons-material';
import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';
import { DropdownService } from '../../../services/DropDownServices';
import { GetDyeLocationDto } from '../../../dtos/response/DropDownDto';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    location: GetDyeLocationDto
}

function ToogleDyeLocationDialog({ location, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (new DropdownService().ToogleDyeLocation, {

            onSuccess: () => {
                queryClient.invalidateQueries('dyelocations')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })

    useEffect(() => {
        if (isSuccess)
            setDialog(undefined)
    }, [isSuccess])
    return (
        <>
            <Dialog open={dialog === "ToogleDyeLocationDialog"}
                onClose={() => setDialog(undefined)}
            >
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="success" color="success" />
                    ) : null
                }
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Toogle Location</DialogTitle>
                <DialogContent>
                    This Will toogle location {location.name}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button fullWidth variant="outlined" color="error"
                        onClick={() => {
                            mutate(location._id)
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Toogle"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ToogleDyeLocationDialog