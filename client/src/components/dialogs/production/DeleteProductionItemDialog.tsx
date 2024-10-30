import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { ChoiceContext, ProductionChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';
import AlertBar from '../../snacks/AlertBar';
import { DropDownDto } from '../../../dtos';
import { DeleteProductionItem } from '../../../services/ProductionServices';
import { GetProductionDto, GetShoeWeightDto, GetSoleThicknessDto, GetSpareDyeDto } from '../../../dtos';


function DeleteProductionItemDialog({ category, weight, thickness, spare_dye, production }: { category?: DropDownDto, weight?: GetShoeWeightDto, thickness?: GetSoleThicknessDto, spare_dye?: GetSpareDyeDto, production?: GetProductionDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { category?: DropDownDto, weight?: GetShoeWeightDto, thickness?: GetSoleThicknessDto, spare_dye?: GetSpareDyeDto, production?: GetProductionDto }>
        (DeleteProductionItem, {
            onSuccess: () => {
                if (category)
                    queryClient.invalidateQueries('machine_categories')
                if (thickness)
                    queryClient.invalidateQueries('thickness')
                if (weight)
                    queryClient.invalidateQueries('shoe_weights')
                if (spare_dye)
                    queryClient.invalidateQueries('spare_dyes')
                else
                    queryClient.invalidateQueries('productions')
            }
        })

    useEffect(() => {
        if (isSuccess)
            setChoice({ type: ProductionChoiceActions.close_production })
    }, [setChoice, isSuccess])

    return (
        <Dialog open={choice === ProductionChoiceActions.delete_production_item ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setChoice({ type: ProductionChoiceActions.close_production })}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px', fontSize: '20px' }} textAlign="center">

                {category && 'Delete Catgeory'}
                {thickness && 'Delete Thickness'}
                {weight && 'Delete Weight'}
                {spare_dye && 'Delete Spare Dye'}
                {production && 'Delete Production'}
            </DialogTitle>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message="deleted" color="success" />
                ) : null
            }
            <DialogContent>
                <Typography variant="h4" color="error">
                    Are you sure to permanently delete this item ?

                </Typography>
            </DialogContent>
            <Stack
                direction="row"
                gap={2}
                padding={2}
                width="100%"
            >
                <Button fullWidth variant="outlined" color="error"
                    onClick={() => {
                        mutate({ category, weight, thickness, spare_dye, production })
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Delete"}
                </Button>
                <Button fullWidth variant="contained" color="info"
                    onClick={() => {
                        setChoice({ type: ProductionChoiceActions.close_production })
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Cancel"}
                </Button>
            </Stack >
        </Dialog >
    )
}

export default DeleteProductionItemDialog
