import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import ConsumeStockSchemForm from '../../forms/stock scheme/ConsumeStockSchemForm'
import { GetArticleStockDto } from '../../../dtos/response/StockSchemeDto'


type Props = {
    dialog: string | undefined,
    stock: GetArticleStockDto,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>

}
function ConsumeStockSchmeDialog({ stock, dialog, setDialog }: Props) {

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'ConsumeStockSchmeDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Consume Stock</DialogTitle>
            <DialogContent>
                <ConsumeStockSchemForm stock={stock} setDialog={
                    setDialog
                } />
            </DialogContent>
        </Dialog>
    )
}

export default ConsumeStockSchmeDialog