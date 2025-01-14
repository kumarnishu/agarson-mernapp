import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { useMutation } from "react-query"
import { useContext, useEffect, useState } from "react"
import { Button, CircularProgress, Stack } from "@mui/material"
import { Download, Upload } from "@mui/icons-material"
import styled from "styled-components"
import { saveAs } from 'file-saver';
import ExportToExcel from "../../utils/ExportToExcel"
import { queryClient } from "../../main"
import { convertDateToExcelFormat } from "../../utils/datesHelper"
import { AlertContext } from "../../contexts/alertContext"
import { AuthorizationService } from "../../services/AuthorizationService"
import { CreateKeyFromExcelDto } from "../../dtos/AuthorizationDto"


const FileInput = styled.input`
background:none;
color:blue;
`


export function KeyExcelButton({ category }: { category: string }) {
    const { data, mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<CreateKeyFromExcelDto[]>, BackendError, FormData>
        (new AuthorizationService().CreateKeysFromExcel, { onSuccess: () => queryClient.refetchQueries('keys') })
    const [file, setFile] = useState<File | null>(null)
    const { setAlert } = useContext(AlertContext)


    function HandleExport() {
        saveAs(`/api/v1/download/template/keys?category=${category}`)
    }


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
        if (isSuccess) {
            if (data.data.length > 0) {
                let refeineddata = data.data.map((dt) => {
                    return {
                        _id: dt._id,
                        serial_no: dt.serial_no,
                        key: dt.is_date_key ? convertDateToExcelFormat(dt.key) : dt.key,
                        type: dt.type,
                        category: dt.category,
                        is_date_key: dt.is_date_key,
                        status: dt.status
                    }
                })
                ExportToExcel(refeineddata, "output.xlsx")
            }
            setAlert({ message: 'File uploaded successfully', color: 'success' })
        }
    }, [isSuccess, data])

    return (
        <Stack direction={'row'} gap={1}>
            <>

                {
                    isLoading ?
                        <CircularProgress />
                        :
                        <>
                            <Button

                                component="label"
                                color="inherit"
                                variant="contained"
                            >
                                <Upload />
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
            <Button variant="contained" color="inherit" startIcon={<Download />} onClick={() => HandleExport()}> Template</Button>
        </Stack>

    )
}