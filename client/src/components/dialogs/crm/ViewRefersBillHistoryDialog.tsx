import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { LeadChoiceActions, ChoiceContext } from '../../../contexts/dialogContext'
import { Cancel, Photo } from '@mui/icons-material'
import { UserContext } from '../../../contexts/userContext'
import { toTitleCase } from '../../../utils/TitleCase'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetReferBillHistory } from '../../../services/LeadsServices'
import DeleteBillDialog from './DeleteBillDialog'
import CreateOrEditBillDialog from './CreateOrEditBillDialog'
import ViewBillPhotoDialog from './ViewBillPhotoDialog'
import { GetBillDto } from '../../../dtos/crm-bill.dto'


function ViewRefersBillHistoryDialog({ id }: { id: string }) {
    const [display, setDisplay] = useState<boolean>(false)
    const [display2, setDisplay2] = useState<boolean>(false)
    const [display3, setDisplay3] = useState<boolean>(false)
    const { choice, setChoice } = useContext(ChoiceContext)
    const [bill, setBill] = useState<GetBillDto>()
    const [bills, setBills] = useState<GetBillDto[]>()

    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["bills", id], async () => GetReferBillHistory({ id: id }))


    const { user } = useContext(UserContext)
    let previous_date = new Date()
    let day = previous_date.getDate() - 1
    previous_date.setDate(day)

    useEffect(() => {
        if (isSuccess && data)
            setBills(data?.data)
    }, [isSuccess, data])

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === LeadChoiceActions.view_bills ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: LeadChoiceActions.close_lead })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <p>Bills History</p>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {bills && bills.map((item, index) => {
                        return (
                            <div key={index} style={{ borderRadius: '1px 3px', padding: '5px', background: 'lightblue', paddingLeft: '20px', border: '1px solid grey' }}>

                                {
                                     <Stack
                                        justifyContent={'space-between'} direction="row" gap={0} alignItems={'center'}>
                                        <p>{toTitleCase(item.bill_no)} - {item.bill_date} </p>
                                        {item?.billphoto !== "" && user?.assigned_permissions.includes('view_refer_bills') && <IconButton size="small" color="error" onClick={() => {
                                            setBill(item)
                                            setDisplay3(true)
                                        }}>
                                            <Photo /></IconButton>}
                                        {user && item && user?.username === item.created_by.label && new Date(item.created_at) > new Date(previous_date) &&<div>
                                           
                                            {user?.assigned_permissions.includes('delete_refer_bills') && <IconButton size="small" color="error" onClick={() => {
                                                setBill(item)
                                                setDisplay(true)
                                            }}>
                                                Delete</IconButton>}
                                            {user?.assigned_permissions.includes('edit_refer_bills') && <IconButton size="small" color="success"
                                                onClick={() => {
                                                    setBill(item)
                                                    setDisplay2(true)

                                                }}
                                            >Edit</IconButton>}
                                        </div>}
                                    </Stack>
                                }
                            </div>
                        )
                    })}
                </Stack>
                {bill && <DeleteBillDialog display={display} setDisplay={setDisplay} bill={bill} />}
                {bill && <CreateOrEditBillDialog bill={bill} display={display2} setDisplay={setDisplay2} />}
                {bill && <ViewBillPhotoDialog bill={bill} display={display3} setDisplay={setDisplay3} />}
            </DialogContent>

        </Dialog >
    )
}

export default ViewRefersBillHistoryDialog