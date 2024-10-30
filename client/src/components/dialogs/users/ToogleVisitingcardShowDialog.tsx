import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress,  IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { UserChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import {  ToogleSHowVisitingCard } from '../../../services/UserServices';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { GetUserDto } from '../../../dtos';

function ToogleVisitingcardShowDialog({ user }: { user: GetUserDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (ToogleSHowVisitingCard,{
            onSuccess: () => {
                queryClient.invalidateQueries('users')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: UserChoiceActions.close_user })
    }, [setChoice, isSuccess])

    return (
        <Dialog open={choice === UserChoiceActions.toogle_show_visitingcard ? true : false}
            onClose={() => setChoice({ type: UserChoiceActions.close_user })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: UserChoiceActions.close_user })}>
                <Cancel fontSize='large' />
            </IconButton>
            
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {user.show_only_visiting_card_leads?"Show All Leads":"Show only Leads having a visiting cards."}
            </DialogTitle>
            <DialogContent>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="success " color="success" />
                    ) : null
                }
                <Typography variant="body1">
                    Warning ! This is a dangerous  Action, Be careful
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
                        mutate(user._id)
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

export default ToogleVisitingcardShowDialog
