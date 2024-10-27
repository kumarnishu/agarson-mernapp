import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import {  ChoiceContext, MaintenanceChoiceActions } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { GetRemarksDto } from '../../../dtos/crm/crm.dto'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { ViewMaintenanceItemRemarkHistory } from '../../../services/MaintenanceServices'
import DeleteRemarkDialog from '../crm/DeleteRemarkDialog'



function ViewMaintenaceRemarkHistoryDialog({ id }: { id: string }) {
    const [display, setDisplay] = useState<boolean>(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remark, setRemark] = useState<GetRemarksDto>()
    const [remarks, setRemarks] = useState<GetRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", id], async () => ViewMaintenanceItemRemarkHistory({ id: id }))


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
            open={choice === MaintenanceChoiceActions.view_maintance_remarks ? true : false}
            onClose={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <p>{remarks && remarks[0] && remarks[0]?.lead_name && remarks[0]?.lead_name.slice(0, 25).toString() || "Remarks History"}</p>
                <span style={{ fontSize: '14px' }}>{remarks && remarks[0] && remarks[0]?.lead_mobile}</span>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solid grey' }}>
                                <p>{item.remark} </p>
                                <p>{item.remind_date && `Remind Date : ${item.remind_date}`} </p>
                                <br></br>
                                <p>{item.created_date}</p>
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('activities_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setDisplay(true)
                                        }}>
                                            Delete</IconButton>}
                                       
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                </Stack>
                {remark && <DeleteRemarkDialog display={display} setDisplay={setDisplay} remark={remark} />}
            </DialogContent>

        </Dialog>
    )
}

export default ViewMaintenaceRemarkHistoryDialog