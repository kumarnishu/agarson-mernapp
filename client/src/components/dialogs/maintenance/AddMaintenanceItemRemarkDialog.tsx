import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import { ChoiceContext, MaintenanceChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { Cancel } from '@mui/icons-material';
import { GetMaintenanceItemDto } from '../../../dtos/maintenance/maintenance.dto';
import { AddMaintenanceItemRemark } from '../../../services/MaintenanceServices';

function AddMaintenanceItemRemarkDialog({ item, maintenance_id }: { item: GetMaintenanceItemDto, maintenance_id: string, }) {
    const { mutate, isLoading, isError, error, isSuccess } = useMutation
        <AxiosResponse<any>, BackendError, { id: string, maintenance_id: string, remarks: string, stage: string }>
        (AddMaintenanceItemRemark, {
            onSuccess: () => {
                queryClient.invalidateQueries('maintenances')
                queryClient.invalidateQueries('maintenances_report')
            }
        })

    const { choice, setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        remarks: string,
        stage: string
    }>({
        initialValues: {
            remarks: "",
            stage: item.stage || ""
        },
        validationSchema: yup.object({
            remarks: yup.string().required(),
            stage: yup.string().required()
        }),
        onSubmit: (values) => {
            mutate({
                id: item._id,
                remarks: values.remarks,
                maintenance_id: maintenance_id,
                stage: values.stage
            })
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: MaintenanceChoiceActions.close_maintenance })
            formik.setValues({ ...formik.values, remarks: "", stage: item.stage || "" })
        }
    }, [isSuccess, setChoice])
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === MaintenanceChoiceActions.create_or_edit_maintenance_remarks ? true : false}
            onClose={() => {
                setChoice({ type: MaintenanceChoiceActions.close_maintenance })
            }
            }
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: MaintenanceChoiceActions.close_maintenance })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Add Remarks</DialogTitle>
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
                        < TextField
                            select
                            SelectProps={{
                                native: true
                            }}
                            focused

                            error={
                                formik.touched.stage && formik.errors.stage ? true : false
                            }
                            id="stage"
                            label="Stage"
                            fullWidth
                            helperText={
                                formik.touched.stage && formik.errors.stage ? formik.errors.stage : ""
                            }
                            {...formik.getFieldProps('stage')}
                        >
                            <option key={0} value={'open'}>
                                Open
                            </option>
                            <option key={0} value={'pending'}>
                                Pending
                            </option>
                            <option key={1} value={"done"}>
                                Done
                            </option>
                        </TextField>


                        <Button variant="contained" type="submit"
                            disabled={Boolean(isLoading)}
                            fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
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
                                {<AlertBar message="success" color="success" />}
                            </>
                        ) : null
                    }

                </form>
            </DialogContent>
        </Dialog>




    )
}

export default AddMaintenanceItemRemarkDialog
