import { Dialog, DialogContent, IconButton, DialogTitle, Stack, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import DeletePartyremarkDialog from './DeletePartyremarkDialog'
import CreateOrEditPartyRemarkDialog from './CreateOrEditPartyRemarkDialog'
import { PartyPageService } from '../../../services/PartyPageService'
import { GetPartyRemarkDto } from '../../../dtos/PartyPageDto'
import moment from 'moment'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string
}

function ViewPartyRemarksDialog({ party, dialog, setDialog }: Props) {

    const [dialog2, setdialog2] = useState<string | undefined>()
    const [remark, setRemark] = useState<GetPartyRemarkDto>()
    const [remarks, setRemarks] = useState<GetPartyRemarkDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", party], async () => new PartyPageService().GetPartyLast5Remarks(party))


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
            open={dialog === "ViewPartyRemarksDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <p>Last 5 Remarks</p>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <Stack gap={1} key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solemployee grey' }}>
                                <p style={{ fontSize: 16, fontWeight: 'bold' }}>{toTitleCase(item.created_by.label || "")} : {toTitleCase(item.remark || "")} </p>
                                {item.nextcall && <p>Next Call :  {moment(new Date(item.nextcall)).format('MMMM Do YYYY')}</p>}
                                {item.created_at && <p>Timestamp : {moment(new Date(item.created_at)).format('MMMM Do YYYY, h:mm:ss a')}</p>}
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.role == 'admin' && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setdialog2('DeletePartyremarkDialog')
                                        }}>
                                            Delete</IconButton>}
                                        {user && user.assigned_permissions.includes('salesman_party_edit') && item.remark && user?.username === item.created_by.label && new Date(item.created_at) > new Date(previous_date) && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setdialog2('CreateOrEditPartyRemarkDialog')

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </Stack>

                        )
                    })}
                </Stack>
                {remark && <DeletePartyremarkDialog dialog={dialog2} setDialog={setdialog2} remark={remark} />}
                <CreateOrEditPartyRemarkDialog party={party} remark={remark} dialog={dialog2} setDialog={setdialog2} />
                <Button sx={{ mt: 2 }} variant='contained' fullWidth onClick={() => {
                    setRemark(undefined)
                    setdialog2('CreateOrEditPartyRemarkDialog')

                }}>new Remark</Button>
            </DialogContent>
        </Dialog>
    )
}

export default ViewPartyRemarksDialog