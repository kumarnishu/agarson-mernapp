import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import DeleteRemarkDialog from './DeleteRemarkDialog'
import CreateOrEditRemarkDialog from './CreateOrEditRemarkDialog'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { GetRemarksDto } from '../../../dtos'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetRemarksHistory } from '../../../services/LeadsServices'


function ViewRemarksDialog({ id }: { id: string }) {
    const [display, setDisplay] = useState<boolean>(false)
    const [display2, setDisplay2] = useState<boolean>(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remark, setRemark] = useState<GetRemarksDto>()
    const [remarks, setRemarks] = useState<GetRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", id], async () => GetRemarksHistory({ id: id }))


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
                <p>{remarks && remarks[0] && remarks[0]?.lead_name && remarks[0]?.lead_name.slice(0, 25).toString() || "Remarks History"}</p>
                <span style={{ fontSize: '14px' }}>{remarks && remarks[0] && remarks[0]?.lead_mobile}</span>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solid grey' }}>
                                <p>{toTitleCase(item.created_by.value)} : {item.remark} </p>
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
                                        {user && item.remark && user?.username === item.created_by.value && new Date(item.created_date) > new Date(previous_date) &&user?.assigned_permissions.includes('activities_edit') && <IconButton size="small" color="success"
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
                {remark && <DeleteRemarkDialog display={display} setDisplay={setDisplay} remark={remark} />}
                {remark && <CreateOrEditRemarkDialog remark={remark} display={display2} setDisplay={setDisplay2} />}
            </DialogContent>

        </Dialog>
    )
}

export default ViewRemarksDialog