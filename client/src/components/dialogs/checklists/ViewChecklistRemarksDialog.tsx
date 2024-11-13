import { Dialog, DialogContent, IconButton, DialogTitle, Stack, Button, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { CheckListChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { GetChecklistBoxDto, GetChecklistDto, GetChecklistRemarksDto } from '../../../dtos'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetCheckListRemarksHistory } from '../../../services/CheckListServices'
import DeleteChecklistRemarkDialog from './DeleteChecklistRemarkDialog'
import CreateOrEditChecklistRemarkDialog from './CreateOrEditChecklistRemarkDialog'
import moment from 'moment'


function ViewChecklistRemarksDialog({ checklist_box, checklist }: { checklist: GetChecklistDto, checklist_box: GetChecklistBoxDto }) {
    const [display, setDisplay] = useState<boolean>(false)
    const [display2, setDisplay2] = useState<boolean>(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remark, setRemark] = useState<GetChecklistRemarksDto>()
    const [remarks, setRemarks] = useState<GetChecklistRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", checklist_box._id], async () => GetCheckListRemarksHistory(checklist_box._id))


    const { user } = useContext(UserContext)
    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)

    useEffect(() => {
        if (isSuccess && data)
            setRemarks(data?.data)
    }, [isSuccess, data])

    console.log(choice)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === CheckListChoiceActions.view_checklist_remarks ? true : false}
            onClose={() => setChoice({ type: CheckListChoiceActions.close_checklist })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() =>
                setChoice({ type: CheckListChoiceActions.close_checklist })}>
                <Cancel fontSize='large' />
            </IconButton>
            <Typography sx={{ textAlign: 'center', p: 2, fontWeight: 600 }}>Remarks History : {moment(new Date(checklist_box.date)).format("DD/MM/YYYY")}</Typography>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solid grey' }}>
                                <p>{toTitleCase(item.created_by.value)} : {item.remark} </p>
                                <br></br>
                                <p>{moment(item.created_date).format('lll')}</p>
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('checklist_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setDisplay(true)
                                        }}>
                                            Delete</IconButton>}
                                        {user && item.remark && user?.username === item.created_by.value && new Date(item.created_date) > new Date(previous_date) && user?.assigned_permissions.includes('checklist_edit') && <IconButton size="small" color="success"
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
                    {remarks && remarks.length == 0 && <Typography textAlign={'center'} color={'grey'}>No Remarks yet</Typography>}
                </Stack>

            </DialogContent>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <Button variant='contained'
                    fullWidth
                    onClick={() => {
                        setDisplay2(true)
                        setRemark(undefined)
                    }}>Add Remark</Button>
            </DialogTitle>
            {remark && display && <DeleteChecklistRemarkDialog display={display} setDisplay={setDisplay} remark={remark} />}
            {!remark && display2 && <CreateOrEditChecklistRemarkDialog
                checklist={checklist} checklist_box={checklist_box}
                display={display2} setDisplay={setDisplay2} />}
            {remark && display2 && <CreateOrEditChecklistRemarkDialog
                checklist={checklist} checklist_box={checklist_box}
                remark={remark}
                display={display2} setDisplay={setDisplay2} />}
        </Dialog>
    )
}

export default ViewChecklistRemarksDialog