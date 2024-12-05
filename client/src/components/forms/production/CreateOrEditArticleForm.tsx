import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { CreateOrEditArticle } from '../../../services/ProductionServices';
import { GetArticleDto, CreateOrEditArticleDto } from '../../../dtos/article.dto';




function CreateOrEditArticleForm({ article,setDialog }: { article?: GetArticleDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>>  }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetArticleDto>, BackendError, {
            body: CreateOrEditArticleDto, id?: string
        }>
        (CreateOrEditArticle, {
            onSuccess: () => {
                queryClient.invalidateQueries('articles')
            }
        })


    const formik = useFormik({
        initialValues: {
            name: article ? article.name : "",
            display_name: article ? article.display_name : "",
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Required field'),
            display_name: Yup.string()
                .required('Required field'),


        }),
        onSubmit: (values) => {
            if (article)
                mutate({ id: article._id, body: { name: values.name, display_name: values.display_name } })
            else {
                mutate({ body: { name: values.name, display_name: values.display_name } })
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
                <TextField


                    required
                    fullWidth
                    error={
                        formik.touched.name && formik.errors.name ? true : false
                    }
                    id="name"
                    label="Name"
                    helperText={
                        formik.touched.name && formik.errors.name ? formik.errors.name : ""
                    }
                    {...formik.getFieldProps('name')}
                />
                <TextField


                    required
                    fullWidth
                    error={
                        formik.touched.display_name && formik.errors.display_name ? true : false
                    }
                    id="display_name"
                    label="Display Name"
                    helperText={
                        formik.touched.display_name && formik.errors.display_name ? formik.errors.display_name : ""
                    }
                    {...formik.getFieldProps('display_name')}
                />
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message={article ? "article updated" : "created"} color="success" />
                    ) : null
                }
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default CreateOrEditArticleForm
