import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { SaleChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetVisitSummaryReportRemarkDto } from '../../../dtos'
import { GetVisitReportRemarksHistory } from '../../../services/SalesServices'
import DeleteVisitRemarkDialog from './DeleteVisitRemarkDialog'
import CreateOrEditVisitReportRemarkDialog from './CreateOrEditVisitReportRemarkDialog'


function ViewVisitReportRemarksDialog({ employee, visit_date }: { employee: string, visit_date: string }) {
    const [display, setDisplay] = useState<boolean>(false)
    const [display2, setDisplay2] = useState<boolean>(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remark, setRemark] = useState<GetVisitSummaryReportRemarkDto>()
    const [remarks, setRemarks] = useState<GetVisitSummaryReportRemarkDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", employee, visit_date], async () => GetVisitReportRemarksHistory(employee, visit_date))


    const { user } = useContext(UserContext)
    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)

    useEffect(() => {
        if (isSuccess && data)
            setRemarks(data?.data)
    }, [isSuccess, data])
    console.log(data)
    return (
        <Dialog
            open={choice === SaleChoiceActions.view_visit_remarks ? true : false}
            onClose={() => setChoice({ type: SaleChoiceActions.close_sale })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: SaleChoiceActions.close_sale })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <p>Remarks History</p>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solemployee grey' }}>
                                <p>{toTitleCase(item.created_by)} : {item.remark} </p>
                               
                                {item.created_at && <p>{new Date(item.created_at).toLocaleString()}</p>}
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('activities_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setDisplay(true)
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by && new Date(item.created_at) > new Date(previous_date) && user?.assigned_permissions.includes('activities_edit') && <IconButton size="small" color="success"
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
                {remark && <DeleteVisitRemarkDialog display={display} setDisplay={setDisplay} remark={remark} />}
                {remark && <CreateOrEditVisitReportRemarkDialog visit_date={visit_date} employee={employee} remark={remark} display={display2} setDisplay={setDisplay2} />}
            </DialogContent>

        </Dialog>
    )
}

export default ViewVisitReportRemarksDialog