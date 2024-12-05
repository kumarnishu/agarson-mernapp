import { Dialog, DialogContent, DialogTitle, Button, DialogActions, CircularProgress, IconButton } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { queryClient } from '../../../main';
import { AxiosResponse } from 'axios';
import { BackendError } from '../../..';
import { useMutation } from 'react-query';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { ToogleArticle } from '../../../services/ProductionServices';
import { GetArticleDto } from '../../../dtos/article.dto';

function ToogleArticleDialog({ article }: { article: GetArticleDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (ToogleArticle, {
            onSuccess: () => {
                queryClient.invalidateQueries('articles')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: ProductionChoiceActions.close_production })
    }, [setChoice, isSuccess])
    return (
        <>
            <Dialog open={choice === ProductionChoiceActions.toogle_article ? true : false}
                onClose={() => setChoice({ type: ProductionChoiceActions.close_production })}
            >
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="success" color="success" />
                    ) : null
                }
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                    <Cancel fontSize='large' />
                </IconButton>
                <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Toogle Article</DialogTitle>
                <DialogContent>
                    This Will toogle article {article.name}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button fullWidth variant="outlined" color="error"
                        onClick={() => {
                            mutate(article._id)
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Toogle"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ToogleArticleDialog