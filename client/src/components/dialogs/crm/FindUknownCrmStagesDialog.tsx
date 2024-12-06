import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Button } from '@mui/material'
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import {  useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { FindUnknownCrmStages } from '../../../services/LeadsServices';
import { AlertContext } from '../../../contexts/alertContext';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}

function FindUknownCrmStagesDialog({ dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError>
        (FindUnknownCrmStages, {
           
            onSuccess: () => {
                queryClient.invalidateQueries('crm_stages')
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
        <Dialog
            fullWidth
            open={dialog === "FindUknownCrmStagesDialog"}
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
                Find Unknown Stages
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >

                    <Button variant='outlined' color='error' onClick={() => mutate()}>Submit</Button>

                </Stack>
               
            </DialogContent>
        </Dialog >
    )
}

export default FindUknownCrmStagesDialog