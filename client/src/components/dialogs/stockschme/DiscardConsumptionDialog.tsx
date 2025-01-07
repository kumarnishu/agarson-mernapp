import { Dialog, DialogContent, IconButton, DialogTitle, Card, CardContent, Typography, Divider, Grid, Button, Stack } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import { DiscardConsumptionDto, GetConsumedStockDto } from '../../../dtos/stock.scheme.dto'
import { AxiosResponse } from 'axios'
import { BackendError } from '../../..'
import { StockSchmeService } from '../../../services/StockSchmeService'
import { useMutation } from 'react-query'
import { queryClient } from '../../../main'
import { useContext } from 'react'
import { AlertContext } from '../../../contexts/alertContext'


type Props = {
    dialog: string | undefined,
    consumtion: GetConsumedStockDto,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function DiscardConsumptionDialog({ consumtion, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading } = useMutation
        <AxiosResponse<any>, BackendError, { body: DiscardConsumptionDto, id: string }>
        (new StockSchmeService().DiscardStock, {
            onSuccess: () => {
                queryClient.invalidateQueries('consumed')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })

        })
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'DiscardConsumptionDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Discard Consumption</DialogTitle>
            <DialogContent>
                <Card sx={{ maxWidth: 400, margin: 2, boxShadow: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {consumtion.article}

                        </Typography>
                        <Divider sx={{ marginY: 1 }} />

                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="body2"><strong>Party:</strong> {consumtion.party}</Typography>
                                <Typography variant="body2"><strong>Status:</strong> {consumtion.status}</Typography>
                                <Typography variant="body2"><strong>Size:</strong> {consumtion.size}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2"><strong>Consumed:</strong> {consumtion.consumed}</Typography>
                                <Typography variant="body2"><strong>Scheme:</strong> {consumtion.scheme.label}</Typography>

                            </Grid>
                        </Grid>

                        <Divider sx={{ marginY: 1 }} />
                        <Typography variant="body2"><strong>Employee:</strong> {consumtion.employee.label}</Typography>
                        <Divider sx={{ marginY: 1 }} />
                        <Stack direction={'row'} gap={2}>
                            <Button disabled={isLoading} fullWidth variant='outlined' color='success'
                                onClick={() => setDialog(undefined)}
                            >Cancel</Button>
                            <Button disabled={isLoading} fullWidth variant='outlined' color='error'
                                onClick={() => {
                                    mutate({
                                        id: consumtion._id,
                                        body: {
                                            scheme: consumtion.scheme.id,
                                            article: consumtion.article,
                                            size: consumtion.size,
                                            consumed: consumtion.consumed
                                        }
                                    })
                                    setDialog(undefined)
                                }}
                            >Reject</Button>
                        </Stack>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}

export default DiscardConsumptionDialog