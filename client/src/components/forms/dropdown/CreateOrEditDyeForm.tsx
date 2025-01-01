import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { GetArticleDto } from '../../../dtos/article.dto';
import { GetDyeDto, CreateOrEditDyeDTo } from '../../../dtos/dye.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';


function CreateOrEditDyeForm({ dye, setDialog }: { dye?: GetDyeDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetDyeDto>, BackendError, {
            body: CreateOrEditDyeDTo, id?: string
        }>
        (new DropdownService().CreateOrEditDye, {

            onSuccess: () => {
                queryClient.refetchQueries('dyes')
                setAlert({ message: dye ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { data: articles, isLoading: articleLoading } = useQuery<AxiosResponse<GetArticleDto[]>, BackendError>("articles", async () => new DropdownService().GetArticles())

    const formik = useFormik({
        initialValues: {
            dye_number: dye ? dye.dye_number : 0,
            size: dye ? dye.size : "",
            st_weight: dye ? dye.stdshoe_weight : 0,
            articles: dye ? dye.articles && dye.articles.map((a) => { return a.id }) : []
        },
        validationSchema: Yup.object({
            dye_number: Yup.number()
                .required('Required field'),
            size: Yup.string()
                .required('Required field'),
            articles: Yup.array()
                .required('Required field'),
            st_weight: Yup.string()
                .required('Required field'),


        }),
        onSubmit: (values) => {
            if (dye)
                mutate({
                    id: dye._id, body: {
                        dye_number: values.dye_number,
                        size: values.size,
                        articles: values.articles,
                        st_weight: values.st_weight
                    }
                })
            else
                mutate({
                    body: {
                        dye_number: values.dye_number,
                        size: values.size,
                        articles: values.articles,
                        st_weight: values.st_weight
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

            {!articleLoading && <Stack
                direction="column"
                gap={2}
                pt={2}
            >
                <TextField
                    type="number"
                    required
                    fullWidth
                    error={
                        formik.touched.dye_number && formik.errors.dye_number ? true : false
                    }
                    id="dye_number"
                    label="Dye Number"
                    helperText={
                        formik.touched.dye_number && formik.errors.dye_number ? formik.errors.dye_number : ""
                    }
                    {...formik.getFieldProps('dye_number')}
                />
                <TextField
                    required
                    fullWidth
                    error={
                        formik.touched.size && formik.errors.size ? true : false
                    }
                    id="size"
                    label="Size"
                    helperText={
                        formik.touched.size && formik.errors.size ? formik.errors.size : ""
                    }
                    {...formik.getFieldProps('size')}
                />
                <TextField
                    required
                    fullWidth
                    error={
                        formik.touched.st_weight && formik.errors.st_weight ? true : false
                    }
                    id="st_weight"
                    type='number'
                    label="St Weight"
                    helperText={
                        formik.touched.st_weight && formik.errors.st_weight ? formik.errors.st_weight : ""
                    }
                    {...formik.getFieldProps('st_weight')}
                />

                < TextField
                    select
                    focused
                    SelectProps={{ native: true, multiple: true }}
                    error={
                        formik.touched.articles && formik.errors.articles ? true : false
                    }
                    id="articles"
                    helperText={
                        formik.touched.articles && formik.errors.articles ? formik.errors.articles : ""
                    }
                    {...formik.getFieldProps('articles')}
                    required
                    label="Select Articles"
                    fullWidth
                >
                    {
                        articles && articles.data && articles.data.map((article, index) => {
                            return (<option key={index} value={article && article._id}>
                                {article.display_name}
                            </option>)
                        })
                    }
                </TextField>

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>}
        </form>
    )
}

export default CreateOrEditDyeForm
