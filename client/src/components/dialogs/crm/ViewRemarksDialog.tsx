import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import DeleteRemarkDialog from './DeleteRemarkDialog'
import CreateOrEditRemarkDialog from './CreateOrEditRemarkDialog'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetRemarksDto } from '../../../dtos/crm-remarks.dto'
import { CrmService } from '../../../services/CrmService'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    id: string
}
function ViewRemarksDialog({ id, dialog, setDialog }: Props) {
    const [dialog1, setDialog1] = useState<string | undefined>()
    const [remark, setRemark] = useState<GetRemarksDto>()
    const [remarks, setRemarks] = useState<GetRemarksDto[]>()
    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", id], async () => new CrmService().GetRemarksHistory({ id: id }))


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
            open={dialog === 'ViewRemarksDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
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
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('activities_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setDialog1('DeleteRemarkDialog')
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by.label && new Date(item.created_date) > new Date(previous_date) && user?.assigned_permissions.includes('activities_edit') && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setDialog1('CreateOrEditRemarkDialog')

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                </Stack>
                {remark && <DeleteRemarkDialog dialog={dialog1} setDialog={setDialog1} remark={remark} />}
                {remark && <CreateOrEditRemarkDialog remark={remark} dialog={dialog1} setDialog={setDialog1} />}
            </DialogContent>

        </Dialog>
    )
}

export default ViewRemarksDialog