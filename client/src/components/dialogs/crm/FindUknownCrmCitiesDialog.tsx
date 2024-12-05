import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button } from '@mui/material'
import { useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { FindUnknownCrmCities } from '../../../services/LeadsServices';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}

function FindUknownCrmCitiesDialog({ dialog, setDialog }: Props) {
    const { mutate, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError>
        (FindUnknownCrmCities, {
            onSuccess: () => {
                queryClient.invalidateQueries('crm_cities')
            }
        })


    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={dialog === 'FindUknownCrmCitiesDialog'}
            onClose={() => {
                setDialog(undefined)

            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)

            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Find Unknown Cities
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        Donot forgot to assign unknown city to the users ?
                    </Typography>
                    <Button variant='outlined' color='error' onClick={() => mutate()}>Submit</Button>

                </Stack>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="successfull" color="success" />
                    ) : null
                }
            </DialogContent>
        </Dialog >
    )
}

export default FindUknownCrmCitiesDialog