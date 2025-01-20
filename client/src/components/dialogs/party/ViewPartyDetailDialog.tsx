import { Dialog, IconButton, Stack, Button } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CurrentStock from '../../party/CurrentStock'
import PartyAgeing1 from '../../party/PartyAgeing1'
import PartyAgeing2 from '../../party/PartyAgeing2'
import PartyClientSale from '../../party/PartyClientSale'
import PartyForcastAndGrowth from '../../party/PartyForcastAndGrowth'
import PartyPendingOrders from '../../party/PartyPendingOrders'
import { ArticlesProvider } from '../../../contexts/ArticlesContext'
import { useContext, useState } from 'react'
import ViewPartyRemarksDialog from './ViewPartyRemarksDialog'
import { PartyContext } from '../../../contexts/partyContext'
import ViewPartyListDialog from './ViewPartyListDialog'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
}

function ViewPartyDetailDialog({ dialog, setDialog }: Props) {
    const [dialog2, setdialog2] = useState<string | undefined>()
    const { party } = useContext(PartyContext)
    return (
        <>
            {party && <Dialog
                open={dialog === "ViewPartyDetailDialog"}
                fullScreen
                onClose={() => {
                    setdialog2(undefined)
                    setDialog(undefined)
                }
                }
            >

                <Stack direction={{ sm: 'column', md: 'row' }} gap={2} alignItems={'center'} justifyContent={'left'} sx={{ width: '100vw' }}>
                    <IconButton style={{ display: 'inline-block' }} color="error" onClick={() => {
                        setdialog2(undefined)
                        setDialog(undefined)
                    }}>
                        <Cancel fontSize='large' />
                    </IconButton>
                    <p onMouseOver={() => {
                        setdialog2('ViewPartyListDialog')
                    }} style={{ width: '100%', paddingInline: 10, cursor: 'pointer', fontWeight: 'bold', fontSize: 20, textAlign: 'left' }}>
                        {window.screen.width > 600 ? party : `${party.slice(0, 30)} ...`}
                    </p>
                    {/* <Stack direction={{ sm: 'column', md: 'row' }} gap={2}> */}

                    <Button variant='text' fullWidth color="error" sx={{ fontSize: 17, cursor: 'pointer' }} onMouseOver={() => setdialog2('ViewPartyRemarksDialog')}>
                        last 5 Remarks
                    </Button>
                    {/* </Stack> */}
                </Stack>
                {dialog && <ArticlesProvider>

                    <Stack direction={{ sm: 'column', md: 'row' }} sx={{ width: '100vw' }} gap={1}   >
                        <Stack gap={1} direction={'column'} justifyContent={'space-between'} sx={{
                            width: {
                                sm: "100%",
                                md: '49%'
                            }
                        }}>
                            <PartyAgeing1 party={party} />
                            <PartyAgeing2 party={party} />
                            <PartyForcastAndGrowth party={party} />
                            <PartyClientSale party={party} />
                            <PartyPendingOrders party={party} />
                        </Stack>
                        <Stack direction={'row'} >
                            <CurrentStock  />
                        </Stack>
                    </Stack>
                </ArticlesProvider>}
                <ViewPartyRemarksDialog party={party} dialog={dialog2} setDialog={setdialog2} />
                <ViewPartyListDialog dialog={dialog2} setDialog={setdialog2} />
            </Dialog>}
        </>
    )
}

export default ViewPartyDetailDialog