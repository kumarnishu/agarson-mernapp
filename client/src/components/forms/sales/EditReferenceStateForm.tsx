import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { toTitleCase } from '../../../utils/TitleCase';
import { SalesService } from '../../../services/SalesServices';
import { AuthorizationService } from '../../../services/AuthorizationService';
import { GetCrmStateDto } from '../../../dtos/crm-state.dto';
type Props = {
    state?: string,
    gst: string,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}

function EditReferenceStateForm({ state, gst, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: { gst: string, state: string }
        }>
        (new SalesService().EditReferenceState, {

            onSuccess: () => {
                queryClient.refetchQueries('remarks')
                queryClient.refetchQueries('references')
                setAlert({ message: "updated state", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { data: states } = useQuery<AxiosResponse<GetCrmStateDto[]>, BackendError>("crm_states", new AuthorizationService().GetAllStates)


    const formik = useFormik<{
        state: string,
        gst: string,
    }>({
        initialValues: {
            state: state || "open",
            gst: gst,
        },
        validationSchema: Yup.object({
            state: Yup.string().required("required field"),
            gst: Yup.string().required(),
        }),
        onSubmit: (values) => {
            mutate({
                body: {
                    state: values.state,
                    gst: values.gst
                }
            })
        }
    });



    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)

        }
    }, [isSuccess])
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack
                gap={2}
                pt={2}
            >

                < TextField

                    select


                    SelectProps={{
                        native: true
                    }}
                    focused

                    error={
                        formik.touched.state && formik.errors.state ? true : false
                    }
                    id="state"
                    label="State"
                    fullWidth
                    helperText={
                        formik.touched.state && formik.errors.state ? formik.errors.state : ""
                    }
                    {...formik.getFieldProps('state')}
                >
                    <option key={0} value={undefined}>
                        Select State
                    </option>
                    {
                        states?.data && states?.data.map(state => {
                            return (<option key={state._id} value={state.state}>
                                {toTitleCase(state.state)}
                            </option>)
                        })
                    }
                </TextField>

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default EditReferenceStateForm
