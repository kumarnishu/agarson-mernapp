import { Dialog, DialogTitle,  IconButton, Stack, Button, CircularProgress } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';

import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';
import { ChecklistService } from '../../../services/ChecklistService';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}
function FixCheckListBoxesDialog({  dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError>
        (new ChecklistService().FixChecklistboxes, {

            onSuccess: () => {

                queryClient.invalidateQueries('checklists')
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
            <Dialog fullWidth open={dialog === 'FixCheckListBoxesDialog'}
                onClose={() => setDialog(undefined)}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Fix CheckList Dates
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" fixed all checklist" color="success" />
                    ) : null
                }

                <Stack
                    direction="column"
                    gap={2}
                    padding={2}
                    width="100%"
                >
                    <Button fullWidth variant="outlined" color="error"
                        onClick={() => {
                            mutate()
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Submit"}
                    </Button>
                </Stack >
            </Dialog>
        </>
    )
}

export default FixCheckListBoxesDialog