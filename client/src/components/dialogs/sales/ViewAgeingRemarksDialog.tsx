import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { SalesService } from '../../../services/SalesServices'
import DeleteAgeingremarkDialog from './DeleteAgeingremarkDialog'
import CreateOrEditAgeingRemarkDialog from './CreateOrEditAgeingRemarkDialog'
import { GetAgeingRemarkDto } from '../../../dtos/sales.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string
}

function ViewAgeingRemarksDialog({ party, dialog, setDialog }: Props) {

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
            open={dialog === "ViewAgeingRemarksDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
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
                                {item.created_at && <p>Next Call {new Date(item.nextcall).toDateString()}</p>}
                                <br></br>
                                {item.created_at && <p>{new Date(item.created_at).toLocaleString()}</p>}
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('ageing_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setdialog2('DeleteAgeingremarkDialog')
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by && new Date(item.created_at) > new Date(previous_date) && user?.assigned_permissions.includes('ageing_edit') && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setdialog2('CreateOrEditAgeingRemarkDialog')

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                </Stack>
                {remark && <DeleteAgeingremarkDialog dialog={dialog2} setDialog={setdialog2} remark={remark} />}
                {remark && <CreateOrEditAgeingRemarkDialog party={party} remark={remark} dialog={dialog2} setDialog={setdialog2} />}
            </DialogContent>

        </Dialog>
    )
}

export default ViewAgeingRemarksDialog