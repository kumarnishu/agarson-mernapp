import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import { CheckListChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { GetChecklistBoxDto } from '../../../dtos/checklist/checklist.dto';
import { ToogleMyCheckLists } from '../../../services/CheckListServices';
import { Cancel } from '@mui/icons-material';

function CreateOrEditMaintenanceItemRemarkDialog({ box }: { box: GetChecklistBoxDto }) {
    const { mutate, isLoading, isError, error, isSuccess } = useMutation
        <AxiosResponse<any>, BackendError, { id: string, remarks: string }>
        (ToogleMyCheckLists, {
            onSuccess: () => {
                queryClient.invalidateQueries('checklists')
            }
        })

    const { choice, setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        remarks: string
    }>({
        initialValues: {
            remarks: box ? box.remarks : ""
        },
        validationSchema: yup.object({
            remarks: yup.string().required()
        }),
        onSubmit: (values: {
            remarks: string,
        }) => {
            mutate({
                id: box._id,
                remarks: values.remarks
            })
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: CheckListChoiceActions.close_checklist })

        }
    }, [isSuccess, setChoice])
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === CheckListChoiceActions.toogle_checklist ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: CheckListChoiceActions.close_checklist })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Remarks</DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit}>
                    <Stack
                        gap={2}
                        pt={2}
                    >
                        {/* remarks */}
                        <TextField
                            required
                            error={
                                formik.touched.remarks && formik.errors.remarks ? true : false
                            }
                            autoFocus
                            id="remarks"
                            label="Remarks"
                            fullWidth
                            helperText={
                                formik.touched.remarks && formik.errors.remarks ? formik.errors.remarks : ""
                            }
                            {...formik.getFieldProps('remarks')}
                        />



                        <Button variant="contained" color={!box?.checked ? "success" : "error"} type="submit"
                            disabled={Boolean(isLoading)}
                            fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !box?.checked ? "Check" : "Uncheck"}
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
                                {<AlertBar message="checklist updated" color="success" />}
                            </>
                        ) : null
                    }

                </form>
            </DialogContent>
        </Dialog>




    )
}

export default CreateOrEditMaintenanceItemRemarkDialog
