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
import { AlertContext } from "../../contexts/alertContext"
import { StockSchmeService } from "../../services/StockSchmeService"
import { CreateKeyFromExcelDto } from "../../dtos/request/AuthorizationDto"


const FileInput = styled.input`
background:none;
color:blue;
`


export function StockSchemeButton({ schme }: { schme?: string }) {
    const { data, mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<CreateKeyFromExcelDto[]>, BackendError, FormData>
        (new StockSchmeService().CreateArticleStockFromExcel, { onSuccess: () => queryClient.refetchQueries('stocks') })
    const [file, setFile] = useState<File | null>(null)
    const { setAlert } = useContext(AlertContext)


    function HandleExport() {
        saveAs(`/api/v1/download/template/stock-schme`)
    }


    function handleFile() {
        if (file) {
            if (!schme)
                alert('Please select a scheme')
            let formdata = new FormData()
            schme && formdata.append('scheme', schme)
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
                        <CircularProgress />
                        :
                        <>
                            <Button
                                disabled={isLoading || !schme}
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