import { CreateOrEditSalesAttendanceDto } from "../dtos/AttendanceDto"
import { CreateOrEditVisitSummaryRemarkDto, CreateOrEditReferenceRemarkDto, CreateOrEditAgeingRemarkDto } from "../dtos/SalesDto"
import { GetVisitSummaryReportRemarkDto, GetReferenceRemarksDto, GetAgeingRemarkDto } from "../dtos/SalesDto"
import { apiClient } from "./utils/AxiosInterceptor"

export class SalesService {
    public async GetSalesmanVisit({ date }: { date: string }) {
        return await apiClient.get(`salesman-visit/?date=${date}`)
    }
    public async GetSalesmanKpis({ start_date, end_date, id }: { start_date?: string, end_date?: string, id?: string }) {
        if (id)
            return await apiClient.get(`salesman/kpi/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        else
            return await apiClient.get(`salesman/kpi/?start_date=${start_date}&end_date=${end_date}`)

    }
    public async GetSalesmanAutoVisitReports({ start_date, end_date, id }: { start_date?: string, end_date?: string, id?: string }) {
        if (id)
            return await apiClient.get(`attendances/auto-reports/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        else
            return await apiClient.get(`attendances/auto-reports/?start_date=${start_date}&end_date=${end_date}`)

    }
    public async GetVisitReports({ employee }: { employee: string }) {
        return await apiClient.get(`visit-reports/?employee=${employee}`)
    }
    public async CreateOrEditVisitReportRemark({ body, remark }: {
        body: CreateOrEditVisitSummaryRemarkDto,
        remark?: GetVisitSummaryReportRemarkDto

    }) {
        if (!remark) {
            return await apiClient.post(`visit/remarks`, body)
        }
        return await apiClient.put(`visit/remarks/${remark._id}`, body)
    }
    public async DeleteVisitReportRemark(id: string) {
        return await apiClient.delete(`visit/remarks/${id}`)
    }
    public async GetVisitReportRemarksHistory(employee: string, date: string) {
        return await apiClient.get(`visit/remarks/?date=${date}&employee=${employee}`)
    }
    public async GetSalesmanAttendances({  start_date, end_date, id }: {start_date?: string, end_date?: string, id?: string }) {
        if (id)
            return await apiClient.get(`attendances/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        else
            return await apiClient.get(`attendances/?start_date=${start_date}&end_date=${end_date}`)

    }
    public async CreateOrEditSalesmanAttendance({ id, body }: {
        body: CreateOrEditSalesAttendanceDto, id?: string

    }) {
        if (id)
            return await apiClient.put(`attendances/${id}`, body);
        return await apiClient.post(`attendances`, body);
    }
    public async DeleteSalesManAttendance(id: string) {
        return await apiClient.delete(`attendances/${id}`)
    }
    public async GetAllReferences(hidden: boolean) {
        return await apiClient.get(`references/?hidden=${hidden}`)
    }
    public async GetAllSalesmanReferences() {
        return await apiClient.get(`references/salesman`)
    }
    public async CreateOrUpdateReferencesFromExcel(body: FormData) {
        return await apiClient.post(`create-references-from-excel`, body)
    }
    public async EditReferenceState({ body }: { body: { gst: string, state: string } }) {
        return await apiClient.post(`references/edit`, body)
    }

    public async CreateOrEditReferenceRemark({ body, remark }: {
        body: CreateOrEditReferenceRemarkDto,
        remark?: GetReferenceRemarksDto

    }) {
        if (!remark) {
            return await apiClient.post(`references/remarks`, body)
        }
        return await apiClient.put(`references/remarks/${remark._id}`, body)
    }
    public async DeleteReferenceRemark(id: string) {
        return await apiClient.delete(`references/remarks/${id}`)
    }
    public async GetReferenceRemarksHistory(party: string) {
        return await apiClient.get(`references/remarks/?party=${party}`)
    }
    public async GetSalesManLeavesReports() {
        return await apiClient.get(`salesman-leaves/report`)
    }
    public async BulkSalesManLeavesReportFromExcel(body: FormData) {
        return await apiClient.post(`create-salesman-leaves-from-excel`, body)
    }
    public async GetCollectionReports({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`collections/?start_date=${start_date}&end_date=${end_date}`)
    }
    public async CreateCollectionsReportFromExcel(body: FormData) {
        return await apiClient.post(`create-collections-from-excel`, body)
    }
    public async GetSalesReports({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`sales/?start_date=${start_date}&end_date=${end_date}`)
    }
    public async CreateSalesReportFromExcel(body: FormData) {
        return await apiClient.post(`create-sales-from-excel`, body)
    }
    public async GetAgeingReports({ hidden }: { hidden?: boolean }) {
        return await apiClient.get(`ageing/?hidden=${hidden}`)
    }
    public async CreateAgeingReportFromExcel(body: FormData) {
        return await apiClient.post(`create-ageing-from-excel`, body)
    }
    public async CreateOrEditAgeingRemark({ body, remark }: {
        body: CreateOrEditAgeingRemarkDto,
        remark?: GetAgeingRemarkDto

    }) {
        if (!remark) {
            return await apiClient.post(`ageing-remark`, body)
        }
        return await apiClient.put(`ageing-remark/${remark._id}`, body)
    }
    public async DeleteAgeingRemark(id: string) {
        return await apiClient.delete(`ageing-remark/${id}`)
    }
    public async GetAgeingRemarksHistory(party: string) {
        return await apiClient.get(`ageing-remark/?party=${encodeURIComponent(party)}`)
    }
}
 