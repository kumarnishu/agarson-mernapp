import { CreateOrEditVisitSummaryRemarkDto, GetVisitSummaryReportRemarkDto } from "../dtos"
import { apiClient } from "./utils/AxiosInterceptor"


export const GetSalesmanVisit = async ({ date }: { date: string }) => {
    return await apiClient.get(`salesman-visit/?date=${date}`)
}

export const GetVisitReports = async ({ employee }: { employee: string }) => {
    return await apiClient.get(`visit-reports/?employee=${employee}`)
}

export const CreateOrEditVisitReportRemark = async ({ body, remark }: {
    body: CreateOrEditVisitSummaryRemarkDto,
    remark?: GetVisitSummaryReportRemarkDto

}) => {
    if (!remark) {
        return await apiClient.post(`visit/remarks`, body)
    }
    return await apiClient.put(`visit/remarks/${remark._id}`, body)
}

export const DeleteVisitReportRemark = async (id: string) => {
    return await apiClient.delete(`visit/remarks/${id}`)
}

export const GetVisitReportRemarksHistory = async (employee: string,date: string) => {
    return await apiClient.get(`visit/remarks/?date=${date}&employee=${employee}`)
}
