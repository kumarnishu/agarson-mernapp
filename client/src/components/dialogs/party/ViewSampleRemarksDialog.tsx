import { Dialog, DialogContent, IconButton, DialogTitle, Stack, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { PartyPageService } from '../../../services/PartyPageService'
import moment from 'moment'
import CreateOrEditSampleRemarkDialog from './CreateOrEditSampleRemarkDialog'
import DeleteSampleRemarkDialog from './DeleteSampleRemarkDialog'
import { GetSampleSystemRemarkDto } from '../../../dtos/RemarkDto'
import { GetSampleSystemDto } from '../../../dtos/PartyPageDto'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    sample: GetSampleSystemDto
}

function ViewSampleRemarksDialog({ sample, dialog, setDialog }: Props) {

    const [dialog2, setdialog2] = useState<string | undefined>()
    const [remark, setRemark] = useState<GetSampleSystemRemarkDto>()
    const [remarks, setRemarks] = useState<GetSampleSystemRemarkDto[]>()
    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", sample], async () => new PartyPageService().GetSampleRemarksHistory(sample._id))


    const { user } = useContext(UserContext)
    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)

    useEffect(() => {
        if (isSuccess && data)
            setRemarks(data?.data)
    }, [isSuccess, data])
    return (
        <Dialog
            open={dialog === "ViewSampleRemarksDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <p>Remarks</p>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <Stack gap={1} key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightgrey', paddingLeft: '20px', border: '1px solemployee grey' }}>
                                <p style={{ fontSize: 16, fontWeight: '400', letterSpacing: 1.2 }}>{toTitleCase(item.created_by.label || "")} : {toTitleCase(item.remark || "")} </p>
                                {item.next_call && <p>Next Call :  {moment(new Date(item.next_call)).format('MMMM Do YYYY')}</p>}
                                {item.created_at && <p>Timestamp : {moment(new Date(item.created_at)).format('MMMM Do YYYY, h:mm:ss a')}</p>}
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.role == 'admin' && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setdialog2('DeleteSampleRemarkDialog')
                                        }}>
                                            Delete</IconButton>}
                                        {user && user.assigned_permissions.includes('salesman_party_edit') && item.remark && user?.username === item.created_by.label && new Date(item.created_at) > new Date(previous_date) && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setdialog2('CreateOrEditSampleRemarkDialog')

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </Stack>

                        )
                    })}
                </Stack>
                {remark && <DeleteSampleRemarkDialog dialog={dialog2} setDialog={setdialog2} remark={remark} />}
                <CreateOrEditSampleRemarkDialog sample={sample} remark={remark} dialog={dialog2} setDialog={setdialog2} />
                <Button size="large" sx={{ mt: 2, p: 2 }} variant='contained' fullWidth onClick={() => {
                    setRemark(undefined)
                    setdialog2('CreateOrEditSampleRemarkDialog')

                }}>new Remark</Button>
            </DialogContent>
        </Dialog>
    )
}

export default ViewSampleRemarksDialog