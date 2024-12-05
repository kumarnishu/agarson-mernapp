import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { DownloadFile } from '../../../utils/DownloadFile';
import { GetBillDto } from '../../../dtos/crm-bill.dto';

function ViewBillPhotoDialog({ bill, display, setDisplay }: { bill: GetBillDto, display: boolean, setDisplay: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <>
            <Dialog fullScreen open={display}
                onClose={() => {
                    setDisplay(false)
                }}
            > <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDisplay(false)
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







