import { CreateOrEditExcelDbRemarkDto, GetExcelDBRemarksDto } from "../dtos";
import { apiClient } from "./utils/AxiosInterceptor";


export const GetExcelDbReport = async (category: string) => {
    return await apiClient.get(`excel-db/?category=${category}`)
}


export const CreateExcelDBFromExcel = async (body: FormData) => {
    return await apiClient.post(`excel-db`, body)
}


export const GetSalesManLeavesReports = async () => {
    return await apiClient.get(`salesman-leaves/report`)
}

export const BulkSalesManLeavesReportFromExcel = async (body: FormData) => {
    return await apiClient.post(`create-salesman-leaves-from-excel`, body)
}

export const CreateOrEditExcelDbRemark = async ({ body, remark }: {
    body: CreateOrEditExcelDbRemarkDto,
    remark?: GetExcelDBRemarksDto

}) => {
    if (!remark) {
        return await apiClient.post(`excel-db/remarks`, body)
    }
    return await apiClient.put(`excel-db/remarks/${remark._id}`, body)
}

export const DeleteExcelDBRemark = async (id: string) => {
    return await apiClient.delete(`excel-db/remarks/${id}`)
}

export const GetExcelDBRemarksHistory = async (id: string, obj: string) => {
    return await apiClient.get(`excel-db/remarks/${id}/?obj=${obj}`)
}

