import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { useContext } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import CreateOrEditArticleForm from '../../forms/production/CreateOrEditArticleForm';
import { GetArticleDto } from '../../../dtos/article.dto';


function CreateOrEditArticleDialog({ article }: { article?: GetArticleDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)} open={choice === ProductionChoiceActions.create_or_edit_article ? true : false}
            onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {article ? "Update Article" : "Create Article"}
            </DialogTitle>

            <DialogContent>
                <CreateOrEditArticleForm article={article} />
            </DialogContent>
        </Dialog >
    )
}

export default CreateOrEditArticleDialog
