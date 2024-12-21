import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import DeleteReferenceRemarkDialog from './DeleteReferenceRemarkDialog'
import CreateOrEditReferenceRemarkDialog from './CreateOrEditReferenceRemarkDialog'
import { GetReferenceRemarksDto } from '../../../dtos/references-remark.dto'
import { SalesService } from '../../../services/SalesServices'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string,stage:string
}

function ViewReferenceRemarksDialog({  party,stage, dialog, setDialog }: Props) {
    const [dialog1, setdialog1] = useState<string | undefined>()
    const [remark, setRemark] = useState<GetReferenceRemarksDto>()
    const [remarks, setRemarks] = useState<GetReferenceRemarksDto[]>()
    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks",  party], async () =>new SalesService(). GetReferenceRemarksHistory(party))


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
            open={dialog === "ViewReferenceRemarksDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWreferenceth: '350px' }} textAlign={"center"}>
                <p>{remarks && party && party.slice(0, 25).toString() || "Remarks History"}</p>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solreference grey' }}>
                                <p>{toTitleCase(item.created_by)} : {item.remark} </p>
                                <p>{item.next_date && `Next Call : ${item.next_date}`} </p>
                                <br></br>
                                {item.created_date && <p>{new Date(item.created_date).toLocaleString()}</p>}
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('grp_excel_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setdialog1('DeleteReferenceRemarkDialog')
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by && new Date(item.created_date) > new Date(previous_date) && user?.assigned_permissions.includes('grp_excel_edit') && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setdialog1('CreateOrEditReferenceRemarkDialog')

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                </Stack>
                {remark && <DeleteReferenceRemarkDialog dialog={dialog1} setDialog={setdialog1} remark={remark} />}
                {remark && <CreateOrEditReferenceRemarkDialog party={party} stage={stage} remark={remark} dialog={dialog1} setDialog={setdialog1} />}
            </DialogContent>

        </Dialog>
    )
}

export default ViewReferenceRemarksDialog