import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Button, CircularProgress, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { useMutation } from 'react-query';

import { AlertContext } from '../../../contexts/alertContext';
import { CrmService } from '../../../services/CrmService';
import { GetLeadDto, GetReferDto } from '../../../dtos/CrmDto';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    lead: GetLeadDto
}
function ConvertLeadToReferDialog({ lead, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const [remark, setRemark] = useState("")
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetReferDto>, BackendError, { id: string, body: { remark: string } }>
        (new CrmService().ConvertLeadToRefer, {

            onSuccess: () => {
                queryClient.invalidateQueries('leads')
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
        <Dialog open={dialog === 'ConvertLeadToReferDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Convert  To Customer
            </DialogTitle>

            <DialogContent sx={{ gap: 2 }}>

                <TextField
                    autoFocus
                    required
                    fullWidth
                    sx={{ mt: 2 }}
                    multiline
                    minRows={4}
                    id="remark"
                    label="Remarks"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                />
                <Typography variant="body1" color="error">
                    {`This will make a new Customer with the selected lead data.`}
                </Typography>
                {lead &&
                    <>

                        <Button variant="contained" color="primary" onClick={() => {
                            if (remark)
                                mutate({
                                    id: lead._id,
                                    body: { remark: remark }
                                })
                        }}
                            disabled={Boolean(isLoading)}
                            fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Convert"}
                        </Button>
                    </>}
            </DialogContent>
        </Dialog >
    )
}

export default ConvertLeadToReferDialog