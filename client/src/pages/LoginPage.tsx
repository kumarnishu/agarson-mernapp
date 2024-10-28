import { Typography, Stack, Paper, Box } from '@mui/material'
import { useContext } from 'react';
import ResetPasswordSendMailDialog from '../components/dialogs/users/ResetPasswordSendMailDialog';
import SignUpDialog from '../components/dialogs/users/SignUpDialog';
import LoginForm from '../components/forms/user/LoginForm';
import { ChoiceContext, UserChoiceActions } from '../contexts/dialogContext';
import AgarsonLogo from '../components/logo/Agarson';


function LoginPage() {
    const { setChoice } = useContext(ChoiceContext)
    return (
        <Stack sx={{ height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center' }}>
            <Paper elevation={8} sx={{ maxWidth: '350px', p: 2, borderRadius: 10, border: 4, borderColor: 'whitesmoke' }}>
                <Stack justifyContent={"center"} alignItems="center">
                    <a href="https://agarsonshoes.in/">
                        <AgarsonLogo width={140} height={140} title='Agarson Shoes' />
                    </a>
                    <LoginForm />
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                        py={2}
                        direction={"row"}
                    >
                        <Typography
                            variant="body1"
                            sx={{ cursor: "pointer",fontSize:'0.8rem',fontWeight:800 }}
                            component="span"
                            onClick={() => setChoice({ type: UserChoiceActions.signup })}
                        >
                            Register
                        </Typography >
                        {" or "}
                        <Typography
                            variant="body1"
                            sx={{ cursor: "pointer",fontSize:'0.8rem' }}
                            component="span"
                            onClick={() => setChoice({ type: UserChoiceActions.reset_password_mail })}
                        >
                            Forgot Password
                        </Typography >

                    </Stack>
                </Stack>
            </Paper>
            <Typography component="h1" variant="button" sx={{ textAlign: "center", fontWeight: '600', pt: 2, color: 'grey', fontSize: '0.8rem' }}>Copyright 2024 &copy; Agarson Shoes Pvt Ltd </Typography>
            <SignUpDialog />
            <ResetPasswordSendMailDialog />
        </Stack>


    )
}

export default LoginPage
