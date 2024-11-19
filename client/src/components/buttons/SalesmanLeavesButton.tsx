import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { useMutation } from "react-query"
import { useEffect, useState } from "react"
import { Button, CircularProgress, Stack } from "@mui/material"
import { Download, Upload } from "@mui/icons-material"
import styled from "styled-components"
import { saveAs } from 'file-saver';
import ExportToExcel from "../../utils/ExportToExcel"
import { queryClient } from "../../main"
import { BulkSalesManLeavesReportFromExcel } from "../../services/ExcelDbService"


const FileInput = styled.input`
background:none;
color:blue;
`


export function SalesmanLeavesButton() {
    const { data, mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (BulkSalesManLeavesReportFromExcel, { onSuccess: () => queryClient.refetchQueries('reports') })
    const [file, setFile] = useState<File | null>(null)



    function HandleExport() {
        saveAs(`/api/v1/download/template/salesmanleaves`)
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
            if (data.data.length > 0)
                ExportToExcel(data.data, "output.xlsx")
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
            <Button variant="outlined" startIcon={<Download />} onClick={() => HandleExport()}> Template</Button>
        </Stack>

    )
}