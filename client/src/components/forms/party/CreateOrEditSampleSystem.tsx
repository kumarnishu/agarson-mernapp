import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import moment from 'moment';
import { AlertContext } from '../../../contexts/alertContext';
import { PartyPageService } from '../../../services/PartyPageService';
import { CreateOrEditSampleSystemDto, GetSampleSystemDto, PartyListDto } from '../../../dtos/PartyPageDto'; 

function CreateOrEditSampleSystem({ sample, setDialog }: { sample?: GetSampleSystemDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { data: parties } = useQuery<AxiosResponse<PartyListDto[]>, BackendError>("parties", async () => new PartyPageService().GetPartyList())
    const [otherparty, setOtherParty] = useState(false)
    const { mutate, isLoading, isSuccess } = useMutation<AxiosResponse<GetSampleSystemDto>, BackendError, {
        sample?: GetSampleSystemDto,
        body: CreateOrEditSampleSystemDto
    }>(new PartyPageService().CreateOrEditSampleSystems, {
        onSuccess: () => {
            queryClient.refetchQueries('samples')
            setAlert({ message: sample ? "updated" : "created", color: 'success' })
        },
        onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
    
    })


    const formik = useFormik({
        initialValues: {
            date: sample ? moment(sample.date).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"),
            party: sample ? sample.party : '',
            state: sample ? sample.state : "",
            samples: sample ? sample.samples : "",
            stage: sample ? sample.stage : 'pending',
        },
        validationSchema: Yup.object({
            party: Yup.string()
                .required('Required field'),
            state: Yup.string()
                .required('Required field'),
            samples: Yup.string().required(),
            stage: Yup.string(),
            date: Yup.string().required('Required field'),
        }),
        onSubmit: (values) => {
            if (sample)
                mutate({
                    sample: sample,
                    body: values
                })
            else {
                mutate({
                    body: values

                })
            }
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
                direction="column"
                gap={2}
                pt={2}
            >

                {otherparty ? <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    error={
                        formik.touched.party && formik.errors.party ? true : false
                    }
                    id="party"
                    label="Party"
                    helperText={
                        formik.touched.party && formik.errors.party ? formik.errors.party : ""
                    }
                    {...formik.getFieldProps('party')}
                /> : < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.party && formik.errors.party ? true : false
                    }
                    id="party"
                    helperText={
                        formik.touched.party && formik.errors.party ? formik.errors.party : ""
                    }
                    {...formik.getFieldProps('party')}
                    required
                    label="Select Party"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>
                    </option>
                    {
                        parties && parties.data && parties.data.map((party, index) => {
                            return (<option key={index} value={party.party}>
                                {party.party}
                            </option>)

                        })
                    }
                </TextField>}

                {new Date(formik.values.date).getDay() == 0 && <FormGroup>
                    <FormControlLabel control={<Checkbox
                        checked={otherparty}
                        onChange={() => setOtherParty(!otherparty)}
                    />} label="Other Party" />
                </FormGroup>}

                < TextField
                    type="date"
                    focused
                    error={
                        formik.touched.date && formik.errors.date ? true : false
                    }
                    disabled={sample ? true : false}
                    id="date"
                    label="Date"
                    fullWidth
                    required
                    helperText={
                        formik.touched.date && formik.errors.date ? formik.errors.date : ""
                    }
                    {...formik.getFieldProps('date')}
                />
                < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.state && formik.errors.state ? true : false
                    }
                    id="state"
                    helperText={
                        formik.touched.state && formik.errors.state ? formik.errors.state : ""
                    }
                    {...formik.getFieldProps('state')}
                    required
                    label="Select State"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>
                    </option>
                    {
                        parties && parties.data && parties.data.map((party, index) => {
                            return (<option key={index} value={party.state}>
                                {party.state}
                            </option>)

                        })
                    }
                </TextField>
                < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.stage && formik.errors.stage ? true : false
                    }
                    id="stage"
                    helperText={
                        formik.touched.stage && formik.errors.stage ? formik.errors.stage : ""
                    }
                    {...formik.getFieldProps('stage')}
                    required
                    label="Stage"
                    fullWidth
                >
                    <option key={'pending'} value={'pending'}>
                        Pending
                    </option>
                    <option key={'approved'} value={'approved'}>
                        Approved
                    </option>
                    <option key={'rejected'} value={'rejected'}>
                        Rejected
                    </option>
                </TextField>
                <Button variant="contained" size="large" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default CreateOrEditSampleSystem
