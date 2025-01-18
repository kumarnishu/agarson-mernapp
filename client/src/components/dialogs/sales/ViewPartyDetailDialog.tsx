import { Dialog, IconButton, DialogTitle, Stack, DialogContent } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CurrentStock from '../../party/CurrentStock'
import PartyAgeing1 from '../../party/PartyAgeing1'
import PartyAgeing2 from '../../party/PartyAgeing2'
import PartyClientSale from '../../party/PartyClientSale'
import PartyForcastAndGrowth from '../../party/PartyForcastAndGrowth'
import PartyPendingOrders from '../../party/PartyPendingOrders'
import { ArticlesProvider } from '../../../contexts/ArticlesContext'
import { useState } from 'react'
import ViewPartyRemarksDialog from '../party/ViewPartyRemarksDialog'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string
}

function ViewPartyDetailDialog({ party, dialog, setDialog }: Props) {
    const [dialog2, setdialog2] = useState<string | undefined>()
    return (
        <>
            <Dialog
                open={dialog === "ViewPartyDetailDialog"}
                fullScreen
                onClose={() => {
                    setdialog2(undefined)
                    setDialog(undefined)
                }
                }
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', left: '0px' }} color="error" onClick={() => {
                    setdialog2(undefined)
                    setDialog(undefined)
                }}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>
                    <p onMouseOver={() => setdialog2('ViewPartyRemarksDialog')}>
                        {party}
                    </p>
                </DialogTitle>
                <DialogContent>
                    {dialog && <ArticlesProvider>
                        <Stack direction={{ sm: 'column', md: 'row' }} sx={{ width: '100vw' }} gap={2}   >
                            <Stack gap={1} direction={'column'} justifyContent={'space-between'} sx={{
                                width: {
                                    sm: "100%",
                                    md: '48%'
                                }
                            }}>
                                <PartyAgeing1 party={party} />
                                <PartyAgeing2 party={party} />
                                <PartyForcastAndGrowth party={party} />
                                <PartyClientSale party={party} />
                                <PartyPendingOrders party={party} />
                            </Stack>
                            <Stack direction={'row'} >
                                <CurrentStock party={party} />
                            </Stack>
                        </Stack>
                    </ArticlesProvider>}
                </DialogContent>
            </Dialog>
            <ViewPartyRemarksDialog party={party} dialog={dialog2} setDialog={setdialog2} />
        </>
    )
}

export default ViewPartyDetailDialog