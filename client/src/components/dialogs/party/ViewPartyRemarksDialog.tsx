import { Dialog, DialogContent, IconButton, DialogTitle, Stack, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { SalesService } from '../../../services/SalesServices'
import DeletePartyremarkDialog from './DeletePartyremarkDialog'
import CreateOrEditPartyRemarkDialog from './CreateOrEditPartyRemarkDialog'
import { GetAgeingRemarkDto } from '../../../dtos/SalesDto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string
}

function ViewPartyRemarksDialog({ party, dialog, setDialog }: Props) {

    const [dialog2, setdialog2] = useState<string | undefined>()
    const [remark, setRemark] = useState<GetAgeingRemarkDto>()
    const [remarks, setRemarks] = useState<GetAgeingRemarkDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", party], async () => new SalesService().GetAgeingRemarksHistory(party))


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

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solemployee grey' }}>
                                <p>{toTitleCase(item.created_by)} : {item.remark} </p>
                                {item.created_at && <p>Next Call {new Date(item.nextcall).toDateString()}</p>}
                                <br></br>
                                {item.created_at && <p>{new Date(item.created_at).toLocaleString()}</p>}
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.role == 'admin' && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setdialog2('DeletePartyremarkDialog')
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by && new Date(item.created_at) > new Date(previous_date) && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setdialog2('CreateOrEditPartyRemarkDialog')

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                </Stack>
                {remark && <DeletePartyremarkDialog dialog={dialog2} setDialog={setdialog2} remark={remark} />}
                <CreateOrEditPartyRemarkDialog party={party} remark={remark} dialog={dialog2} setDialog={setdialog2} />
            <Button variant='contained' fullWidth  onClick={() => {
                setRemark(undefined)
                setdialog2('CreateOrEditPartyRemarkDialog')

            }}>new Remark</Button>
            </DialogContent>
        </Dialog>
    )
}

export default ViewPartyRemarksDialog