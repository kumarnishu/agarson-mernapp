import { Dialog, DialogContent, IconButton,  Stack,  Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { CheckListChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetCheckListRemarksHistory } from '../../../services/CheckListServices'
import DeleteChecklistRemarkDialog from './DeleteChecklistRemarkDialog'
import moment from 'moment'
import { GetChecklistRemarksDto } from '../../../dtos/checklist-remark.dto'
import { GetChecklistDto } from '../../../dtos/checklist.dto'


function ViewChecklistRemarksDialog({ checklist }: { checklist: GetChecklistDto }) {
    const [display, setDisplay] = useState<boolean>(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remark, setRemark] = useState<GetChecklistRemarksDto>()
    const [remarks, setRemarks] = useState<GetChecklistRemarksDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", checklist._id], async () => GetCheckListRemarksHistory(checklist._id))


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
            <br />
            <br />
            <Typography sx={{ textAlign: 'center', px: 2,mx:2, fontWeight: 600,minWidth:300 }}>Remarks History</Typography>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px',  paddingLeft: '20px', border: '1px solid grey' }}>
                                <p>{toTitleCase(item.created_by.label)} : {item.remark} </p>
                                <br></br>
                                <p>{moment(item.created_date).format('lll')}</p>
                                {
                                    <Stack justifyContent={'end'} direction="row" gap={0} pt={2}>
                                        {user?.assigned_permissions.includes('checklist_delete') && <IconButton size="small" color="error" onClick={() => {
                                            setRemark(item)
                                            setDisplay(true)
                                        }}>
                                            Delete</IconButton>}
                                       
                                    </Stack>
                                }
                            </div>

                        )
                    })}
                    {remarks && remarks.length == 0 && <Typography textAlign={'center'} color={'grey'}>No Remarks yet</Typography>}
                </Stack>

            </DialogContent>

            {remark && display && <DeleteChecklistRemarkDialog display={display} setDisplay={setDisplay} remark={remark} />}

        </Dialog>
    )
}

export default ViewChecklistRemarksDialog