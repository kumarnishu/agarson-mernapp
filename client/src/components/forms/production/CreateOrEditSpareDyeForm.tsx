import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import UploadFileButton from '../../buttons/UploadFileButton';
import { GetUserDto } from '../../../dtos/user.dto';
import { GetDyeLocationDto } from '../../../dtos/dye-location.dto';
import { GetDyeDto } from '../../../dtos/dye.dto';
import { GetSpareDyeDto } from '../../../dtos/spare-dye.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';
import { FeatureService } from '../../../services/FeatureServices';

function CreateOrEditSpareDyeForm({ sparedye, setDialog }: { sparedye?: GetSpareDyeDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { data: dyes } = useQuery<AxiosResponse<GetDyeDto[]>, BackendError>("dyes", async () => new DropdownService().GetDyes('false'))
    const { data: locations } = useQuery<AxiosResponse<GetDyeLocationDto[]>, BackendError>("locations", async () => new DropdownService().GetAllDyeLocations())
    const [file, setFile] = useState<File>()
    const [repairRequired, setRepairRequired] = useState(sparedye?.repair_required)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetUserDto>, BackendError, {
            id?: string,
            body: FormData
        }>
        (new FeatureService().CreateOrEditSpareDye, {
            onSuccess: () => {
                queryClient.refetchQueries('spare_dyes')
                setAlert({ message: sparedye ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })

        })


    const formik = useFormik({
        initialValues: {
            dye: sparedye ? sparedye.dye.id : "",
            location: sparedye ? sparedye.location.id : "",
            remarks: sparedye ? sparedye.remarks : "",
        },
        validationSchema: Yup.object({
            dye: Yup.string().required("required dye"),
            location: Yup.string().required("required location"),
            remarks: Yup.string().required("required remarks")

        }),
        onSubmit: (values) => {
            if (file) {
                let formdata = new FormData()
                let Data = {
                    dye: values.dye,
                    location: values.location,
                    remarks: values.remarks,
                    repair_required: repairRequired ? true : false,
                }
                formdata.append("body", JSON.stringify(Data))
                formdata.append("media", file)
                if (sparedye) {
                    mutate({ id: sparedye?._id, body: formdata })
                }
                else {
                    mutate({ body: formdata })
                }
                setFile(undefined)
            }
            else {

                console.log(formik.errors)
                alert("Upload a file")
            }

        }
    });

    useEffect(() => {
        if (file)
            setFile(file)
    }, [file])


    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                setDialog(undefined)
            }, 1000)
        }
    }, [isSuccess])
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack sx={{ direction: { xs: 'column', md: 'row' } }}>
                <Stack
                    direction="column"
                    gap={2}
                    sx={{ pt: 2 }}
                >
                    {/* dyes */}
                    < TextField
                        select

                        SelectProps={{
                            native: true,
                        }}
                        error={
                            formik.touched.dye && formik.errors.dye ? true : false
                        }
                        id="dye"
                        helperText={
                            formik.touched.dye && formik.errors.dye ? formik.errors.dye : ""
                        }
                        {...formik.getFieldProps('dye')}
                        required
                        label="Select Dye"
                        fullWidth
                    >
                        <option key={'00'} value={undefined}>
                        </option>
                        {
                            dyes && dyes.data && dyes.data.map((dye, index) => {
                                return (<option key={index} value={dye._id}>
                                    {dye.dye_number}
                                </option>)

                            })
                        }
                    </TextField>

                    {/* location */}
                    < TextField
                        select

                        SelectProps={{
                            native: true,
                        }}
                        error={
                            formik.touched.location && formik.errors.location ? true : false
                        }
                        id="location"
                        helperText={
                            formik.touched.location && formik.errors.location ? formik.errors.location : ""
                        }
                        {...formik.getFieldProps('location')}
                        required
                        label="Select location"
                        fullWidth
                    >
                        <option key={'00'} value={""}>
                        </option>
                        {
                            locations && locations.data && locations.data.map((location, index) => {
                                return (<option key={index} value={location._id}>
                                    {location.display_name}
                                </option>)

                            })
                        }
                    </TextField>

                    <FormGroup>
                        <FormControlLabel control={<Checkbox
                            checked={Boolean(repairRequired)}
                            onChange={() => setRepairRequired(!repairRequired)}
                        />} label="Needs Repair ?" />
                    </FormGroup>

                    <TextField
                        multiline
                        minRows={4}
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

                    <UploadFileButton name="media" required={true} camera={true} isLoading={isLoading} label="Upload Spare Dye Photo" file={file} setFile={setFile} disabled={isLoading} />

                    <Button size="large" variant="contained" color="primary" type="submit"
                        disabled={Boolean(isLoading)}
                        fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                    </Button>
                </Stack>
            </Stack>
        </form >
    )
}

export default CreateOrEditSpareDyeForm
