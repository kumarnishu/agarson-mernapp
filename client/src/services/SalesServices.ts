import { CreateOrEditSalesAttendanceDto } from "../dtos/sales-attendance.dto"
import { CreateOrEditVisitSummaryRemarkDto, GetVisitSummaryReportRemarkDto } from "../dtos/visit_remark.dto"
import { apiClient } from "./utils/AxiosInterceptor"


export const GetSalesmanVisit = async ({ date }: { date: string }) => {
    return await apiClient.get(`salesman-visit/?date=${date}`)
}

export const GetSalesmanKpis = async ({  start_date, end_date, id }: { start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`salesman/kpi/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
    else
        return await apiClient.get(`salesman/kpi/?start_date=${start_date}&end_date=${end_date}`)

}


export const GetSalesmanAutoVisitReports = async ({ start_date, end_date, id }: { start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`visit/auto-reports/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
    else
        return await apiClient.get(`visit/auto-reports/?start_date=${start_date}&end_date=${end_date}`)

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


export const GetSalesmanAttendances = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`attendances/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`attendances/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

}


export const CreateOrEditSalesmanAttendance = async ({ id, body }: {
    body: CreateOrEditSalesAttendanceDto, id?: string

}) => {
    if (id)
        return await apiClient.put(`attendances/${id}`, body);
    return await apiClient.post(`attendances`, body);
}

export const DeleteSalesManAttendance= async (id: string) => {
    return await apiClient.delete(`attendances/${id}`)
}