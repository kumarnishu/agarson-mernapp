import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    id: string
}

function ViewRefersBillHistoryDialog({ id, dialog, setDialog }: Props) {
    const [dialog1, setDialog1] = useState<string | undefined>()
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
            open={dialog === 'ViewRefersBillHistoryDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
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
                                            setDialog1('ViewBillPhotoDialog')
                                        }}>
                                            <Photo /></IconButton>}
                                        {user && item && user?.username === item.created_by.label && new Date(item.created_at) > new Date(previous_date) && <div>

                                            {user?.assigned_permissions.includes('delete_refer_bills') && <IconButton size="small" color="error" onClick={() => {
                                                setBill(item)
                                                setDialog1('DeleteBillDialog')
                                            }}>
                                                Delete</IconButton>}
                                            {user?.assigned_permissions.includes('edit_refer_bills') && <IconButton size="small" color="success"
                                                onClick={() => {
                                                    setBill(item)
                                                    setDialog1('CreateOrEditBillDialog')

                                                }}
                                            >Edit</IconButton>}
                                        </div>}
                                    </Stack>
                                }
                            </div>
                        )
                    })}
                </Stack>
                {bill && <DeleteBillDialog dialog={dialog} setDialog={setDialog1} bill={bill} />}
                {bill && <CreateOrEditBillDialog bill={bill} dialog={dialog1} setDialog={setDialog1} />}
                {bill && <ViewBillPhotoDialog bill={bill} dialog={dialog1} setDialog={setDialog1} />}
            </DialogContent>

        </Dialog >
    )
}

export default ViewRefersBillHistoryDialog