import { Dialog, DialogContent, DialogActions, IconButton, DialogTitle, Stack, Checkbox, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { STable, STableBody, STableCell, STableHead, STableHeadCell, STableRow } from '../../styled/STyledTable'
import { AxiosResponse } from 'axios'
import { useMutation } from 'react-query'
import { BackendError } from '../../..'
import { queryClient } from '../../../main'
import { GetReferDto, CreateOrEditMergeRefersDto } from '../../../dtos/refer.dto'
import { AlertContext } from '../../../contexts/alertContext'
import { CrmService } from '../../../services/CrmService'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    refers: GetReferDto[], removeSelectedRefers: () => void
}

function MergeTwoRefersDialog({ refers, removeSelectedRefers, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const [mobiles, setMobiles] = useState<string[]>([]);
    const [targetRefer, setTartgetRefer] = useState<CreateOrEditMergeRefersDto>({
        name: refers[0].name,
        mobiles: mobiles,
        city: refers[0].city,
        state: refers[0].state,
        address: refers[0].address,
        merge_assigned_refers: true,
        merge_remarks: true,
        merge_bills: true,
        source_refer_id: refers[1]._id
    })

    const { mutate, isLoading } = useMutation
        <AxiosResponse<GetReferDto>, BackendError, { body: CreateOrEditMergeRefersDto, id: string }>
        (new CrmService().MergeTwoRefers, {

            onSuccess: () => {
                removeSelectedRefers()
                queryClient.invalidateQueries('refers')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        },)


    useEffect(() => {
        if (refers) {
            let tmp = [refers[0].mobile]
            if (refers[0].mobile2) {
                tmp.push(refers[0].mobile2);
            }
            if (refers[0].mobile3) {
                tmp.push(refers[0].mobile3);
            }
            setMobiles(tmp);
        }
    }, [refers])

    return (
        <Dialog fullScreen
            open={dialog === "MergeTwoRefersDialog"}
            onClose={() => setDialog(undefined)}
        >

            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ textAlign: 'center', minWidth: '350px' }}>{`Merging Source into Target Refer `}</DialogTitle>
            <DialogContent>
                <Stack flexDirection={'row'} gap={3}>
                    <STable
                    >
                        <STableHead
                        >
                            <STableRow>

                                <STableHeadCell style={{ width: '200px' }}
                                >

                                    Target
                                </STableHeadCell>
                                <STableHeadCell style={{ width: '200px' }}
                                >

                                    Source

                                </STableHeadCell>
                                <STableHeadCell style={{ width: '200px', backgroundColor: 'green', color: 'white' }}
                                >

                                    Result

                                </STableHeadCell>



                            </STableRow>
                        </STableHead>
                        <STableBody >
                            {/* name */}
                            <STableRow
                                key={1}
                            >


                                <STableCell title='refer name' style={{ width: '200px' }}>
                                    {refers[0].name}
                                </STableCell>
                                <STableCell title='refer name' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetRefer({ ...targetRefer, name: refers[1].name })
                                        }
                                        else {
                                            setTartgetRefer({ ...targetRefer, name: refers[0].name })
                                        }
                                    }} disabled={!refers[1].name} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{refers[1].name}
                                </STableCell>
                                <STableCell title='refer name' style={{ width: '200px' }}>
                                    {targetRefer.name}
                                </STableCell>
                            </STableRow>
                            <STableRow
                                key={2}
                            >


                                <STableCell title='refer mobiles' style={{ width: '200px' }}>
                                    {refers[0].mobile}
                                    {refers[0].mobile2 ? ` | ${refers[0].mobile2}` : ""}
                                    {refers[0].mobile3 ? ` | ${refers[0].mobile3}` : ""}
                                </STableCell>
                                <STableCell title='refer mobiles' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        var tmp = mobiles;

                                        if (e.target.checked) {
                                            if (tmp.length <= 3) {
                                                tmp.push(refers[1].mobile)
                                                setMobiles(tmp);
                                            }
                                        }
                                        else {
                                            tmp = tmp.filter(e => {
                                                return e !== refers[1].mobile
                                            })
                                            setMobiles(tmp);
                                        }
                                    }} disabled={!refers[1].mobile} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{refers[1].mobile},
                                    <Checkbox onChange={(e) => {
                                        var tmp = mobiles;

                                        if (e.target.checked) {
                                            if (tmp.length <= 3) {
                                                tmp.push(refers[1].mobile2)
                                                setMobiles(tmp);
                                            }
                                        }
                                        else {
                                            tmp = tmp.filter(e => {
                                                return e !== refers[1].mobile2
                                            })
                                            setMobiles(tmp);
                                        }
                                    }} disabled={!refers[1].mobile2} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{refers[1].mobile2},

                                    <Checkbox onChange={(e) => {
                                        var tmp = mobiles;

                                        if (e.target.checked) {
                                            if (tmp.length <= 3) {
                                                tmp.push(refers[1].mobile3)
                                                setMobiles(tmp);
                                            }
                                        }
                                        else {
                                            tmp = tmp.filter(e => {
                                                return e !== refers[1].mobile3
                                            })
                                            setMobiles(tmp);
                                        }
                                    }} disabled={!refers[1].mobile3} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{refers[1].mobile3}


                                </STableCell>
                                <STableCell title='refer mobiles' style={{ width: '200px' }}>
                                    {mobiles.toString()}
                                </STableCell>
                            </STableRow>


                            <STableRow
                                key={3}
                            >


                                <STableCell title='city' style={{ width: '200px' }}>
                                    {refers[0].city}
                                </STableCell>
                                <STableCell title='city' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetRefer({ ...targetRefer, city: refers[1].city })
                                        }
                                        else {
                                            setTartgetRefer({ ...targetRefer, city: refers[0].city })
                                        }
                                    }} disabled={!refers[1].city} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{refers[1].city}
                                </STableCell>
                                <STableCell title='city' style={{ width: '200px' }}>
                                    {targetRefer.city}
                                </STableCell>
                            </STableRow>
                            <STableRow
                                key={4}
                            >


                                <STableCell title='state' style={{ width: '200px' }}>
                                    {refers[0].state}
                                </STableCell>
                                <STableCell title='state' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetRefer({ ...targetRefer, state: refers[1].state })
                                        }
                                        else {
                                            setTartgetRefer({ ...targetRefer, state: refers[0].state })
                                        }
                                    }} disabled={!refers[1].state} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{refers[1].state}
                                </STableCell>
                                <STableCell title='state' style={{ width: '200px' }}>
                                    {targetRefer.state}
                                </STableCell>
                            </STableRow>


                            {/* address */}
                            <STableRow
                                key={8}
                            >

                                <STableCell title='address' style={{ width: '200px' }}>
                                    {refers[0].address && refers[0].address.slice(20).toString()}
                                </STableCell>
                                <STableCell title='address' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetRefer({ ...targetRefer, address: refers[1].address })
                                        }
                                        else {
                                            setTartgetRefer({ ...targetRefer, address: refers[0].address })
                                        }
                                    }} disabled={!refers[1].address} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{refers[1].address && refers[1].address.slice(20).toString()}
                                </STableCell>
                                <STableCell title='address' style={{ width: '200px' }}>
                                    {targetRefer.address && targetRefer.address.slice(20).toString()}
                                </STableCell>
                            </STableRow>

                            <STableRow key={9}>


                                <STableCell style={{ width: '200px' }}>

                                </STableCell>
                                <STableCell style={{ width: '200px' }}>

                                </STableCell>
                                <STableCell style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetRefer({ ...targetRefer, merge_assigned_refers: true })
                                        }
                                        else {
                                            setTartgetRefer({ ...targetRefer, merge_assigned_refers: false })
                                        }
                                    }} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" /> Merge Assigned Refers
                                </STableCell>

                            </STableRow>
                            <STableRow key={10}>


                                <STableCell style={{ width: '200px' }}>

                                </STableCell>
                                <STableCell style={{ width: '200px' }}>

                                </STableCell>
                                <STableCell style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetRefer({ ...targetRefer, merge_remarks: true })
                                        }
                                        else {
                                            setTartgetRefer({ ...targetRefer, merge_remarks: false })
                                        }
                                    }} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" /> Merge Remarks Data
                                </STableCell>
                            </STableRow>
                            <STableRow key={11}>


                                <STableCell style={{ width: '200px' }}>

                                </STableCell>
                                <STableCell style={{ width: '200px' }}>

                                </STableCell>
                                <STableCell style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetRefer({ ...targetRefer, merge_bills: true })
                                        }
                                        else {
                                            setTartgetRefer({ ...targetRefer, merge_bills: false })
                                        }
                                    }} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" /> Merge Bills Data
                                </STableCell>
                            </STableRow>
                        </STableBody>

                    </STable>
                </Stack>

            </DialogContent>
            <DialogActions>
                <Button
                    disabled={isLoading}
                    onClick={() => {
                        let refer = targetRefer;
                        refer.mobiles = mobiles;
                        if (mobiles.length == 0) {
                            alert("one mobile is required at least")
                        }
                        mutate({ id: refers[0]._id, body: targetRefer })
                        setDialog(undefined)
                    }} fullWidth variant='contained'>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default MergeTwoRefersDialog