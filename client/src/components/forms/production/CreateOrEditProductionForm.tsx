import { Button, Checkbox, CircularProgress, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { UserContext } from '../../../contexts/userContext';
import moment from 'moment';
import { AlertContext } from '../../../contexts/alertContext';
import { UserService } from '../../../services/UserServices';
import { DropdownService } from '../../../services/DropDownServices';
import { ProductionService } from '../../../services/ProductionService';
import { CreateOrEditProductionDto } from '../../../dtos/request/ProductionDto';
import { DropDownDto, GetMachineDto, GetArticleDto } from '../../../dtos/response/DropDownDto';
import { GetProductionDto } from '../../../dtos/response/ProductionDto';


function CreateOrEditProductionForm({ production, setDialog }: { production?: GetProductionDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { user } = useContext(UserContext)
    const { data: users } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, permission: 'production_view', show_assigned_only: true }))
    const { data: machines } = useQuery<AxiosResponse<GetMachineDto[]>, BackendError>("machines", async () => new DropdownService().GetMachines())
    const { data: articles } = useQuery<AxiosResponse<GetArticleDto[]>, BackendError>("articles", async () => new DropdownService().GetArticles())
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetProductionDto>, BackendError, {
            id?: string,
            body: CreateOrEditProductionDto
        }>
        (new ProductionService().CreateOrEditProduction, {
            onSuccess: () => {
                queryClient.refetchQueries('productions')
                setAlert({ message: production ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik({
        initialValues: {
            machine: production ? production.machine.id : "",
            thekedar: production ? production.thekedar.id : "",
            production_hours: production ? production.production_hours : 0,
            articles: production ? production.articles.map((a) => { return a.id }) : [],
            manpower: production ? production.manpower : 0,
            production: production ? production.production : 0,
            big_repair: production ? production.big_repair : 0,
            upper_damage: production ? production.upper_damage : 0,
            small_repair: production ? production.small_repair : 0,
            date: production ? moment(production.date).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD")
        },
        validationSchema: Yup.object({
            machine: Yup.string()
                .required('Required field'),
            thekedar: Yup.string()
                .required('Required field'),
            articles: Yup.array()
                .required('Required field'),
            manpower: Yup.number()
                .required('Required field'),
            production_hours: Yup.number()
                .required('Required field'),
            production: Yup.number()
                .required('Required field'),
            big_repair: Yup.number()
                .required('Required field'),
            upper_damage: Yup.number()
                .required('Required field'),
            small_repair: Yup.number()
                .required('Required field'),
            date: Yup.string().required('Required field'),
        }),
        onSubmit: (values) => {
            if (production)
                mutate({
                    id: production._id,
                    body: values
                })
            else {
                mutate({
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
                direction="column"
                gap={2}
                pt={2}
            >
                < TextField
                    type="date"
                    disabled={production ? true : false}
                    focused
                    error={
                        formik.touched.date && formik.errors.date ? true : false
                    }
                    id="date"
                    label="Production Date"
                    fullWidth
                    required
                    helperText={
                        formik.touched.date && formik.errors.date ? formik.errors.date : ""
                    }
                    {...formik.getFieldProps('date')}
                />
                < TextField
                    select

                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.machine && formik.errors.machine ? true : false
                    }
                    disabled={production ? true : false}
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
                {user?.assigned_users && user?.assigned_users.length > 0 && < TextField
                    select

                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.thekedar && formik.errors.thekedar ? true : false
                    }
                    id="thekedar"
                    helperText={
                        formik.touched.thekedar && formik.errors.thekedar ? formik.errors.thekedar : ""
                    }
                    {...formik.getFieldProps('thekedar')}
                    required
                    label="Select Thekedar"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>

                    </option>
                    {
                        users && users.data.map((user, index) => {
                            return (<option key={index} value={user.id}>
                                {user.label}
                            </option>)

                        })
                    }
                </TextField>}
                {/* articles */}

                <InputLabel id="demo-multiple-checkbox-label">Articles</InputLabel>
                <Select
                    label="Articles"
                    fullWidth
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    input={<OutlinedInput label="Article" />}
                    renderValue={() => `${formik.values.articles.length} articles`}
                    {...formik.getFieldProps('articles')}
                >
                    {articles && articles.data && articles.data.map((article) => (
                        <MenuItem key={article._id} value={article._id}>
                            <Checkbox checked={formik.values.articles.includes(article._id)} />
                            <ListItemText primary={article.name} />
                        </MenuItem>
                    ))}
                </Select>


                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.manpower && formik.errors.manpower ? true : false
                    }
                    id="manpower"
                    label="Man Power"
                    helperText={
                        formik.touched.manpower && formik.errors.manpower ? formik.errors.manpower : ""
                    }
                    {...formik.getFieldProps('manpower')}
                />
                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.production_hours && formik.errors.production_hours ? true : false
                    }
                    id="production_hours"
                    label="Production Hours"
                    helperText={
                        formik.touched.production_hours && formik.errors.production_hours ? formik.errors.production_hours : ""
                    }
                    {...formik.getFieldProps('production_hours')}
                />
                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.production && formik.errors.production ? true : false
                    }
                    id="production"
                    label="Production"
                    helperText={
                        formik.touched.production && formik.errors.production ? formik.errors.production : ""
                    }
                    {...formik.getFieldProps('production')}
                />
                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.big_repair && formik.errors.big_repair ? true : false
                    }
                    id="big_repair"
                    label="Big Repair"
                    helperText={
                        formik.touched.big_repair && formik.errors.big_repair ? formik.errors.big_repair : ""
                    }
                    {...formik.getFieldProps('big_repair')}
                />
                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.upper_damage && formik.errors.upper_damage ? true : false
                    }
                    id="upper_damage"
                    label="Upper Damage"
                    helperText={
                        formik.touched.upper_damage && formik.errors.upper_damage ? formik.errors.upper_damage : ""
                    }
                    {...formik.getFieldProps('upper_damage')}
                />
                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.small_repair && formik.errors.small_repair ? true : false
                    }
                    id="small_repair"
                    label="Small Repair"
                    helperText={
                        formik.touched.small_repair && formik.errors.small_repair ? formik.errors.small_repair : ""
                    }
                    {...formik.getFieldProps('small_repair')}
                />


                <Button variant="contained" size="large" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default CreateOrEditProductionForm
