import { Dialog, IconButton, DialogTitle, Stack } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CurrentStock from '../../party/CurrentStock'
import PartyAgeing1 from '../../party/PartyAgeing1'
import PartyAgeing2 from '../../party/PartyAgeing2'
import PartyClientSale from '../../party/PartyClientSale'
import PartyForcastAndGrowth from '../../party/PartyForcastAndGrowth'
import PartyPendingOrders from '../../party/PartyPendingOrders'
import PartyInteraction from '../../party/PartyInteraction'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string
}

function ViewPartyDetailDialog({ party, dialog, setDialog }: Props) {
    return (
        <Dialog
            open={dialog === "ViewPartyDetailDialog"}
            fullScreen
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', left: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                {party}
            </DialogTitle>
            <Stack direction={'column'} height={'100vh'} gap={1} padding={1}>
                <Stack sx={{ height: '30vh' }} direction={'row'} justifyContent={'space-between'}>
                    <PartyInteraction party={party} />
                </Stack>
                <Stack gap={2} direction={'row'} justifyContent={'space-between'} flexWrap={'wrap'}>

                    <PartyAgeing1 party={party} />
                    <PartyAgeing2 party={party} />
                    <PartyForcastAndGrowth party={party} />
                    <PartyClientSale party={party} />
                    <PartyPendingOrders party={party} />

                </Stack>
                <Stack sx={{ height: '30vh' }} direction={'row'} justifyContent={'space-between'}>
                    <CurrentStock party={party} />
                </Stack>
            </Stack>
        </Dialog>
    )
}

export default ViewPartyDetailDialog