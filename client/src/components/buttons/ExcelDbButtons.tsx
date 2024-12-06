import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { useMutation } from "react-query"
import { useContext, useEffect, useState } from "react"
import { Button, CircularProgress, Stack, Typography } from "@mui/material"
import { Upload } from "@mui/icons-material"
import styled from "styled-components"
import { CreateExcelDBFromExcel } from "../../services/ExcelDbService"
import ExportToExcel from "../../utils/ExportToExcel"
import { AlertContext } from "../../contexts/alertContext"


const FileInput = styled.input`
background:none;
color:blue;
`


export function ExcelDbButtons() {
    const { data, mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (CreateExcelDBFromExcel)
    const [file, setFile] = useState<File | null>(null)
    const { setAlert } = useContext(AlertContext)

    function handleFile() {
        if (file) {
            let formdata = new FormData()
            formdata.append('excel', file)
            mutate(formdata)
        }
    }
    useEffect(() => {
        if (file) {
            handleFile()
        }
    }, [file])

    useEffect(() => {
        if (isSuccess && data && data.data.length == 0) {
            alert("uploaded success")
        }
    }, [isSuccess, data])

    useEffect(() => {
        if (isSuccess && data) {
            if (data.data.length > 0) {
                ExportToExcel(data.data, "output.xlsx")
            }
            setAlert({ message: 'File uploaded successfully', color: 'success' })
        }
    }, [isSuccess, data])


    return (
        <Stack direction={'row'} gap={1}>
            <>

                {
                    isLoading ?
                        <Stack direction={'row'} gap={2} >
                            <CircularProgress sx={{ height: 15 }} />
                            <Typography variant="h6">Uploading Excel file ...</Typography>
                        </Stack>
                        :
                        <>
                            <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                sx={{ py: 1 }}
                                color="error"
                            >
                                <Upload sx={{ mr: 2 }} /> {`  Upload Grp Excel !!`}
                                <FileInput
                                    id="upload_input"
                                    hidden
                                    type="file" required name="file" onChange={
                                        (e: any) => {
                                            if (e.currentTarget.files) {
                                                setFile(e.currentTarget.files[0])
                                            }
                                        }}>
                                </FileInput >
                            </Button>
                        </>
                }
            </>
        </Stack>

    )
}