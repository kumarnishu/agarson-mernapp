import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { BlockMultiLogin } from '../../../services/UserServices';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    id: string
}
function BlockMultiLoginDialog({ id, dialog, setDialog }: Props) {
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (BlockMultiLogin, {
              onSuccess: () => {
                queryClient.invalidateQueries('users')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { setAlert } = useContext(AlertContext)
    useEffect(() => {
        if (isSuccess)
            setDialog(undefined)
    }, [isSuccess])

    return (
        <Dialog open={dialog === 'BlockMultiLoginDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Block Multi Login
            </DialogTitle>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message=" blocked multi login for this user" color="success" />
                ) : null
            }

            <DialogContent>
                <Typography variant="body1" color="error">
                    Warning ! This will block multi login for this user.
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
                        mutate(id)
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Submit"}
                </Button>

            </Stack >
        </Dialog >
    )
}

export default BlockMultiLoginDialog
