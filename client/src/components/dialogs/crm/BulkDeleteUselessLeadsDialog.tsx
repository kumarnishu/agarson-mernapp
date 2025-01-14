import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';

import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';
import { CrmService } from '../../../services/CrmService';
import { GetLeadDto } from '../../../dtos/CrmDto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    selectedLeads: GetLeadDto[], removeSelectedLeads: () => void
}

function BulkDeleteUselessLeadsDialog({ selectedLeads, removeSelectedLeads, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const [leadsIds, setLeadsIds] = useState<string[]>()
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { leads_ids: string[] }>
        (new CrmService(). BulkDeleteUselessLeads, {
           
            onSuccess: () => {
                queryClient.invalidateQueries('leads')
                removeSelectedLeads()
                setAlert({ message: "success", color: 'success' })
              },
              onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })

    useEffect(() => {
        if (selectedLeads && selectedLeads.length > 0) {
            let ids: string[] = []
            ids = selectedLeads.map((lead) => {
                return lead._id
            })
            setLeadsIds(ids)
        }
    }, [selectedLeads])

    useEffect(() => {
        if (isSuccess)
            setTimeout(() => {
                setDialog(undefined)
            }, 1000)
    }, [isSuccess])

    return (
        <Dialog open={dialog === 'BulkDeleteUselessLeadsDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Delete Selected Leads
            </DialogTitle>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message={"selected leads deleted"} color="success" />
                ) : null
            }
            <DialogContent>
                <Typography variant="body1" color="error">
                    {`Warning ! This will delete selected uselesss ${selectedLeads.length} leads permanently and associated remarks to it.`}

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
                        if (leadsIds && leadsIds.length > 0)
                            mutate({ leads_ids: leadsIds })
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Delete Selected"}
                </Button>

            </Stack >
        </Dialog >
    )
}

export default BulkDeleteUselessLeadsDialog