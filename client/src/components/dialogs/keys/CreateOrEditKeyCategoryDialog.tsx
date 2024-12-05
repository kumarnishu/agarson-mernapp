import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, KeyChoiceActions } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import CreateOrEditKeyCategoryForm from '../../forms/keys/CreateOrEditKeyCategoryForm'
import { GetKeyCategoryDto } from '../../../dtos/key-category.dto'

function CreateOrEditKeyCategoryDialog({ category }: { category?: GetKeyCategoryDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={choice === KeyChoiceActions.create_or_edit_key_category ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: KeyChoiceActions.close_key })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!category ? "New Category" : "Edit Category"}</DialogTitle>
            <DialogContent>
                <CreateOrEditKeyCategoryForm category={category} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditKeyCategoryDialog