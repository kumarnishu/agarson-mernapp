import { Dialog, DialogContent, DialogActions, IconButton, DialogTitle, Stack, Checkbox, Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Cancel } from '@mui/icons-material'
import { STable, STableBody, STableCell, STableHead, STableHeadCell, STableRow } from '../../styled/STyledTable'
import { AxiosResponse } from 'axios'
import {  useMutation } from 'react-query'
import { BackendError } from '../../..'
import { queryClient } from '../../../main'
import { AlertContext } from '../../../contexts/alertContext'
import { CrmService } from '../../../services/CrmService'
import { GetLeadDto } from '../../../dtos/response/CrmDto'
import { CreateOrEditMergeLeadsDto } from '../../../dtos/request/CrmDto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    leads: GetLeadDto[], removeSelectedLeads: () => void
}

function MergeTwoLeadsDialog({ leads, removeSelectedLeads, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const [mobiles, setMobiles] = useState<string[]>([]);
    const [targetLead, setTartgetLead] = useState<CreateOrEditMergeLeadsDto>({
        name: leads[0].name,
        mobiles: mobiles,
        city: leads[0].city,
        state: leads[0].state,
        stage: leads[0].stage,
        email: leads[0].email,
        alternate_email: leads[0].alternate_email,
        address: leads[0].address,
        merge_refer: true,
        merge_bills: true,
        merge_remarks: true,
        source_lead_id: leads[1]._id
    })

    const { mutate, isLoading} = useMutation
        <AxiosResponse<GetLeadDto>, BackendError, { body: CreateOrEditMergeLeadsDto, id: string }>
        (new CrmService(). MergeTwoLeads, {
            onSuccess: () => {
                removeSelectedLeads()
                queryClient.invalidateQueries('leads')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        },)


    useEffect(() => {
        if (leads) {
            let tmp = [leads[0].mobile]
            if (leads[0].alternate_mobile1) {
                tmp.push(leads[0].alternate_mobile1);
            }
            if (leads[0].alternate_mobile2) {
                tmp.push(leads[0].alternate_mobile2);
            }
            setMobiles(tmp);
        }
    }, [leads])

    return (
        <Dialog fullScreen
            open={dialog === "MergeTwoLeadsDialog"}
            onClose={() => setDialog(undefined)}
        >
           
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ textAlign: 'center', minWidth: '350px' }}>{`Merging Source into Target Lead `}</DialogTitle>
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


                                <STableCell title='lead name' style={{ width: '200px' }}>
                                    {leads[0].name}
                                </STableCell>
                                <STableCell title='lead name' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetLead({ ...targetLead, name: leads[1].name })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, name: leads[0].name })
                                        }
                                    }} disabled={!leads[1].name} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].name}
                                </STableCell>
                                <STableCell title='lead name' style={{ width: '200px' }}>
                                    {targetLead.name}
                                </STableCell>
                            </STableRow>
                            <STableRow
                                key={2}
                            >


                                <STableCell title='lead mobiles' style={{ width: '200px' }}>
                                    {leads[0].mobile}
                                    {leads[0].alternate_mobile1 ? ` | ${leads[0].alternate_mobile1}` : ""}
                                    {leads[0].alternate_mobile2 ? ` | ${leads[0].alternate_mobile2}` : ""}
                                </STableCell>
                                <STableCell title='lead mobiles' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        var tmp = mobiles;

                                        if (e.target.checked) {
                                            if (tmp.length <= 3) {
                                                tmp.push(leads[1].mobile)
                                                setMobiles(tmp);
                                            }
                                        }
                                        else {
                                            tmp = tmp.filter(e => {
                                                return e !== leads[1].mobile
                                            })
                                            setMobiles(tmp);
                                        }
                                    }} disabled={!leads[1].mobile} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].mobile},
                                    <Checkbox onChange={(e) => {
                                        var tmp = mobiles;

                                        if (e.target.checked) {
                                            if (tmp.length <= 3) {
                                                tmp.push(leads[1].alternate_mobile1)
                                                setMobiles(tmp);
                                            }
                                        }
                                        else {
                                            tmp = tmp.filter(e => {
                                                return e !== leads[1].alternate_mobile1
                                            })
                                            setMobiles(tmp);
                                        }
                                    }} disabled={!leads[1].alternate_mobile1} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].alternate_mobile1},

                                    <Checkbox onChange={(e) => {
                                        var tmp = mobiles;

                                        if (e.target.checked) {
                                            if (tmp.length <= 3) {
                                                tmp.push(leads[1].alternate_mobile2)
                                                setMobiles(tmp);
                                            }
                                        }
                                        else {
                                            tmp = tmp.filter(e => {
                                                return e !== leads[1].alternate_mobile2
                                            })
                                            setMobiles(tmp);
                                        }
                                    }} disabled={!leads[1].alternate_mobile2} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].alternate_mobile2}


                                </STableCell>
                                <STableCell title='lead mobiles' style={{ width: '200px' }}>
                                    {mobiles.toString()}
                                </STableCell>
                            </STableRow>


                            <STableRow
                                key={3}
                            >


                                <STableCell title='city' style={{ width: '200px' }}>
                                    {leads[0].city}
                                </STableCell>
                                <STableCell title='city' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetLead({ ...targetLead, city: leads[1].city })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, city: leads[0].city })
                                        }
                                    }} disabled={!leads[1].city} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].city}
                                </STableCell>
                                <STableCell title='city' style={{ width: '200px' }}>
                                    {targetLead.city}
                                </STableCell>
                            </STableRow>
                            <STableRow
                                key={4}
                            >


                                <STableCell title='state' style={{ width: '200px' }}>
                                    {leads[0].state}
                                </STableCell>
                                <STableCell title='state' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetLead({ ...targetLead, state: leads[1].state })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, state: leads[0].state })
                                        }
                                    }} disabled={!leads[1].state} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].state}
                                </STableCell>
                                <STableCell title='state' style={{ width: '200px' }}>
                                    {targetLead.state}
                                </STableCell>
                            </STableRow>
                            <STableRow
                                key={5}
                            >


                                <STableCell title='lead stage' style={{ width: '200px' }}>
                                    {leads[0].stage}
                                </STableCell>
                                <STableCell title='lead stage' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetLead({ ...targetLead, stage: leads[1].stage })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, stage: leads[0].stage })
                                        }
                                    }} disabled={!leads[1].stage} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].stage}
                                </STableCell>
                                <STableCell title='lead stage' style={{ width: '200px' }}>
                                    {targetLead.stage}
                                </STableCell>
                            </STableRow> <STableRow
                                key={6}
                            >


                                <STableCell title='email' style={{ width: '200px' }}>
                                    {leads[0].email}
                                </STableCell>
                                <STableCell title='email' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetLead({ ...targetLead, email: leads[1].email })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, email: leads[0].email })
                                        }
                                    }} disabled={!leads[1].email} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].email}
                                </STableCell>
                                <STableCell title='email' style={{ width: '200px' }}>
                                    {targetLead.email}
                                </STableCell>
                            </STableRow>
                            <STableRow
                                key={7}
                            >


                                <STableCell title='alternate email' style={{ width: '200px' }}>
                                    {leads[0].alternate_email}
                                </STableCell>
                                <STableCell title='alternate email' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetLead({ ...targetLead, alternate_email: leads[1].alternate_email })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, alternate_email: leads[0].alternate_email })
                                        }
                                    }} disabled={!leads[1].alternate_email} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].alternate_email}
                                </STableCell>
                                <STableCell title='email' style={{ width: '200px' }}>
                                    {targetLead.alternate_email}
                                </STableCell>
                            </STableRow>

                            {/* address */}
                            <STableRow
                                key={8}
                            >

                                <STableCell title='address' style={{ width: '200px' }}>
                                    {leads[0].address && leads[0].address.slice(20).toString()}
                                </STableCell>
                                <STableCell title='address' style={{ width: '200px' }}>
                                    <Checkbox onChange={(e) => {
                                        if (e.target.checked) {
                                            setTartgetLead({ ...targetLead, address: leads[1].address })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, address: leads[0].address })
                                        }
                                    }} disabled={!leads[1].address} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" />{leads[1].address && leads[1].address.slice(20).toString()}
                                </STableCell>
                                <STableCell title='address' style={{ width: '200px' }}>
                                    {targetLead.address && targetLead.address.slice(20).toString()}
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
                                            setTartgetLead({ ...targetLead, merge_refer: true })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, merge_refer: false })
                                        }
                                    }} disabled={!leads[1].referred_party_name} sx={{ width: 16, height: 16 }}
                                        indeterminate={false}
                                        size="small" /> Merge Refer Data
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
                                            setTartgetLead({ ...targetLead, merge_remarks: true })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, merge_remarks: false })
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
                                            setTartgetLead({ ...targetLead, merge_bills: true })
                                        }
                                        else {
                                            setTartgetLead({ ...targetLead, merge_bills: false })
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
                        let lead = targetLead;
                        lead.mobiles = mobiles;
                        if (mobiles.length == 0) {
                            alert("one mobile is required at least")
                        }
                        mutate({ id: leads[0]._id, body: targetLead })
                        setDialog(undefined)
                    }} fullWidth variant='contained'>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default MergeTwoLeadsDialog