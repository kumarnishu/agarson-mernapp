import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { CreateOrEditDriverSystemDto, GetDriverSystemDto } from '../../../dtos/driver.dto';
import moment from 'moment';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { UserService } from '../../../services/UserServices';
import { FeatureService } from '../../../services/FeatureServices';


function CreateOrEditDriverSystemForm({ item, setDialog }: { item?: GetDriverSystemDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { data: users } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'driver_system_view', show_assigned_only: true }))
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, { body: CreateOrEditDriverSystemDto, id?: string }>
        (new FeatureService().CreateOrEditDriverSystem, {
            onSuccess: () => {
                queryClient.invalidateQueries('items')
                setAlert({ message: item ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik<CreateOrEditDriverSystemDto>({
        initialValues: {
            driver: item ? item.driver.id : "",
            date: item?.date ? moment(new Date(item?.date)).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"),
            remarks: item ? item.remarks : '',
            party: item ? item.party : '',
            billno: item ? item.billno : '',
            marka: item ? item.marka : '',
            transport: item ? item.transport : '',
        },
        validationSchema: Yup.object({
            driver: Yup.string().required("required field"),
            remarks: Yup.string(),
            billno: Yup.string().required(),
            party: Yup.string().required(),
            marka: Yup.string().required("required field"),
            transport: Yup.string().required('required')
        }),
        onSubmit: (values: CreateOrEditDriverSystemDto) => {
            if (item) {
                mutate({
                    id: item._id,
                    body: values
                })
            }
            else {

                mutate({
                    id: undefined,
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
                gap={2}
                pt={2}
            >
                < TextField
                    select
                    required
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.driver && formik.errors.driver ? true : false
                    }
                    id="driver"
                    label="Driver"
                    fullWidth
                    helperText={
                        formik.touched.driver && formik.errors.driver ? formik.errors.driver : ""
                    }
                    {...formik.getFieldProps('driver')}
                >
                    <option key={0} value={undefined}>
                    </option>
                    {
                        users && users.data && users.data.map(cat => {

                            return (<option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>)
                        })
                    }
                </TextField>
                <TextField
                    required
                    error={
                        formik.touched.party && formik.errors.party ? true : false
                    }
                    id="party"
                    label="Party"
                    fullWidth
                    helperText={
                        formik.touched.party && formik.errors.party ? formik.errors.party : ""
                    }
                    {...formik.getFieldProps('party')}
                />
                <TextField
                    required
                    error={
                        formik.touched.billno && formik.errors.billno ? true : false
                    }
                    id="billno"
                    label="Bill No"
                    fullWidth
                    helperText={
                        formik.touched.billno && formik.errors.billno ? formik.errors.billno : ""
                    }
                    {...formik.getFieldProps('billno')}
                />

                <TextField
                    required
                    error={
                        formik.touched.transport && formik.errors.transport ? true : false
                    }
                    id="transport"
                    label="Transport"
                    fullWidth
                    helperText={
                        formik.touched.transport && formik.errors.transport ? formik.errors.transport : ""
                    }
                    {...formik.getFieldProps('transport')}
                />

                <TextField
                    required
                    error={
                        formik.touched.marka && formik.errors.marka ? true : false
                    }
                    id="marka"
                    label="Marka"
                    fullWidth
                    helperText={
                        formik.touched.marka && formik.errors.marka ? formik.errors.marka : ""
                    }
                    {...formik.getFieldProps('marka')}
                />

                < TextField
                    focused
                    error={
                        formik.touched.remarks && formik.errors.remarks ? true : false
                    }
                    multiline
                    minRows={4}
                    id="remarks"
                    label="Remarks"
                    fullWidth
                    helperText={
                        formik.touched.remarks && formik.errors.remarks ? formik.errors.remarks : ""
                    }
                    {...formik.getFieldProps('remarks')}
                />
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : item ? 'Update' : 'Create'}
                </Button>
            </Stack>


        </form>
    )
}

export default CreateOrEditDriverSystemForm
