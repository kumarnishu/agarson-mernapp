import { Typography, Stack, Paper } from '@mui/material'
import { useContext } from 'react';
import ResetPasswordSendMailDialog from '../components/dialogs/users/ResetPasswordSendMailDialog';
import SignUpDialog from '../components/dialogs/users/SignUpDialog';
import LoginForm from '../components/forms/user/LoginForm';
import { ChoiceContext, UserChoiceActions } from '../contexts/dialogContext';
import AgarsonLogo from '../components/logo/Agarson';


function LoginPage() {
    const { setChoice } = useContext(ChoiceContext)
    return (
        <>
            <Stack sx={{ justifyContent: 'center', alignItems: 'center', height: '90vh', width: '100vw' }}>
                <Paper  sx={{ maxWidth: '350px', p: 5  , px: 2, borderColor:'whitesmoke' }}>
                    <Stack justifyContent={"center"} alignItems="center">
                        <a href="https://agarsonshoes.in/">
                            <AgarsonLogo width={100} height={100} title='Agarson Shoes' />
                        </a>
                        <LoginForm />
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            gap={1}
                            pt={2}
                            direction={"row"}
                        >
                            <Typography
                                variant="body1"
                                sx={{ cursor: "pointer" }}
                                component="span"
                                onClick={() => setChoice({ type: UserChoiceActions.signup })}
                            >
                                <b>Register</b>
                            </Typography >
                            {" or "}
                            <Typography
                                variant="body1"
                                sx={{ cursor: "pointer" }}
                                component="span"
                                onClick={() => setChoice({ type: UserChoiceActions.reset_password_mail })}
                            >
                                Forgot Password
                            </Typography >

                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
            <Typography component="h1" variant="button" sx={{ textAlign: "center", fontWeight: '600', fontSize: 12, color: 'grey' }}>Copyright 2024 &copy; Agarson Shoes Pvt Ltd </Typography>
            <SignUpDialog />
            <ResetPasswordSendMailDialog />
        </>
    )
}

export default LoginPage
