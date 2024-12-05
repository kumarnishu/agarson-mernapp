import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../contexts/userContext'
import AlertBar from '../../snacks/AlertBar'
import ExportToExcel from '../../../utils/ExportToExcel'
import { Cancel } from '@mui/icons-material'
import { STable, STableBody, STableCell, STableHead, STableHeadCell, STableRow } from '../../styled/STyledTable'
import { DownloadFile } from '../../../utils/DownloadFile'
import { GetAllReferrals } from '../../../services/LeadsServices'
import { AxiosResponse } from 'axios'
import { useQuery } from 'react-query'
import { BackendError } from '../../..'
import { GetActivitiesOrRemindersDto } from '../../../dtos/crm-remarks.dto'
import { GetLeadFromExcelDto } from '../../../dtos/lead.dto'
import { GetReferDto } from '../../../dtos/refer.dto'
type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    refer: GetReferDto
}
function AllReferralPageDialog({ refer, dialog, setDialog }: Props) {
    const [selectedData, setSelectedData] = useState<GetLeadFromExcelDto[]>([])
    const { user: LoggedInUser } = useContext(UserContext)
    const [sent, setSent] = useState(false)
    const [leads, setLeads] = useState<GetActivitiesOrRemindersDto[]>([])

    const { data, isLoading, isSuccess, refetch } = useQuery<AxiosResponse<GetActivitiesOrRemindersDto[]>, BackendError>(["assigned_leads", refer], async () => GetAllReferrals({ refer: refer }))


    function handleExcel() {
        try {
            ExportToExcel(selectedData, "referral_leads")
            setSent(true)
            setSelectedData([])
        }
        catch (err) {
            console.log(err)
            setSent(false)
        }
    }

    useEffect(() => {
        refetch()
    }, [refer])

    useEffect(() => {
        if (isSuccess && data) {
            setLeads(data.data)
        }
    }, [isSuccess, data])


    useEffect(() => {
        let tmpdata: GetLeadFromExcelDto[] = []
        tmpdata = leads.map((lead) => {
            return (
                {
                    _id: lead._id,
                    name: lead.name,
                    customer_name: lead.customer_name,
                    customer_designation: lead.customer_designation,
                    mobile: lead.mobile,
                    gst: lead.gst,
                    email: lead.email,
                    city: lead.city,
                    state: lead.state,
                    country: lead.country,
                    address: lead.address,
                    work_description: lead.work_description,
                    turnover: lead.turnover,
                    alternate_mobile1: lead.alternate_mobile1,
                    alternate_mobile2: lead.alternate_mobile2,
                    alternate_email: lead.alternate_email,
                    lead_type: lead.lead_type,
                    stage: lead.stage,
                    lead_source: lead.lead_source
                })
        })
        setSelectedData(tmpdata)
    }, [])


    return (
        <Dialog fullScreen
            open={dialog === 'AllReferralPageDialog'}
            onClose={() => setDialog(undefined)}
        >
            {isLoading && <LinearProgress />}
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>Referrals

                {LoggedInUser?.is_admin && <Button variant="text" color="success"
                    onClick={() => {
                        handleExcel()
                    }}
                >     Export To Excel</Button>}
            </DialogTitle>
            <DialogContent>


                {sent && <AlertBar message="File Exported Successfuly" color="success" />}


                <Box sx={{
                    overflow: "auto",
                    height: '70vh'
                }}>
                    <STable
                    >
                        <STableHead
                        >
                            <STableRow>

                                <STableHeadCell
                                >

                                    Last Remark

                                </STableHeadCell>

                                <STableHeadCell
                                >

                                    Next Call

                                </STableHeadCell>
                                <STableHeadCell
                                >

                                    Stage

                                </STableHeadCell>

                                <STableHeadCell
                                >

                                    Visiting Card Status

                                </STableHeadCell>
                                <STableHeadCell
                                >

                                    Lead Name

                                </STableHeadCell>






                                <STableHeadCell
                                >

                                    Mobile

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    Mobile2

                                </STableHeadCell>

                                <STableHeadCell
                                >

                                    Mobile3

                                </STableHeadCell>



                                <STableHeadCell
                                >

                                    City

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    State

                                </STableHeadCell>
                                <STableHeadCell
                                >

                                    GST

                                </STableHeadCell>
                                <STableHeadCell
                                >

                                    Lead Type

                                </STableHeadCell>




                                <STableHeadCell
                                >

                                    TurnOver

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    Work Description

                                </STableHeadCell>

                                <STableHeadCell
                                >

                                    Customer Name

                                </STableHeadCell>

                                <STableHeadCell
                                >

                                    Customer Desigination

                                </STableHeadCell>




                                <STableHeadCell
                                >

                                    Refer Party

                                </STableHeadCell>

                                <STableHeadCell
                                >

                                    Refer Party Mobile

                                </STableHeadCell>

                                <STableHeadCell
                                >

                                    Refer Date

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    Email

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    Email2

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    Address

                                </STableHeadCell>




                                <STableHeadCell
                                >

                                    lead Source

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    Country

                                </STableHeadCell>


                                <STableHeadCell
                                >

                                    Created At

                                </STableHeadCell>




                                <STableHeadCell
                                >

                                    Visiting Card

                                </STableHeadCell>
                            </STableRow>
                        </STableHead>
                        <STableBody >
                            {

                                leads && leads.map((remark, index) => {
                                    return (
                                        <STableRow key={index}>
                                            <STableCell>
                                                {remark.remark}

                                            </STableCell>
                                            <STableCell>
                                                {remark.created_at}

                                            </STableCell>
                                            <STableCell>
                                                {remark.stage}
                                            </STableCell>
                                            <STableCell>
                                                {remark.has_card ? "Has visiting card" : "na"}
                                            </STableCell>

                                            <STableCell style={{ fontWeight: remark.visiting_card && remark.visiting_card && 'bold' }} title={remark.visiting_card && remark.visiting_card && 'This number has Visitng card Uploaded'}>
                                                {remark.name}
                                            </STableCell>







                                            <STableCell>
                                                {remark.mobile}
                                            </STableCell>


                                            <STableCell>
                                                {remark.alternate_mobile1}
                                            </STableCell>


                                            <STableCell>
                                                {remark.alternate_mobile2}
                                            </STableCell>
                                            <STableCell>
                                                {remark.city}
                                            </STableCell>


                                            <STableCell>
                                                {remark.state}
                                            </STableCell>

                                            <STableCell>

                                                {remark.gst}

                                            </STableCell>
                                            <STableCell>
                                                {remark.lead_type}
                                            </STableCell>

                                            <STableCell>
                                                {remark.turnover ? remark.turnover : 'na'}
                                            </STableCell>


                                            <STableCell>
                                                {remark.work_description ? remark.work_description.slice(0, 50) : ""}
                                            </STableCell>


                                            <STableCell>
                                                {remark.customer_name}
                                            </STableCell>


                                            <STableCell>
                                                {remark.customer_designation}
                                            </STableCell>




                                            <STableCell>
                                                {remark.referred_party_name && remark.referred_party_name}

                                            </STableCell>
                                            <STableCell>

                                                {remark.referred_party_mobile && remark.referred_party_mobile}

                                            </STableCell>


                                            <STableCell>
                                                {remark.referred_date &&
                                                    new Date(remark.referred_date).toLocaleString()}

                                            </STableCell>



                                            <STableCell>
                                                {remark.email}
                                            </STableCell>

                                            <STableCell>
                                                {remark.alternate_email}
                                            </STableCell>



                                            <STableCell >
                                                {remark.address ? remark.address.slice(0, 50) : "..."}

                                            </STableCell>
                                            <STableCell>
                                                {remark.lead_source}

                                            </STableCell>


                                            <STableCell>
                                                {remark.country}

                                            </STableCell>



                                            <STableCell>
                                                {new Date(remark.created_at).toLocaleString()}

                                            </STableCell>



                                            <STableCell
                                                title="double click to download"
                                                onDoubleClick={() => {
                                                    if (remark.visiting_card && remark.visiting_card) {
                                                        DownloadFile(remark.visiting_card, "visiting card")
                                                    }
                                                }}>
                                                {remark.visiting_card && remark.visiting_card ? < img height="20" width="55" src={remark.visiting_card && remark.visiting_card} alt="visiting card" /> : "na"}
                                            </STableCell>
                                        </STableRow>
                                    )
                                })

                            }
                        </STableBody>
                    </STable>
                </Box >

            </DialogContent>

        </Dialog>
    )
}

export default AllReferralPageDialog