import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { useContext } from 'react'
import { ChoiceContext, UserChoiceActions, } from '../../../contexts/dialogContext'
import { Cancel } from '@mui/icons-material'
import { GetErpEmployeeDto } from '../../../dtos'
import CreateOrEditErpEmployeeForm from '../../forms/erp/CreateOrEditErpEmployeeForm'

function CreateOrEditErpEmployeeDialog({ employee }: { employee?: GetErpEmployeeDto }) {
    const { choice, setChoice } = useContext(ChoiceContext)

    return (
        <Dialog 
            open={choice === UserChoiceActions.create_or_edit_erpemployee ? true : false}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: UserChoiceActions.close_user })
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!employee ? "New Employee" : "Edit Employee"}</DialogTitle>
            <DialogContent>
                <CreateOrEditErpEmployeeForm employee={employee} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditErpEmployeeDialog