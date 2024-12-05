import { Typography, Stack, Paper } from '@mui/material'
import { useState } from 'react';
import ResetPasswordSendMailDialog from '../components/dialogs/users/ResetPasswordSendMailDialog';
import SignUpDialog from '../components/dialogs/users/SignUpDialog';
import LoginForm from '../components/forms/user/LoginForm';
import AgarsonLogo from '../components/logo/Agarson';


function LoginPage() {
    const [dialog, setDialog] = useState<string | undefined>()
    return (
        <>
            <Stack sx={{ justifyContent: 'center', alignItems: 'center', height: '90vh', width: '100vw' }}>
                <Paper sx={{ maxWidth: '350px', p: 5, px: 2, borderColor: 'whitesmoke' }}>
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
                                onClick={() => setDialog('SignUpDialog')}
                            >
                                <b>Register</b>
                            </Typography >
                            {" or "}
                            <Typography
                                variant="body1"
                                sx={{ cursor: "pointer" }}
                                component="span"
                                onClick={() => setDialog('ResetPasswordSendMailDialog')}
                            >
                                Forgot Password
                            </Typography >

                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
            <Typography component="h1" variant="button" sx={{ textAlign: "center", fontWeight: '600', fontSize: 12, color: 'grey' }}>Copyright 2024 &copy; Agarson Shoes Pvt Ltd </Typography>
            <SignUpDialog dialog={dialog} setDialog={setDialog} />
            <ResetPasswordSendMailDialog dialog={dialog} setDialog={setDialog} />
        </>
    )
}

export default LoginPage
