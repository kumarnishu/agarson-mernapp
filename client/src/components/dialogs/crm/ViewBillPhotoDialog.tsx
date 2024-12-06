import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { DownloadFile } from '../../../utils/DownloadFile';
import { GetBillDto } from '../../../dtos/crm-bill.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    bill: GetBillDto
}
function ViewBillPhotoDialog({ bill, dialog, setDialog }: Props) {
    
    return (
        <>
            <Dialog fullScreen open={dialog == "ViewBillPhotoDialog"}
                onClose={() => {
                    setDialog(undefined)
                }}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{bill.bill_no}</DialogTitle>
                <Typography sx={{ minWidth: '350px' }} textAlign={"center"}>{bill.bill_date}</Typography>
                <DialogContent>
                    <Stack justifyContent={'center'}
                        onDoubleClick={() => {
                            if (bill.billphoto !== "") {
                                DownloadFile(bill.billphoto, bill.bill_no)
                            }
                        }}>
                        <iframe src={bill.billphoto} height={600} />
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ViewBillPhotoDialog







