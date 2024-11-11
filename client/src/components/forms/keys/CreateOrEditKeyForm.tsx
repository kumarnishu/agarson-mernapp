import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { CheckListChoiceActions, ChoiceContext } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import * as yup from 'yup';
import { DropDownDto, GetKeyDto } from '../../../dtos';
import { CreateOrEditKey, GetAllKeyCategories } from '../../../services/KeyServices';
import { toTitleCase } from '../../../utils/TitleCase';

function CreateOrEditKeyForm({ keyitm }: { keyitm?: GetKeyDto }) {
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string,
                category: string
            },
            id?: string
        }>
        (CreateOrEditKey, {
            onSuccess: () => {
                queryClient.invalidateQueries('keys')
            }
        })
    const { data, isSuccess: isSuccesskeysData } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_categories"], async () => GetAllKeyCategories())

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        category: string,
        key: string
    }>({
        initialValues: {
            key: keyitm ? keyitm.key : "",
            category: keyitm ? keyitm.category.id : "",
        },
        validationSchema: yup.object({
            key: yup.string().required(),
            category: yup.string().required()
        }),
        onSubmit: (values: {
            key: string,
            category: string,
        }) => {
            mutate({
                id: keyitm?._id,
                body: {
                    key: values.key,
                    category: values.category
                }
            })
        }
    });

    useEffect(() => {
        if (isSuccesskeysData && data) {
            setCategories(data.data);
        }
    }, [data, isSuccesskeysData]);

    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: CheckListChoiceActions.close_checklist })

        }
    }, [isSuccess, setChoice])
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack
                gap={2}
                pt={2}
            >
                <TextField
                    required
                    error={
                        formik.touched.key && formik.errors.key ? true : false
                    }
                    autoFocus
                    id="key"
                    label="Key"
                    fullWidth
                    helperText={
                        formik.touched.key && formik.errors.key ? formik.errors.key : ""
                    }
                    {...formik.getFieldProps('key')}
                />
                < TextField
                    select
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
                        Select Category
                    </option>
                    {
                        categories && categories.map(state => {
                            return (<option key={state.id} value={state.id}>
                                {state.label && toTitleCase(state.label)}
                            </option>)
                        })
                    }
                </TextField>


                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !keyitm ? "Add Key" : "Update Key"}
                </Button>
            </Stack>

            {
                isError ? (
                    <>
                        {<AlertBar message={error?.response.data.message} color="error" />}
                    </>
                ) : null
            }
            {
                isSuccess ? (
                    <>
                        {!keyitm ? <AlertBar message="new key created" color="success" /> : <AlertBar message="key updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditKeyForm
