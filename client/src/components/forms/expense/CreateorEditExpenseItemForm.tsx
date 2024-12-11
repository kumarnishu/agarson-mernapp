import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { CreateOrEditExpenseItemDto, GetExpenseItemDto } from '../../../dtos/expense-item.dto';
import { CreateOrEditExpenseItem, GetAllExpenseCategories, GetAllItemUnits } from '../../../services/ExpenseServices';


function CreateorEditExpenseItemForm({ item, setDialog }: { item?: GetExpenseItemDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const [units, setUnits] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, { body: CreateOrEditExpenseItemDto, id?: string }>
        (CreateOrEditExpenseItem, {
            onSuccess: () => {
                queryClient.invalidateQueries('items')
                setAlert({ message: item ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const { data: categoriesData, isSuccess: categorySuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("expense_categories", GetAllExpenseCategories)
    const { data: unitsData, isSuccess: unitsSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("units", GetAllItemUnits)

    const formik = useFormik<CreateOrEditExpenseItemDto>({
        initialValues: {
            category: item ? item.category.id : "",
            item: item ? item.item : "",
            price: item ? item.price : 0,
            pricetolerance: item ? item.pricetolerance : 0,
            stock_limit: item ? item.stock_limit : 0,
            unit: item ? item.unit.id : "",
            to_maintain_stock: item ? item.to_maintain_stock : false,
            stock: item ? item.stock : 0,
        },
        validationSchema: Yup.object({
            category: Yup.string().required("required field"),
            price: Yup.number().required(),
            stock_limit: Yup.number().required(),
            pricetolerance: Yup.number().required(),
            item: Yup.string().required("required field"),
            unit: Yup.string().required(),
            stock: Yup.number()
        }),
        onSubmit: (values: CreateOrEditExpenseItemDto) => {
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
        if (categorySuccess && categoriesData) {
            setCategories(categoriesData.data)
        }
    }, [categoriesData])

    useEffect(() => {
        if (unitsSuccess && unitsData) {
            setUnits(unitsData.data)
        }
    }, [unitsData])

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
                {/* titles */}
                <TextField
                    required
                    error={
                        formik.touched.item && formik.errors.item ? true : false
                    }
                    id="item"
                    label="Item"
                    fullWidth
                    helperText={
                        formik.touched.item && formik.errors.item ? formik.errors.item : ""
                    }
                    {...formik.getFieldProps('item')}
                />
                <FormGroup>
                    <FormControlLabel control={<Checkbox
                        disabled={item ? true : false}
                        checked={formik.values.to_maintain_stock}
                        {...formik.getFieldProps('to_maintain_stock')}
                    />} label="Maintain Stock" />
                </FormGroup>




                {formik.values.to_maintain_stock && <TextField
                    required
                    error={
                        formik.touched.stock && formik.errors.stock ? true : false
                    }
                    id="stock"
                    label="Stock"
                    fullWidth
                    helperText={
                        formik.touched.stock && formik.errors.stock ? formik.errors.stock : ""
                    }
                    {...formik.getFieldProps('stock')}
                />}
                <TextField
                    required
                    error={
                        formik.touched.price && formik.errors.price ? true : false
                    }
                    id="price"
                    label="Price"
                    fullWidth
                    helperText={
                        formik.touched.price && formik.errors.price ? formik.errors.price : ""
                    }
                    {...formik.getFieldProps('price')}
                />
                <TextField
                    required
                    error={
                        formik.touched.pricetolerance && formik.errors.pricetolerance ? true : false
                    }
                    id="pricetolerance"
                    label="Price Tolerance"
                    fullWidth
                    helperText={
                        formik.touched.pricetolerance && formik.errors.pricetolerance ? formik.errors.pricetolerance : ""
                    }
                    {...formik.getFieldProps('pricetolerance')}
                />
                {formik.values.to_maintain_stock && <TextField
                    required
                    error={
                        formik.touched.stock_limit && formik.errors.stock_limit ? true : false
                    }
                    id="stock_limit"
                    label="Stock Limit"
                    fullWidth
                    helperText={
                        formik.touched.stock_limit && formik.errors.stock_limit ? formik.errors.stock_limit : ""
                    }
                    {...formik.getFieldProps('stock_limit')}
                />}
                < TextField
                    select
                    required
                    variant='filled'
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.category && formik.errors.category ? true : false
                    }
                    id="category"
                    label="Category"
                    fullWidth
                    helperText={
                        formik.touched.category && formik.errors.category ? formik.errors.category : ""
                    }
                    {...formik.getFieldProps('category')}
                >
                    <option key={0} value={undefined}>
                    </option>
                    {
                        categories && categories.map(cat => {

                            return (<option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>)
                        })
                    }
                </TextField>
                < TextField
                    select
                    variant='filled'
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.unit && formik.errors.unit ? true : false
                    }
                    required
                    id="unit"
                    label="Unit"
                    fullWidth
                    helperText={
                        formik.touched.unit && formik.errors.unit ? formik.errors.unit : ""
                    }
                    {...formik.getFieldProps('unit')}
                >
                    <option key={0} value={undefined}>
                    </option>
                    {
                        units && units.map(cat => {

                            return (<option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>)
                        })
                    }
                </TextField>




                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : item ? 'Update' : 'Create'}
                </Button>
            </Stack>


        </form>
    )
}

export default CreateorEditExpenseItemForm
