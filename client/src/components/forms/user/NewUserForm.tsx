import { Visibility, VisibilityOff } from '@mui/icons-material';
import {  Button, CircularProgress, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect,  useState } from 'react';
import {  useMutation } from 'react-query';
import * as Yup from "yup"
import { UserService } from '../../../services/UserServices';
import { BackendError, Target } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { GetUserDto } from '../../../dtos/UserDto';



type TformData = {
    username: string,
    alias1: string,
    alias2: string,
    email: string,
    password: string,
    mobile: string,
    dp: string | Blob | File
}

function NewUserForm({setDialog}:{setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
     const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<GetUserDto>, BackendError, FormData>
        (new UserService().NewUser,{
           onSuccess: () => {
            queryClient.invalidateQueries('users')
            setAlert({ message: 'created new user', color: 'success' })
          },
          onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik<TformData>({
        initialValues: {
            username: '',
            alias1: '',
            alias2: '',
            email: '',
            mobile: '',
            password: '',
            dp: ''
        },
        validationSchema: Yup.object({
            alias1: Yup
                .string(),
            alias2: Yup
                .string(),
            username: Yup.string()
                .required('Required field')
                .min(4, 'Must be 4 characters or more')
                .max(30, 'Must be 30 characters or less'),
            email: Yup.string()
                .email('provide a valid email id')
                .required('Required field'),
            password: Yup.string()
                .min(6, 'Must be 6 characters or more')
                .max(30, 'Must be 30 characters or less')
                .required('Required field'),
            mobile: Yup.string()
                .min(10, 'Must be 10 digits')
                .max(10, 'Must be 10 digits')
                .required('Required field'),
            dp: Yup.mixed<File>()
                .test("size", "size is allowed only less than 10mb",
                    file => {
                        if (file)
                            if (!file.size) //file not provided
                                return true
                            else
                                return Boolean(file.size <= 20 * 1024 * 1024)
                        return true
                    }
                )
                .test("type", " allowed only .jpg, .jpeg, .png, .gif images",
                    file => {
                        const Allowed = ["image/png", "image/jpg", "image/jpeg", "image/png", "image/gif"]
                        if (file)
                            if (!file.size) //file not provided
                                return true
                            else
                                return Boolean(Allowed.includes(file.type))
                        return true
                    }
                )
        }),
        onSubmit: (values: TformData) => {
            let formdata = new FormData()
            formdata.append("username", values.username)
            formdata.append("alias1", values.alias1)
            formdata.append("alias2", values.alias2)
            formdata.append("email", values.email)
            formdata.append("password", values.password)
            formdata.append("mobile", values.mobile)
            formdata.append("dp", values.dp)
            mutate(formdata)
        }
    });

    const [visiblity, setVisiblity] = useState(false);
    const handlePasswordVisibility = () => {
        setVisiblity(!visiblity);
    };
    const handleMouseDown = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
    };

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
                    
                    fullWidth
                    required
                    error={
                        formik.touched.username && formik.errors.username ? true : false
                    }
                    id="username"
                    label="Username"
                    helperText={
                        formik.touched.username && formik.errors.username ? formik.errors.username : ""
                    }
                    {...formik.getFieldProps('username')}
                /> <TextField


                    fullWidth
                    error={
                        formik.touched.alias1 && formik.errors.alias1 ? true : false
                    }
                    id="alias1"
                    label="Alias1"
                    helperText={
                        formik.touched.alias1 && formik.errors.alias1 ? formik.errors.alias1 : ""
                    }
                    {...formik.getFieldProps('alias1')}
                />
                <TextField


                    fullWidth
                    error={
                        formik.touched.alias2 && formik.errors.alias2 ? true : false
                    }
                    id="alias2"
                    label="Alias2"
                    helperText={
                        formik.touched.alias2 && formik.errors.alias2 ? formik.errors.alias2 : ""
                    }
                    {...formik.getFieldProps('alias2')}
                />
                <TextField
                    
                    
                    required
                    fullWidth
                    error={
                        formik.touched.email && formik.errors.email ? true : false
                    }
                    id="email"
                    label="Email"
                    helperText={
                        formik.touched.email && formik.errors.email ? formik.errors.email : ""
                    }
                    {...formik.getFieldProps('email')}
                />
                <TextField
                    
                    
                    required
                    error={
                        formik.touched.password && formik.errors.password ? true : false
                    }
                    id="password"
                    label="Password"
                    fullWidth
                    helperText={
                        formik.touched.password && formik.errors.password ? formik.errors.password : ""
                    }
                    type={visiblity ? "text" : "password"}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handlePasswordVisibility}
                                    onMouseDown={(e) => handleMouseDown(e)}
                                >
                                    {visiblity ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    {...formik.getFieldProps('password')}
                />
                <TextField
                    
                    type="number"
                    required
                    fullWidth
                    error={
                        formik.touched.mobile && formik.errors.mobile ? true : false
                    }
                    id="mobile"
                    label="Mobile"
                    helperText={
                        formik.touched.mobile && formik.errors.mobile ? formik.errors.mobile : ""
                    }
                    {...formik.getFieldProps('mobile')}
                />
                <TextField
                    fullWidth
                    error={
                        formik.touched.dp && formik.errors.dp ? true : false
                    }
                    helperText={
                        formik.touched.dp && formik.errors.dp ? String(formik.errors.dp) : ""
                    }
                    label="Display Picture"
                    focused
                    
                    type="file"
                    name="dp"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                        e.preventDefault()
                        const target: Target = e.currentTarget
                        let files = target.files
                        if (files) {
                            let file = files[0]
                            formik.setFieldValue("dp", file)
                        }
                    }}
                />
               
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default NewUserForm
