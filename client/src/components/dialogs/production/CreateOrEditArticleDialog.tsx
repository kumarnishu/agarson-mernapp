import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import CreateOrEditArticleForm from '../../forms/production/CreateOrEditArticleForm';
import { GetArticleDto } from '../../../dtos/article.dto';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    article?: GetArticleDto
}
function CreateOrEditArticleDialog({ article, dialog, setDialog }: Props) {
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={dialog === "CreateOrEditArticleDialog"}
            onClose={() => setDialog(undefined)}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {article ? "Update Article" : "Create Article"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditArticleForm setDialog={
                    setDialog
                }article={article} />
            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditArticleDialog
