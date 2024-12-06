import { Dialog, DialogTitle, DialogContent, IconButton, Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';

import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { BulkDeleteChecklists } from '../../../services/CheckListServices';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';
type Props = {
    dialog: string | undefined,
    ids: string[],
    clearIds: () => any
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function BulkDeleteCheckListDialog({ ids, clearIds, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { ids: string[] }>
        (BulkDeleteChecklists, {
          
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
            <Dialog fullWidth open={dialog == 'BulkDeleteCheckListDialog'}
                onClose={() => setDialog(undefined)}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {

                    setDialog(undefined)
                    clearIds();
                }
                }>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Delete Selected CheckList
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" deleted selected checklist" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will delete  ${ids.length} checklists`}

                    </Typography>
                </DialogContent>

                <Stack
                    direction="column"
                    gap={2}
                    padding={2}
                    width="100%"
                >
                    <Button fullWidth variant="outlined" color="error"
                        onClick={() => {
                            mutate({ ids: ids })
                            clearIds();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Delete"}
                    </Button>
                </Stack >
            </Dialog>
        </>
    )
}

export default BulkDeleteCheckListDialog