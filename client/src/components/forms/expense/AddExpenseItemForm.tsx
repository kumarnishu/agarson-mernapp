import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';


import { DropdownService } from '../../../services/DropDownServices';
import { ExpenseService } from '../../../services/ExpenseService';
import { AlertContext } from '../../../contexts/alertContext';
import { IssueOrAddExpenseItemDto } from '../../../dtos/request/ExpenseDto';
import { DropDownDto } from '../../../dtos/response/DropDownDto';
import { GetExpenseItemDto } from '../../../dtos/response/ExpenseDto';


function AddExpenseItemForm({ item, setDialog }: { item: GetExpenseItemDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const [locations, setLocations] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, { body: IssueOrAddExpenseItemDto, id?: string }>
        (new ExpenseService().AddExpenseItem, {
            onSuccess: () => {
                queryClient.invalidateQueries('expense-store')
                setAlert({ message: 'successfull', color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const { data: locationsData, isSuccess: locationSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("expense_locations", new DropdownService().GetAllExpenseLocations)


    const formik = useFormik({
        initialValues: {
            stock: 1,
            price: item.price,
            remark: "",
            location: ""
        },
        validationSchema: Yup.object({
            location: Yup.string().required(),
            stock: Yup.number().max(item?.stock_limit || 0),
            price: Yup.number().max(item.price + item.pricetolerance),
            remark: Yup.string().required()
        }),
        onSubmit: (values) => {
            mutate({
                id: item._id,
                body: values
            })
        }
    });


    useEffect(() => {
        if (locationSuccess && locationsData) {
            setLocations(locationsData.data)
        }
    }, [locationsData])



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

                {item?.to_maintain_stock && <TextField
                    required={Boolean(item?.to_maintain_stock)}
                    error={
                        formik.touched.stock && formik.errors.stock ? true : false
                    }
                    type='number'
                    id="stock"
                    label="Qty To Add"
                    fullWidth
                    helperText={
                        formik.touched.stock && formik.errors.stock ? formik.errors.stock : `available stock : ${item.stock}`
                    }
                    {...formik.getFieldProps('stock')}
                />}


                < TextField
                    select
                    variant='filled'
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.location && formik.errors.location ? true : false
                    }
                    id="location"
                    label="From Location"
                    fullWidth
                    helperText={
                        formik.touched.location && formik.errors.location ? formik.errors.location : ""
                    }
                    {...formik.getFieldProps('location')}
                >
                    <option key={0} value={undefined}>
                    </option>
                    {
                        locations && locations.map(cat => {
                            if (cat.label !== 'store')
                                return (<option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>)
                        })
                    }
                </TextField>

                <TextField
                    required={Boolean(item?.to_maintain_stock)}
                    error={
                        formik.touched.price && formik.errors.price ? true : false
                    }
                    type='number'
                    id="price"
                    label="Std. Price"
                    fullWidth
                    helperText={
                        formik.touched.price && formik.errors.price ? formik.errors.price : `Standard price : ${item.price}`
                    }
                    {...formik.getFieldProps('price')}
                />
                <TextField
                    multiline
                    minRows={4}
                    required
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    autoFocus
                    id="remark"
                    label="Remark"
                    fullWidth
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />



                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : 'Add'}
                </Button>
            </Stack>


        </form>
    )
}

export default AddExpenseItemForm
