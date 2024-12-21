import { CreateOrEditExcelDbRemarkDto, GetExcelDBRemarksDto } from "../dtos/excel-db-remark.dto";
import { apiClient } from "./utils/AxiosInterceptor";

export class ExcelReportsService {
   

    public async GetExcelDbReport(category: string, hidden: boolean) {
        return await apiClient.get(`excel-db/?category=${category}&hidden=${hidden}`)
    }


    public async CreateExcelDBFromExcel(body: FormData) {
        return await apiClient.post(`excel-db`, body)
    }


    public async GetSalesManLeavesReports() {
        return await apiClient.get(`salesman-leaves/report`)
    }

    public async BulkSalesManLeavesReportFromExcel(body: FormData) {
        return await apiClient.post(`create-salesman-leaves-from-excel`, body)
    }

    public async CreateOrEditExcelDbRemark({ body, remark }: {
        body: CreateOrEditExcelDbRemarkDto,
        remark?: GetExcelDBRemarksDto

    }) {
        if (!remark) {
            return await apiClient.post(`excel-db/remarks`, body)
        }
        return await apiClient.put(`excel-db/remarks/${remark._id}`, body)
    }

    public async DeleteExcelDBRemark(id: string) {
        return await apiClient.delete(`excel-db/remarks/${id}`)
    }

    public async GetExcelDBRemarksHistory(id: string, obj: string) {
        return await apiClient.get(`excel-db/remarks/${id}/?obj=${encodeURIComponent(obj)}`)
    }

}