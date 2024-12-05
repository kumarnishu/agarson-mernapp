import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetReferRemarksHistory } from '../../../services/LeadsServices'
import { GetRemarksDto } from '../../../dtos/crm-remarks.dto'



function ViewReferRemarksDialog({ id }: { id: string }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remarks, setRemarks] = useState<GetRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", id], async () => GetReferRemarksHistory({ id: id }))


    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)

    useEffect(() => {
        if (isSuccess && data)
            setRemarks(data?.data)
    }, [isSuccess])
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.view_refer_remarks ? true : false}
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
                                <p>{toTitleCase(item.created_by.label)} : {item.remark} </p>
                                <p>{item.remind_date && `Remind Date : ${item.remind_date}`} </p>
                                <br></br>
                                <p>{item.created_date}</p>
                               
                            </div>

                        )
                    })}
                </Stack>
            </DialogContent>

        </Dialog>
    )
}

export default ViewReferRemarksDialog