import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import DeleteExcelDBRemarkDialog from './DeleteExcelDBRemarkDialog'
import CreateOrEditExcelDBRemarkDialog from './CreateOrEditExcelDBRemarkDialog'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetExcelDBRemarksHistory } from '../../../services/ExcelDbService'
import { GetExcelDBRemarksDto } from '../../../dtos'


function ViewExcelDBRemarksDialog({ id, obj }: { id: string, obj: string }) {
    const [display, setDisplay] = useState<boolean>(false)
    const [display2, setDisplay2] = useState<boolean>(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remark, setRemark] = useState<GetExcelDBRemarksDto>()
    const [remarks, setRemarks] = useState<GetExcelDBRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", id, obj], async () => GetExcelDBRemarksHistory(id, obj))


    const { user } = useContext(UserContext)
    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)

    useEffect(() => {
        if (isSuccess && data)
            setRemarks(data?.data)
    }, [isSuccess, data])

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.view_remarks ? true : false}
            onClose={() => setChoice({ type: LeadChoiceActions.close_lead })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: LeadChoiceActions.close_lead })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <p>{remarks && remarks[0] && remarks[0]?.obj && remarks[0]?.obj.slice(0, 25).toString() || "Remarks History"}</p>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solid grey' }}>
                                <p>{toTitleCase(item.created_by)} : {item.remark} </p>
                                <p>{item.next_date && `Next Call : ${item.next_date}`} </p>
                                <br></br>
                                <p>{item.created_date}</p>
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('activities_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setDisplay(true)
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by && new Date(item.created_date) > new Date(previous_date) && user?.assigned_permissions.includes('activities_edit') && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setDisplay2(true)

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                </Stack>
                {remark && <DeleteExcelDBRemarkDialog display={display} setDisplay={setDisplay} remark={remark} />}
                {remark && <CreateOrEditExcelDBRemarkDialog obj={obj} category={id}remark={remark} display={display2} setDisplay={setDisplay2} />}
            </DialogContent>

        </Dialog>
    )
}

export default ViewExcelDBRemarksDialog