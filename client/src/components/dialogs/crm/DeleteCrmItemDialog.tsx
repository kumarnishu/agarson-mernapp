import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress,  IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import {  DeleteCrmItem } from '../../../services/LeadsServices';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { DropDownDto } from '../../../dtos';
import { GetCrmCityDto, GetCrmStateDto } from '../../../dtos';


function DeleteCrmItemDialog({ refer, lead, state, city, type, source, stage }: { refer?: DropDownDto, lead?: DropDownDto, state?: GetCrmStateDto, city?: GetCrmCityDto, type?: DropDownDto, source?: DropDownDto, stage?: DropDownDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { refer?: DropDownDto, lead?: DropDownDto, state?: GetCrmStateDto, city?: GetCrmCityDto, type?: DropDownDto, source?: DropDownDto, stage?: DropDownDto }>
        (DeleteCrmItem, {
            onSuccess: () => {
                if(refer)
                queryClient.invalidateQueries('refers')
                if (state)
                    queryClient.invalidateQueries('crm_states')
                if (lead)
                    queryClient.invalidateQueries('leads')
                if (source)
                    queryClient.invalidateQueries('crm_sources')
                if (type)
                    queryClient.invalidateQueries('crm_types')
                if(city)
                    queryClient.invalidateQueries('crm_cities')
                if (stage)
                    queryClient.invalidateQueries('crm_stages')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: LeadChoiceActions.close_lead })
    }, [setChoice, isSuccess])

    return (
        <Dialog   open={choice === LeadChoiceActions.delete_crm_item ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: LeadChoiceActions.close_lead })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px',fontSize:'20px' }} textAlign="center">

                {refer&&'Delete Refer'}
                {state && 'Delete State'}
                {lead && 'Delete Lead'}
                {type && 'Delete Lead Type'}
                {source && 'Delete Lead Source'}
                {city && 'Delete City'}
                {stage && 'Delete Stage'}
            </DialogTitle>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message="deleted" color="success" />
                ) : null
            }
            <DialogContent>
                <Typography variant="h4" color="error">
                   Are you sure to permanently delete this item ?

                </Typography>
            </DialogContent>
            <Stack
                direction="row"
                gap={2}
                padding={2}
                width="100%"
            >
                <Button fullWidth variant="outlined" color="error"
                    onClick={() => {
                        mutate({ refer, lead, state, city, type, source, stage })
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Delete"}
                </Button>
                <Button fullWidth variant="contained" color="info"
                    onClick={() => {
                        setChoice({ type: LeadChoiceActions.close_lead })
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Cancel"}
                </Button>
            </Stack >
        </Dialog >
    )
}

export default DeleteCrmItemDialog
