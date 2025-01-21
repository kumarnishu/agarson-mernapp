import { apiClient } from "./utils/AxiosInterceptor";

export class ExcelReportsService {
    public async GetExcelDbReport(category: string, hidden: boolean) {
        return await apiClient.get(`excel-db/?category=${category}&hidden=${hidden}`)
    }
    public async CreateExcelDBFromExcel(body: FormData) {
        return await apiClient.post(`excel-db`, body)
    }
   
    public async DeleteExcelDBRemark(id: string) {
        return await apiClient.delete(`excel-db/remarks/${id}`)
    }
    public async GetExcelDBRemarksHistory(id: string, obj: string) {
        return await apiClient.get(`excel-db/remarks/${id}/?obj=${encodeURIComponent(obj)}`)
    }

}