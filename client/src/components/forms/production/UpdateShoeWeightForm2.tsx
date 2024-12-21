import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { months } from '../../../utils/months';
import UploadFileButton from '../../buttons/UploadFileButton';
import { GetUserDto } from '../../../dtos/user.dto';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { GetDyeDto } from '../../../dtos/dye.dto';
import { GetMachineDto } from '../../../dtos/machine.dto';
import { GetShoeWeightDto } from '../../../dtos/shoe-weight.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';
import { FeatureService } from '../../../services/FeatureServices';


function UpdateShoeWeightForm2({ shoe_weight, setDialog }: { shoe_weight: GetShoeWeightDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { data: dyes } = useQuery<AxiosResponse<GetDyeDto[]>, BackendError>("dyes", async () => new DropdownService().GetDyes())
    const [dyeid, setDyeid] = useState<string>('');
    const [articles, setArticles] = useState<DropDownDto[]>([])
    const { data: dyedata, isSuccess: isDyeSuccess, refetch: refetchDye } = useQuery<AxiosResponse<GetDyeDto>, BackendError>(["dye", dyeid], async () => new DropdownService().GetDyeById(dyeid), { enabled: false })
    const { data: machines } = useQuery<AxiosResponse<GetMachineDto[]>, BackendError>("machines", async () => new DropdownService().GetMachines())
    const [file, setFile] = useState<File>()

    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetUserDto>, BackendError, {
            id: string,
            body: FormData
        }>
        (new FeatureService().UpdateShoeWeight2, {
            onSuccess: () => {
                queryClient.refetchQueries('shoe_weights')
                setAlert({ message: "updated shoe weight 2", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik({
        initialValues: {
            machine: shoe_weight ? shoe_weight.machine.id : "",
            dye: shoe_weight ? shoe_weight.dye.id : "",
            month: shoe_weight ? shoe_weight.month : "",
            article: shoe_weight ? shoe_weight.article.id : "",
            weight: shoe_weight ? shoe_weight.shoe_weight2 : 0,
            std_weigtht: shoe_weight ? shoe_weight.std_weigtht : 0,
            upper_weight: shoe_weight ? shoe_weight.upper_weight2 : 0
        },
        validationSchema: Yup.object({
            weight: Yup.number().required("required weight"),
            machine: Yup.string().required("required machine"),
            upper_weight: Yup.number().required("required Upper Weight"),
            article: Yup.string().required("required article"),
            std_weigtht: Yup.number().required("required std Weight"),
            dye: Yup.string().required("required dye"),
            month: Yup.number().required("required clock in")

        }),
        onSubmit: (values) => {
            if (file) {
                let formdata = new FormData()
                let Data = {
                    weight: values.weight,
                    article: values.article,
                    month: values.month,
                    dye: values.dye,
                    upper_weight: values.upper_weight,
                    machine: values.machine
                }
                formdata.append("body", JSON.stringify(Data))
                formdata.append("media", file)
                mutate({ id: shoe_weight._id, body: formdata })
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
        if (formik.values.dye) {
            setDyeid(formik.values.dye)
        }
    }, [formik.values.dye])

    useEffect(() => {
        if (isDyeSuccess && dyedata && dyedata.data) {
            let tmp = dyedata.data.articles && dyedata.data.articles.map((a) => { return { id: a.id, label: a.label, value: a.label } })
            setArticles(tmp)
            dyedata.data.stdshoe_weight && formik.setValues({ ...formik.values, std_weigtht: dyedata.data.stdshoe_weight })
        }
        else {
            setArticles([])
            formik.setValues({ ...formik.values, std_weigtht: 0 })
        }
    }, [dyedata, isDyeSuccess])


    useEffect(() => {
        refetchDye()
    }, [dyeid])

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
                    {/* machine */}
                    < TextField
                        select

                        SelectProps={{
                            native: true,
                        }}
                        error={
                            formik.touched.machine && formik.errors.machine ? true : false
                        }
                        id="machine"
                        helperText={
                            formik.touched.machine && formik.errors.machine ? formik.errors.machine : ""
                        }
                        {...formik.getFieldProps('machine')}
                        required
                        label="Select Machine"
                        fullWidth
                    >
                        <option key={'00'} value={undefined}>
                        </option>
                        {
                            machines && machines.data && machines.data.map((machine, index) => {
                                return (<option key={index} value={machine._id}>
                                    {machine.display_name}
                                </option>)

                            })
                        }
                    </TextField>
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
                    {/* articles */}
                    < TextField
                        select

                        SelectProps={{
                            native: true,
                        }}
                        error={
                            formik.touched.article && formik.errors.article ? true : false
                        }
                        id="article"
                        helperText={
                            formik.touched.article && formik.errors.article ? formik.errors.article : ""
                        }
                        {...formik.getFieldProps('article')}
                        required
                        label="Select Article"
                        fullWidth
                    >
                        <option key={'00'} value={undefined}>
                        </option>
                        {
                            articles && articles.map((article, index) => {
                                return (<option key={index} value={article.id}>
                                    {article.label}
                                </option>)
                            })
                        }
                    </TextField>

                    <TextField
                        variant="outlined"
                        fullWidth
                        required
                        disabled
                        focused
                        label="Std Weight"
                        error={
                            formik.touched.std_weigtht && formik.errors.std_weigtht ? true : false
                        }
                        id="Std Weight"
                        helperText={
                            formik.touched.std_weigtht && formik.errors.std_weigtht ? formik.errors.std_weigtht : ""
                        }
                        {...formik.getFieldProps('std_weigtht')}
                    />
                    <TextField
                        variant="outlined"
                        fullWidth
                        required
                        focused
                        label="Upper Weight"
                        error={
                            formik.touched.upper_weight && formik.errors.upper_weight ? true : false
                        }
                        id="Upper Weight"
                        helperText={
                            formik.touched.upper_weight && formik.errors.upper_weight ? formik.errors.upper_weight : ""
                        }
                        {...formik.getFieldProps('upper_weight')}
                    />
                    <TextField
                        variant="outlined"
                        fullWidth
                        required
                        label="Shoe Weight"
                        error={
                            formik.touched.weight && formik.errors.weight ? true : false
                        }
                        id="weight"
                        helperText={
                            formik.touched.weight && formik.errors.weight ? formik.errors.weight : ""
                        }
                        {...formik.getFieldProps('weight')}
                    />
                    < TextField
                        select

                        SelectProps={{
                            native: true,
                        }}
                        error={
                            formik.touched.month && formik.errors.month ? true : false
                        }
                        id="month"
                        helperText={
                            formik.touched.month && formik.errors.month ? formik.errors.month : ""
                        }
                        {...formik.getFieldProps('month')}
                        required
                        label="Clock In"
                        fullWidth
                    >
                        <option key={'00'} value={undefined}>
                        </option>
                        {
                            months.map((month, index) => {
                                return (<option key={index} value={month.month}>
                                    {month.label}
                                </option>)
                            })
                        }
                    </TextField>
                    <UploadFileButton name="media" required={true} camera={true} isLoading={isLoading} label="Upload Shoe Weight Photo" file={file} setFile={setFile} disabled={isLoading} />

                    <Button size="large" variant="contained" color="primary" type="submit"
                        disabled={Boolean(isLoading)}
                        fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Update"}
                    </Button>
                </Stack>
            </Stack>
        </form >
    )
}

export default UpdateShoeWeightForm2
