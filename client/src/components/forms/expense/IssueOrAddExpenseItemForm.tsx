import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { DropDownDto } from '../../../dtos/dropdown.dto';
import { AlertContext } from '../../../contexts/alertContext';
import { IssueOrAddExpenseItemDto, GetExpenseItemDto } from '../../../dtos/expense-item.dto';
import { GetAllExpenseLocations, IssueOrAddExpenseItem } from '../../../services/ExpenseServices';


function IssueOrAddExpenseItemForm({ item, setDialog, val }: { item: GetExpenseItemDto, val: string, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const [locations, setLocations] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, { body: IssueOrAddExpenseItemDto, id?: string, val: string }>
        (IssueOrAddExpenseItem, {
            onSuccess: () => {
                queryClient.invalidateQueries('items')
                setAlert({ message: item ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const { data: locationsData, isSuccess: locationSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("expense_locations", GetAllExpenseLocations)


    const formik = useFormik<IssueOrAddExpenseItemDto>({
        initialValues: {
            location: "",
            stock: 0,
        },
        validationSchema: Yup.object({
            location: Yup.string(),
            stock: Yup.number().max(item.stock)
        }),
        onSubmit: (values: IssueOrAddExpenseItemDto) => {
            mutate({
                id: item._id,
                body: values,
                val: val
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

                <TextField
                    required={Boolean(item?.to_maintain_stock)}
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
                />


                {val == 'issue' && < TextField
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
                    label="Location"
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

                            return (<option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>)
                        })
                    }
                </TextField>}




                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : item ? 'Update' : 'Create'}
                </Button>
            </Stack>


        </form>
    )
}

export default IssueOrAddExpenseItemForm
