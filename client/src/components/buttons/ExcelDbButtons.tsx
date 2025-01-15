import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { useMutation } from "react-query"
import { useContext, useEffect, useState } from "react"
import { Button, CircularProgress, Stack, Typography } from "@mui/material"
import { Upload } from "@mui/icons-material"
import styled from "styled-components"
import ExportToExcel from "../../utils/ExportToExcel"
import { AlertContext } from "../../contexts/alertContext"
import { ExcelReportsService } from "../../services/ExcelReportsServices"


const FileInput = styled.input`
background:none;
color:blue;
`


export function ExcelDbButtons() {
    const { data, mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<any[]>, BackendError, FormData>
        (new ExcelReportsService().CreateExcelDBFromExcel)
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
                                       <Typography sx={{marginLeft:2}}>Upload Grp Excel</Typography>
                                   </Button>
                               </>
                       }
                   </>
                 
               </Stack>

    )
}