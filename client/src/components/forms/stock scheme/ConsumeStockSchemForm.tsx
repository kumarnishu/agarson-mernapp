import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { StockSchmeService } from '../../../services/StockSchmeService';
import { CreateConsumeStockDto, GetArticleStockDto } from '../../../dtos/stock.scheme.dto';



function ConsumeStockSchemForm({ stock, setDialog }: { stock: GetArticleStockDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<any>, BackendError, {
            body: CreateConsumeStockDto
        }>
        (new StockSchmeService().ConsumeStock, {

            onSuccess: () => {
                queryClient.refetchQueries('stocks')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })

    const formik = useFormik({
        initialValues: {
            party: '',
            scheme: stock.scheme.id,
            article: stock.article,
            six: 0,
            seven: 0,
            eight: 0,
            nine: 0,
            ten: 0
        },
        validationSchema: Yup.object({
            scheme: Yup.string().required("required"),
            party: Yup.string().required("required"),
            article: Yup.string().required("required"),
            six: Yup.number().max(stock.six),
            seven: Yup.number().max(stock.seven),
            eight: Yup.number().max(stock.eight),
            nine: Yup.number().max(stock.nine),
            ten: Yup.number().max(stock.ten),

        }),
        onSubmit: (values) => {
            let data: CreateConsumeStockDto;
            if (values.six > 0) {
                data = {
                    scheme: values.scheme,
                    article: values.article,
                    party: values.party,
                    size: 6,
                    consumed: values.six
                }
                mutate({ body: data })
            }
            if (values.seven > 0) {
                data = {
                    scheme: values.scheme,
                    article: values.article,
                    party: values.party,
                    size: 7,
                    consumed: values.six
                }
                mutate({ body: data })
            }
            if (values.eight > 0) {
                data = {
                    scheme: values.scheme,
                    article: values.article,
                    party: values.party,
                    size: 8,
                    consumed: values.six
                }
                mutate({ body: data })
            }
            if (values.nine > 0) {
                data = {
                    scheme: values.scheme,
                    article: values.article,
                    party: values.party,
                    size: 9,
                    consumed: values.six
                }
                mutate({ body: data })
            }
            if (values.ten > 0) {
                data = {
                    scheme: values.scheme,
                    article: values.article,
                    party: values.party,
                    size: 10,
                    consumed: values.six
                }
                mutate({ body: data })
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

                <TextField required fullWidth error={formik.touched.party && formik.errors.party ? true : false} id="party" label="Party" helperText={formik.touched.party && formik.errors.party ? formik.errors.party : ""}    {...formik.getFieldProps('party')} />
                <TextField disabled required fullWidth error={formik.touched.article && formik.errors.article ? true : false} id="article" label="Article" helperText={formik.touched.article && formik.errors.article ? formik.errors.article : ""}    {...formik.getFieldProps('article')} />
                <TextField required fullWidth error={formik.touched.six && formik.errors.six ? true : false} id="six" label="6" helperText={formik.touched.six && formik.errors.six ? formik.errors.six : `Available : ${stock.six}`}    {...formik.getFieldProps('six')} />
                <TextField required fullWidth error={formik.touched.seven && formik.errors.seven ? true : false} id="seven" label="7" helperText={formik.touched.seven && formik.errors.seven ? formik.errors.seven : `Available : ${stock.seven}`}    {...formik.getFieldProps('seven')} />
                <TextField required fullWidth error={formik.touched.eight && formik.errors.eight ? true : false} id="eight" label="8" helperText={formik.touched.eight && formik.errors.eight ? formik.errors.eight : `Available : ${stock.eight}`}    {...formik.getFieldProps('eight')} />
                <TextField required fullWidth error={formik.touched.nine && formik.errors.nine ? true : false} id="nine" label="9" helperText={formik.touched.nine && formik.errors.nine ? formik.errors.nine : `Available : ${stock.nine}`}    {...formik.getFieldProps('nine')} />
                <TextField required fullWidth error={formik.touched.ten && formik.errors.ten ? true : false} id="ten" label="10" helperText={formik.touched.ten && formik.errors.ten ? formik.errors.ten : `Available : ${stock.ten}`}    {...formik.getFieldProps('ten')} />

                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default ConsumeStockSchemForm
