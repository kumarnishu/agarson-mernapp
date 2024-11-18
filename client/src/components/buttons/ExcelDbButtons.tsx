import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { useMutation } from "react-query"
import { useEffect, useState } from "react"
import { Button, CircularProgress, Stack } from "@mui/material"
import { Upload } from "@mui/icons-material"
import styled from "styled-components"
import { CreateExcelDBFromExcel } from "../../services/ExcelDbService"
import ExportToExcel from "../../utils/ExportToExcel"


const FileInput = styled.input`
background:none;
color:blue;
`


export function ExcelDbButtons() {
    const { data, mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (CreateExcelDBFromExcel)
    const [file, setFile] = useState<File | null>(null)


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
                                variant="text"
                                color="inherit"
                            >
                                <Upload sx={{mr:2}}/> {`  Upload Grp Excel`}
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