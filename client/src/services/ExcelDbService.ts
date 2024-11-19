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