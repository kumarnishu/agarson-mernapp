import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Button, CircularProgress } from '@mui/material'
import { useEffect } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { BackendError } from '../../..';
import { ToogleReferPartyConversion } from '../../../services/LeadsServices';
import { queryClient } from '../../../main';
import { useMutation } from 'react-query';
import AlertBar from '../../snacks/AlertBar';
import { GetReferDto } from '../../../dtos/refer.dto';
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    refer: GetReferDto
}

function ToogleReferConversionDialog({ refer, dialog, setDialog }: Props) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetReferDto>, BackendError, string>
        (ToogleReferPartyConversion, {
            onSuccess: () => {
                queryClient.invalidateQueries('refers')
                queryClient.invalidateQueries('fuzzyrefers')
                queryClient.invalidateQueries('new_refer_reports')

            }
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
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message={refer.convertedfromlead ? "Convert To Old Customer Success" : "Convert To New Customer Success"} color="success" />
                ) : null
            }
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