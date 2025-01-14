import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Button, CircularProgress } from '@mui/material'
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { useMutation } from 'react-query';
import { AlertContext } from '../../../contexts/alertContext';
import { CrmService } from '../../../services/CrmService';
import { GetReferDto } from '../../../dtos/CrmDto';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    refer: GetReferDto
}

function ToogleReferConversionDialog({ refer, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetReferDto>, BackendError, string>
        (new CrmService().ToogleReferPartyConversion, {

            onSuccess: () => {
                queryClient.invalidateQueries('refers')
                queryClient.invalidateQueries('fuzzyrefers')
                queryClient.invalidateQueries('new_refer_reports')
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
        <Dialog open={dialog === "ToogleReferConversionDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {refer.convertedfromlead ? "Convert To Old Customer" : "Convert To New Customer"}
            </DialogTitle>

            <DialogContent sx={{ gap: 2 }}>

                <Typography variant="body1" color="error">
                    {refer.convertedfromlead ? "This Will Convert To Old Customer !!" : "This Will Convert To New Customer !!"}
                </Typography>
                {refer &&
                    <>

                        <Button variant="contained" color="primary" onClick={() => {
                            if (refer)
                                mutate(refer._id)
                        }}
                            disabled={Boolean(isLoading)}
                            fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Convert"}
                        </Button>
                    </>}
            </DialogContent>
        </Dialog >
    )
}

export default ToogleReferConversionDialog