import { Dialog, DialogContent, IconButton, DialogTitle, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ChoiceContext, MaintenanceChoiceActions } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { ViewMaintenanceItemRemarkHistory } from '../../../services/MaintenanceServices'
import { GetMaintenanceItemRemarkDto } from '../../../dtos/maintenance/maintenance.dto'
import { toTitleCase } from '../../../utils/TitleCase'



function ViewMaintenaceRemarkHistoryDialog({ id }: { id: string }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const [remarks, setRemarks] = useState<GetMaintenanceItemRemarkDto[]>()
    const { data, isSuccess } = useQuery<AxiosResponse<[]>, BackendError>(["remarks", id], async () => ViewMaintenanceItemRemarkHistory({ id: id }))

    useEffect(() => {
        if (isSuccess && data)
            setRemarks(data?.data)
    }, [isSuccess, data])

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === MaintenanceChoiceActions.view_maintance_remarks ? true : false}
            onClose={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: MaintenanceChoiceActions.close_maintenance })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                <p>Remarks</p>
            </DialogTitle>
            <DialogContent>
                <Stack direction="column" gap={2} >
                    {remarks && remarks.map((item, index) => {
                        return (

                            <div key={index} style={{ borderRadius: '1px 10px', padding: '10px', background: 'lightblue', paddingLeft: '20px', border: '1px solid grey' }}>
                                <p>{toTitleCase(item.created_by)} : {item.remark} </p>
                                <br></br>
                                <p>{item.created_at}</p>
                            </div>

                        )
                    })}
                </Stack>
            </DialogContent>

        </Dialog>
    )
}

export default ViewMaintenaceRemarkHistoryDialog