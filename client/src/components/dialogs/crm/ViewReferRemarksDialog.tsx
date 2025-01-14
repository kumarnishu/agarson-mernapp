import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { CrmService } from '../../../services/CrmService'
import { GetRemarksDto } from '../../../dtos/CrmDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    id: string
}

function ViewReferRemarksDialog({ id, dialog, setDialog }: Props) {
    const [remarks, setRemarks] = useState<GetRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", id], async () => new CrmService().GetReferRemarksHistory({ id: id }))


    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)

    useEffect(() => {
        if (isSuccess && data)
            setRemarks(data?.data)
    }, [isSuccess])
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'ViewReferRemarksDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <pre>{remarks && remarks[0] && remarks[0]?.lead_name && remarks[0]?.lead_name.slice(0, 25).toString() || "Remarks History"}</pre>
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