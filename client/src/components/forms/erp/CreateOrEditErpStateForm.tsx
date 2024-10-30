import { Button, CircularProgress, Grid, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import { ChoiceContext, LeadChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { CreateOreditErpState } from '../../../services/ErpServices';
import { CreateOrEditErpStateDto, GetErpStateDto } from '../../../dtos';

function CreateOrEditErpStateForm({ state }: { state?: GetErpStateDto }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            state: GetErpStateDto | undefined;
            body: CreateOrEditErpStateDto
        }>
        (CreateOreditErpState, {
            onSuccess: () => {
                queryClient.invalidateQueries('erp_states')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik({
        initialValues: {
            state: state ? state.state : "",
            apr: state ? state.apr : 0,
            may: state ? state.may : 0,
            jun: state ? state.jun : 0,
            jul: state ? state.jul : 0,
            aug: state ? state.aug : 0,
            sep: state ? state.sep : 0,
            oct: state ? state.oct : 0,
            nov: state ? state.nov : 0,
            dec: state ? state.dec : 0,
            jan: state ? state.jan : 0,
            feb: state ? state.feb : 0,
            mar: state ? state.mar : 0
        },
        validationSchema: yup.object({
            state: yup.string().required()
        }),
        onSubmit: (values) => {
            mutate({
                state: state,
                body:  {
                        state: values.state,
                        apr: values.apr,
                        may: values.may,
                        jun: values.jun,
                        jul: values.jul,
                        aug: values.aug,
                        sep: values.sep,
                        oct: values.oct,
                        nov: values.nov,
                        dec: values.dec,
                        jan: values.jan,
                        feb: values.feb,
                        mar: values.mar,
                    }
            })
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: LeadChoiceActions.close_lead })

        }
    }, [isSuccess, setChoice])
    return (
        <form onSubmit={formik.handleSubmit} style={{ paddingTop: '10px' }}>
            <TextField
                required
                error={
                    formik.touched.state && formik.errors.state ? true : false
                }
                autoFocus
                id="state"
                label="State"
                fullWidth
                helperText={
                    formik.touched.state && formik.errors.state ? formik.errors.state : ""
                }
                {...formik.getFieldProps('state')}
            />

            <Grid container sx={{ pt: 2 }} >
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.apr && formik.errors.apr ? true : false
                        }
                        autoFocus
                        id="apr"
                        label="APR"
                        fullWidth
                        helperText={
                            formik.touched.apr && formik.errors.apr ? formik.errors.apr : ""
                        }
                        {...formik.getFieldProps('apr')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.may && formik.errors.may ? true : false
                        }
                        autoFocus
                        id="may"
                        label="MAY"
                        fullWidth
                        helperText={
                            formik.touched.may && formik.errors.may ? formik.errors.may : ""
                        }
                        {...formik.getFieldProps('may')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.jun && formik.errors.jun ? true : false
                        }
                        autoFocus
                        id="jun"
                        label="JUN"
                        fullWidth
                        helperText={
                            formik.touched.jun && formik.errors.jun ? formik.errors.jun : ""
                        }
                        {...formik.getFieldProps('jun')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.jul && formik.errors.jul ? true : false
                        }
                        autoFocus
                        id="jul"
                        label="JUL"
                        fullWidth
                        helperText={
                            formik.touched.jul && formik.errors.jul ? formik.errors.jul : ""
                        }
                        {...formik.getFieldProps('jul')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.aug && formik.errors.aug ? true : false
                        }
                        autoFocus
                        id="aug"
                        label="AUG"
                        fullWidth
                        helperText={
                            formik.touched.aug && formik.errors.aug ? formik.errors.aug : ""
                        }
                        {...formik.getFieldProps('aug')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.sep && formik.errors.sep ? true : false
                        }
                        autoFocus
                        id="sep"
                        label="SEP"
                        fullWidth
                        helperText={
                            formik.touched.sep && formik.errors.sep ? formik.errors.sep : ""
                        }
                        {...formik.getFieldProps('sep')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.oct && formik.errors.oct ? true : false
                        }
                        autoFocus
                        id="oct"
                        label="OCT"
                        fullWidth
                        helperText={
                            formik.touched.oct && formik.errors.oct ? formik.errors.oct : ""
                        }
                        {...formik.getFieldProps('oct')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.nov && formik.errors.nov ? true : false
                        }
                        autoFocus
                        id="nov"
                        label="NOV"
                        fullWidth
                        helperText={
                            formik.touched.nov && formik.errors.nov ? formik.errors.nov : ""
                        }
                        {...formik.getFieldProps('nov')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.dec && formik.errors.dec ? true : false
                        }
                        autoFocus
                        id="dec"
                        label="DEC"
                        fullWidth
                        helperText={
                            formik.touched.dec && formik.errors.dec ? formik.errors.dec : ""
                        }
                        {...formik.getFieldProps('dec')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.jan && formik.errors.jan ? true : false
                        }
                        autoFocus
                        id="jan"
                        label="JAN"
                        fullWidth
                        helperText={
                            formik.touched.jan && formik.errors.jan ? formik.errors.jan : ""
                        }
                        {...formik.getFieldProps('jan')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.feb && formik.errors.feb ? true : false
                        }
                        autoFocus
                        id="feb"
                        label="FEB"
                        fullWidth
                        helperText={
                            formik.touched.feb && formik.errors.feb ? formik.errors.feb : ""
                        }
                        {...formik.getFieldProps('feb')}
                    /></Grid>
                <Grid key={1} item xs={12} md={4} lg={3} sx={{ p: 1 }}>
                    <TextField
                        type='number'
                        required
                        variant='outlined'
                        error={
                            formik.touched.mar && formik.errors.mar ? true : false
                        }
                        autoFocus
                        id="mar"
                        label="MAR"
                        fullWidth
                        helperText={
                            formik.touched.mar && formik.errors.mar ? formik.errors.mar : ""
                        }
                        {...formik.getFieldProps('mar')}
                    />

                </Grid>

            </Grid>

            <Stack
                gap={2}
                pt={2}
            >
                {/* remarks */}

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !state ? "Add State" : "Update State"}
                </Button>


            </Stack>

            {
                isError ? (
                    <>
                        {<AlertBar message={error?.response.data.message} color="error" />}
                    </>
                ) : null
            }
            {
                isSuccess ? (
                    <>
                        {!state ? <AlertBar message="new state created" color="success" /> : <AlertBar message="state updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditErpStateForm
