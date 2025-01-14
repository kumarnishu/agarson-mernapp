import { Dialog, DialogContent, IconButton, DialogTitle, Stack, Button, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import DeleteChecklistRemarkDialog from './DeleteChecklistRemarkDialog'
import CreateOrEditChecklistRemarkDialog from './CreateOrEditChecklistRemarkDialog'
import moment from 'moment'

import CreateChecklistRemarkDialogFromAdmin from './CreateChecklistRemarkDialogFromAdmin'
import { ChecklistService } from '../../../services/ChecklistService'
import { GetChecklistDto, GetChecklistBoxDto, GetChecklistRemarksDto } from '../../../dtos/response/ChecklistDto'

type Props = {
    is_admin: boolean,
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    checklist: GetChecklistDto, checklist_box: GetChecklistBoxDto
}

function ViewChecklistBoxRemarksDialog({ checklist_box, checklist, dialog, setDialog, is_admin }: Props) {
    const [dialog1, setDialog1] = useState<string | undefined>()
    const [remark, setRemark] = useState<GetChecklistRemarksDto>()
    const [remarks, setRemarks] = useState<GetChecklistRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", checklist_box._id], async () => new ChecklistService().GetCheckListBoxRemarksHistory(checklist_box._id))


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
            open={dialog == 'ViewChecklistBoxRemarksDialog'}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() =>
                setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>

            <Typography sx={{ textAlign: 'center', pt: 2, fontWeight: 600 }}>{moment(new Date(checklist_box.date)).format("DD/MM/YYYY")}</Typography>
            <Typography sx={{ textAlign: 'center', px: 2, mx: 2, fontWeight: 600, minWidth: 300 }}>Score : {`${parseFloat(Number(checklist_box.score).toFixed(2))} | `}{checklist.work_title.slice(0, 70)} </Typography>
            <DialogContent>

                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solid grey' }}>
                                <pre>{toTitleCase(item.created_by.label)} : {item.remark} </pre>
                                <br></br>
                                <p>{moment(item.created_date).format('lll')}</p>
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('checklist_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setDialog1('DeleteChecklistRemarkDialog')
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by.label && new Date(item.created_date) > new Date(previous_date) && user?.assigned_permissions.includes('checklist_edit') && <IconButton size="small" color="success"
                                            onClick={() => {
                                                setRemark(item)
                                                setDialog1('CreateOrEditChecklistRemarkDialog')

                                            }}
                                        >Edit</IconButton>}
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                    {remarks && remarks.length == 0 && <Typography textAlign={'center'} color={'grey'}>No Remarks yet</Typography>}
                </Stack>

            </DialogContent>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                {(checklist_box.stage !== 'done' || user?.role=="admin") && <Button variant='contained'
                    fullWidth
                    onClick={() => {
                        setDialog1(is_admin ? 'CreateChecklistRemarkDialogFromAdmin' : 'CreateOrEditChecklistRemarkDialog')
                        setRemark(undefined)
                    }}>Add Remark</Button>}
            </DialogTitle>
            {remark && dialog1 && <DeleteChecklistRemarkDialog dialog={dialog1} setDialog={setDialog1} remark={remark} />}
            <CreateOrEditChecklistRemarkDialog
                checklist={checklist} checklist_box={checklist_box}
                remark={remark}
                dialog={dialog1} setDialog={setDialog1} />
            <CreateChecklistRemarkDialogFromAdmin
                checklist={checklist} checklist_box={checklist_box}
                dialog={dialog1} setDialog={setDialog1} />
        </Dialog>
    )
}

export default ViewChecklistBoxRemarksDialog