import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { BulkDeleteUselessLeads } from '../../../services/LeadsServices';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { GetLeadDto } from '../../../dtos';


function BulkDeleteUselessLeadsDialog({ selectedLeads, removeSelectedLeads }: { selectedLeads: GetLeadDto[], removeSelectedLeads: () => void }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const [leadsIds, setLeadsIds] = useState<string[]>()
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { leads_ids: string[] }>
        (BulkDeleteUselessLeads, {
            onSuccess: () => {
                queryClient.invalidateQueries('leads')
                removeSelectedLeads()
            }
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
                setChoice({ type: LeadChoiceActions.close_lead })
            }, 1000)
    }, [setChoice, isSuccess])

    return (
        <Dialog open={choice === LeadChoiceActions.bulk_delete_useless_leads ? true : false}
            onClose={() => setChoice({ type: LeadChoiceActions.close_lead })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: LeadChoiceActions.close_lead })}>
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
                        setChoice({ type: LeadChoiceActions.bulk_delete_useless_leads })
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